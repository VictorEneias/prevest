/**
 * Posiciona o grafo de conceitos. Roda no BUILD.
 *
 * A ordem é de DEPENDÊNCIA, não de calendário escolar (ver curriculo.ts):
 * a profundidade de um módulo é quantos módulos você atravessa até chegar nele.
 *
 * O objetivo do posicionamento horizontal é UM SÓ: desembaraçar o desenho.
 * Nada de aproximar módulos da mesma área — foi tentado, e a gravidade que
 * agrupava as áreas embolava as linhas. Aqui o x existe pra minimizar
 * cruzamento de seta com seta e de seta com módulo, e nada mais. A área é
 * comunicada por cor e rótulo.
 *
 * É o método clássico de Sugiyama, nos três passos:
 *   1. camadas por profundidade
 *   2. NÓS-PONTE: toda seta que pula mais de uma camada ganha pontos
 *      intermediários. É isso que impede a linha de passar por cima de um
 *      módulo — ela agora desvia por um corredor reservado. O corredor é do
 *      MÓDULO DE ORIGEM, não da seta: as setas longas que saem do mesmo lugar
 *      descem juntas e só se separam onde precisam.
 *   3. ordenação por mediana + transposição, guardando a melhor tentativa,
 *      e só então as coordenadas.
 *
 * A entrada é objeto simples, não CollectionEntry — assim dá pra rodar esta
 * função em node puro num teste de escala, sem subir o Astro.
 */
import { ordenarAreas, rotuloBloco, slotDeCor, type Materia } from './curriculo';

export interface ConceitoBruto {
  id: string;
  titulo: string;
  resumo?: string;
  materia: Materia;
  bloco: string;
  prereqs: string[];
  revisado: boolean;
}

export interface NoLayout extends ConceitoBruto {
  camada: number;
  slotCor: number;
  x: number;
  y: number;
  w: number;
  h: number;
  focado: boolean;
}

export interface ArestaLayout {
  de: string;
  para: string;
  d: string;
  /** A polilinha por onde a seta passa. Usada pelas métricas. */
  pontos: [number, number][];
}

export interface AreaLayout {
  bloco: string;
  materia: Materia;
  rotulo: string;
  slotCor: number;
}

export interface Mapa {
  nos: NoLayout[];
  arestas: ArestaLayout[];
  areas: AreaLayout[];
  largura: number;
  altura: number;
}

export const MEDIDAS = {
  noW: 156,
  noH: 52,
  gapX: 30,
  gapY: 80,
  /** Largura reservada pro corredor de uma seta que atravessa a camada. */
  ponteW: 22,
  /** Trecho reto abaixo do módulo onde as setas que saem dele andam juntas. */
  tronco: 10,
  pad: 46,
};

const M = MEDIDAS;
const passoY = M.noH + M.gapY;

/* ------------------------------------------------------------------ *
 * Redução transitiva
 * ------------------------------------------------------------------ */

/**
 * Pré-requisito que já vem por outro caminho é ruído no desenho.
 *
 * Se X depende de A e de B, e A já é pré-requisito de B, então a seta A→X não
 * acrescenta nada: quem chega em B já passou por A. A seta some do mapa e resta
 * só B→X. Vale pra qualquer quantidade de caminhos, não só dois.
 */
export function reduzirTransitivamente(conceitos: ConceitoBruto[]): {
  essenciais: Map<string, string[]>;
  redundantes: { id: string; prereq: string; via: string }[];
} {
  const porId = new Map(conceitos.map((c) => [c.id, c]));
  const memo = new Map<string, Set<string>>();
  const andando = new Set<string>();

  function ancestrais(id: string): Set<string> {
    const pronto = memo.get(id);
    if (pronto) return pronto;
    if (andando.has(id)) return new Set();
    andando.add(id);
    const fora = new Set<string>();
    for (const p of porId.get(id)?.prereqs ?? []) {
      if (!porId.has(p)) continue;
      fora.add(p);
      for (const a of ancestrais(p)) fora.add(a);
    }
    andando.delete(id);
    memo.set(id, fora);
    return fora;
  }

  const essenciais = new Map<string, string[]>();
  const redundantes: { id: string; prereq: string; via: string }[] = [];
  for (const c of conceitos) {
    const diretos = c.prereqs.filter((p) => porId.has(p));
    const ficam: string[] = [];
    for (const p of diretos) {
      const via = diretos.find((q) => q !== p && ancestrais(q).has(p));
      if (via) redundantes.push({ id: c.id, prereq: p, via });
      else ficam.push(p);
    }
    essenciais.set(c.id, ficam);
  }
  return { essenciais, redundantes };
}

/* ------------------------------------------------------------------ *
 * Vizinhança
 * ------------------------------------------------------------------ */

export function vizinhanca(
  conceitos: ConceitoBruto[],
  foco: string,
  raio: number,
): ConceitoBruto[] {
  const porId = new Map(conceitos.map((c) => [c.id, c]));
  if (!porId.has(foco)) return [];
  const { essenciais } = reduzirTransitivamente(conceitos);

  const adj = new Map<string, Set<string>>();
  const liga = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  for (const c of conceitos) {
    for (const p of essenciais.get(c.id) ?? []) {
      liga(c.id, p);
      liga(p, c.id);
    }
  }
  const dentro = new Set([foco]);
  let borda = [foco];
  for (let i = 0; i < raio; i++) {
    const proxima: string[] = [];
    for (const id of borda) {
      for (const v of adj.get(id) ?? []) {
        if (!dentro.has(v)) {
          dentro.add(v);
          proxima.push(v);
        }
      }
    }
    borda = proxima;
  }
  return conceitos.filter((c) => dentro.has(c.id));
}

/* ------------------------------------------------------------------ *
 * Layout
 * ------------------------------------------------------------------ */

interface Item {
  chave: string;
  real: boolean;
  c?: ConceitoBruto;
  camada: number;
  w: number;
  x: number;
}

/** Um trecho de seta entre duas camadas consecutivas. */
interface Trecho {
  a: Item;
  b: Item;
}

function mediana(v: number[]): number {
  if (!v.length) return -1;
  const s = [...v].sort((p, q) => p - q);
  const m = s.length >> 1;
  if (s.length % 2) return s[m];
  /* mediana ponderada de Gansner: pende pro lado mais apertado */
  if (s.length === 2) return (s[0] + s[1]) / 2;
  const esq = s[m - 1] - s[0];
  const dir = s[s.length - 1] - s[m];
  return (s[m - 1] * dir + s[m] * esq) / (esq + dir || 1);
}

export function calcularLayout(
  conceitos: ConceitoBruto[],
  opcoes: { foco?: string } = {},
): Mapa {
  if (!conceitos.length) {
    return { nos: [], arestas: [], areas: [], largura: 0, altura: 0 };
  }
  const porId = new Map(conceitos.map((c) => [c.id, c]));
  const { essenciais } = reduzirTransitivamente(conceitos);

  /* ---------- 1. camadas ---------- */
  const camadaDe = new Map<string, number>();
  const visitando = new Set<string>();
  function camada(id: string): number {
    const pronto = camadaDe.get(id);
    if (pronto !== undefined) return pronto;
    if (visitando.has(id)) return 0;
    visitando.add(id);
    let v = 0;
    for (const p of essenciais.get(id) ?? []) v = Math.max(v, camada(p) + 1);
    visitando.delete(id);
    camadaDe.set(id, v);
    return v;
  }
  conceitos.forEach((c) => camada(c.id));
  const nCamadas = Math.max(...conceitos.map((c) => camadaDe.get(c.id)!)) + 1;

  /* ---------- 2. nós-ponte ----------
     Toda seta que pula mais de uma camada vira uma corrente de pontos, um por
     camada intermediária. A ponte ocupa lugar na fila junto com os módulos, o
     que reserva um corredor: é por isso que a linha deixa de passar por cima
     de um módulo. Também é o que permite ao passo de ordenação enxergar a seta
     longa como várias curtas e desembaraçá-la. */
  const camadas: Item[][] = Array.from({ length: nCamadas }, () => []);
  const itemDe = new Map<string, Item>();
  for (const c of conceitos) {
    const it: Item = { chave: c.id, real: true, c, camada: camadaDe.get(c.id)!, w: M.noW, x: 0 };
    camadas[it.camada].push(it);
    itemDe.set(c.id, it);
  }

  const trechos: Trecho[] = [];
  const correntes: { de: string; para: string; pontes: Item[] }[] = [];

  /* O corredor é do MÓDULO DE ORIGEM, não da seta.
     Antes cada seta longa abria uma ponte só dela em cada camada, e quatro setas
     saindo do mesmo módulo desciam o mapa inteiro como quatro linhas paralelas,
     lado a lado, dizendo a mesma coisa quatro vezes. Agora todas as setas longas
     que saem de um módulo dividem UM ponto por camada: elas descem coladas, como
     um tronco só, e cada uma se desprende na camada do destino dela. */
  const corredorDe = new Map<string, Map<number, Item>>();
  const jaLigado = new Set<string>();
  const ligar = (a: Item, b: Item) => {
    const k = `${a.chave}»${b.chave}`;
    if (jaLigado.has(k)) return;
    jaLigado.add(k);
    trechos.push({ a, b });
  };

  for (const c of conceitos) {
    for (const p of essenciais.get(c.id) ?? []) {
      const origem = itemDe.get(p);
      const destino = itemDe.get(c.id);
      if (!origem || !destino) continue;
      let corredor = corredorDe.get(p);
      if (!corredor) {
        corredor = new Map();
        corredorDe.set(p, corredor);
      }
      const pontes: Item[] = [];
      let anterior = origem;
      for (let k = origem.camada + 1; k < destino.camada; k++) {
        let ponte = corredor.get(k);
        if (!ponte) {
          ponte = { chave: `§${p}@${k}`, real: false, camada: k, w: M.ponteW, x: 0 };
          camadas[k].push(ponte);
          corredor.set(k, ponte);
        }
        pontes.push(ponte);
        ligar(anterior, ponte);
        anterior = ponte;
      }
      ligar(anterior, destino);
      correntes.push({ de: p, para: c.id, pontes });
    }
  }

  /* ---------- 3. ordenação ----------
     Mediana + transposição, guardando a melhor tentativa. A ordem inicial é
     alfabética só pra ser determinística; a partir daí quem manda é o número
     de cruzamentos. */
  const ordem = new Map<string, number>();
  for (const camadaItens of camadas) {
    camadaItens.sort((a, b) =>
      (a.c?.titulo ?? a.chave).localeCompare(b.c?.titulo ?? b.chave, 'pt-BR'),
    );
    camadaItens.forEach((it, i) => ordem.set(it.chave, i));
  }
  const inicial = camadas.map((c) => c.map((it) => it.chave));

  const acima = new Map<string, Item[]>();
  const abaixo = new Map<string, Item[]>();
  for (const t of trechos) {
    acima.set(t.b.chave, [...(acima.get(t.b.chave) ?? []), t.a]);
    abaixo.set(t.a.chave, [...(abaixo.get(t.a.chave) ?? []), t.b]);
  }

  const trechosPorCamada: Trecho[][] = Array.from({ length: nCamadas }, () => []);
  for (const t of trechos) trechosPorCamada[t.a.camada].push(t);

  const contarEntre = (ci: number) => {
    const lista = trechosPorCamada[ci];
    let n = 0;
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        const p = lista[i];
        const q = lista[j];
        const da = ordem.get(p.a.chave)! - ordem.get(q.a.chave)!;
        const db = ordem.get(p.b.chave)! - ordem.get(q.b.chave)!;
        if (da * db < 0) n++;
      }
    }
    return n;
  };
  const contarTudo = () => {
    let n = 0;
    for (let i = 0; i < nCamadas - 1; i++) n += contarEntre(i);
    return n;
  };

  const salvar = () => camadas.map((c) => c.map((it) => it.chave));
  const restaurar = (snap: string[][]) => {
    snap.forEach((chaves, ci) => {
      const mapa = new Map(camadas[ci].map((it) => [it.chave, it]));
      camadas[ci] = chaves.map((k) => mapa.get(k)!);
      camadas[ci].forEach((it, i) => ordem.set(it.chave, i));
    });
  };

  let melhor = salvar();
  let melhorCruz = contarTudo();

  /* Várias partidas. O resultado da mediana depende da ordem inicial, então
     rodar de alguns pontos diferentes e ficar com o melhor sai bem mais barato
     que qualquer heurística mais esperta. O sorteio é semeado: mesmo build,
     mesmo mapa. */
  let semente = 20260812;
  const sorteio = () => ((semente = (semente * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  /* Teto de esforço: a transposição é quadrática no número de trechos, então
     um grafo grande precisa de menos partidas pra o build não arrastar. Com 71
     módulos (93 trechos) são 8 partidas e ~0,6 s. */
  const partidas = trechos.length > 400 ? 2 : trechos.length > 200 ? 4 : 8;

  for (let partida = 0; partida < partidas; partida++) {
    if (partida === 0) {
      restaurar(inicial);
    } else {
      const embaralhado = inicial.map((chaves) => {
        const v = [...chaves];
        for (let i = v.length - 1; i > 0; i--) {
          const j = Math.floor(sorteio() * (i + 1));
          [v[i], v[j]] = [v[j], v[i]];
        }
        return v;
      });
      restaurar(embaralhado);
    }
    otimizarOrdem();
  }
  restaurar(melhor);

  function otimizarOrdem() {
  for (let passada = 0; passada < 24; passada++) {
    /* mediana */
    const paraBaixo = passada % 2 === 0;
    const indices = paraBaixo
      ? [...camadas.keys()].slice(1)
      : [...camadas.keys()].slice(0, -1).reverse();
    for (const ci of indices) {
      const vizinhos = paraBaixo ? acima : abaixo;
      const chave = new Map<string, number>();
      for (const it of camadas[ci]) {
        const pos = (vizinhos.get(it.chave) ?? []).map((v) => ordem.get(v.chave)!);
        chave.set(it.chave, mediana(pos));
      }
      camadas[ci] = [...camadas[ci]].sort((a, b) => {
        const ma = chave.get(a.chave)!;
        const mb = chave.get(b.chave)!;
        if (ma < 0 && mb < 0) return ordem.get(a.chave)! - ordem.get(b.chave)!;
        if (ma < 0) return -1;
        if (mb < 0) return 1;
        return ma - mb;
      });
      camadas[ci].forEach((it, i) => ordem.set(it.chave, i));
    }

    /* transposição: troca vizinhos enquanto isso diminuir cruzamento */
    let mexeu = true;
    let voltas = 0;
    while (mexeu && voltas++ < 6) {
      mexeu = false;
      for (let ci = 0; ci < nCamadas; ci++) {
        for (let i = 0; i < camadas[ci].length - 1; i++) {
          const antes =
            (ci > 0 ? contarEntre(ci - 1) : 0) + (ci < nCamadas - 1 ? contarEntre(ci) : 0);
          const a = camadas[ci][i];
          const b = camadas[ci][i + 1];
          camadas[ci][i] = b;
          camadas[ci][i + 1] = a;
          ordem.set(b.chave, i);
          ordem.set(a.chave, i + 1);
          const depois =
            (ci > 0 ? contarEntre(ci - 1) : 0) + (ci < nCamadas - 1 ? contarEntre(ci) : 0);
          if (depois < antes) mexeu = true;
          else {
            camadas[ci][i] = a;
            camadas[ci][i + 1] = b;
            ordem.set(a.chave, i);
            ordem.set(b.chave, i + 1);
          }
        }
      }
    }

    const agora = contarTudo();
    if (agora < melhorCruz) {
      melhorCruz = agora;
      melhor = salvar();
    }
  }
  }

  /* ---------- 4. coordenadas ----------
     Cada item quer ficar na média dos vizinhos, respeitando um espaçamento
     mínimo. Isso é um problema de regressão isotônica, e tem solução EXATA
     (PAVA) — resolver por empurrão sucessivo, como eu tinha feito antes, incha
     o mapa: a varredura empurra pra direita e nada puxa de volta, e o
     acumulado deixou o desenho três vezes mais largo do que precisava.

     Corrente de ponte pesa mais que módulo: é o que mantém a seta longa reta
     em vez de serpenteando entre as camadas. */
  const folga = (a: Item, b: Item) =>
    a.real && b.real ? M.gapX : !a.real && !b.real ? 12 : 18;
  const sep = (a: Item, b: Item) => (a.w + b.w) / 2 + folga(a, b);

  /** z não-decrescente que minimiza Σ w(z−d)². Pool Adjacent Violators. */
  function isotonica(d: number[], w: number[]): number[] {
    const val: number[] = [];
    const peso: number[] = [];
    const qtd: number[] = [];
    for (let i = 0; i < d.length; i++) {
      let v = d[i];
      let p = w[i];
      let q = 1;
      while (val.length && val[val.length - 1] > v) {
        const pv = val.pop()!;
        const pp = peso.pop()!;
        const pq = qtd.pop()!;
        v = (v * p + pv * pp) / (p + pp);
        p += pp;
        q += pq;
      }
      val.push(v);
      peso.push(p);
      qtd.push(q);
    }
    const out: number[] = [];
    val.forEach((v, i) => {
      for (let k = 0; k < qtd[i]; k++) out.push(v);
    });
    return out;
  }

  /* Quanto o item cede da posição ideal em nome de não abrir vão.
     Sem isso o baricentro espalha: em 0, a camada 1 abria 2040px pra 6 módulos.
     Calibrado medindo, no currículo de 71 módulos:

       peso   largura   desvio médio   comprimento total das setas
       0       2414        115px            35457
       0.15    2134        112px            34152   ← menor os três
       0.30    2109        113px            34154
       0.60    2097        118px            35212

     Cruzamento e sobreposição não mudam com esse peso (a ordem já está fixada
     na etapa anterior), então dá pra escolher só por largura e retidão. */
  const PESO_COMPACTA = 0.15;

  const compactar = (camadaItens: Item[], desejado: Map<string, number>) => {
    const acumulado: number[] = [0];
    for (let i = 1; i < camadaItens.length; i++) {
      acumulado[i] = acumulado[i - 1] + sep(camadaItens[i - 1], camadaItens[i]);
    }
    /* alvo alternativo: tudo encostado, centrado na média dos desejos */
    const desejos = camadaItens.map((it, i) => desejado.get(it.chave) ?? it.x);
    const centroDesejo = desejos.reduce((s, v) => s + v, 0) / desejos.length;
    const centroPacote = acumulado.reduce((s, v) => s + v, 0) / acumulado.length;
    const deslocaPacote = centroDesejo - centroPacote;

    const d = camadaItens.map((it, i) => {
      const ideal = desejos[i];
      const junto = acumulado[i] + deslocaPacote;
      return (1 - PESO_COMPACTA) * ideal + PESO_COMPACTA * junto - acumulado[i];
    });
    const w = camadaItens.map((it) =>
      desejado.has(it.chave) ? (it.real ? 1 : 2.5) : 0.05,
    );
    const z = isotonica(d, w);
    camadaItens.forEach((it, i) => (it.x = z[i] + acumulado[i]));
  };

  /* posição inicial: encostadas, na ordem escolhida */
  for (const camadaItens of camadas) {
    let acc = 0;
    for (let i = 0; i < camadaItens.length; i++) {
      if (i > 0) acc += sep(camadaItens[i - 1], camadaItens[i]);
      camadaItens[i].x = acc;
    }
  }

  for (let volta = 0; volta < 16; volta++) {
    const paraBaixo = volta % 2 === 0;
    const indices = paraBaixo
      ? [...camadas.keys()].slice(1)
      : [...camadas.keys()].slice(0, -1).reverse();
    for (const ci of indices) {
      const vizinhos = paraBaixo ? acima : abaixo;
      const desejado = new Map<string, number>();
      for (const it of camadas[ci]) {
        const vs = vizinhos.get(it.chave) ?? [];
        if (vs.length) desejado.set(it.chave, vs.reduce((s, v) => s + v.x, 0) / vs.length);
      }
      compactar(camadas[ci], desejado);
    }
    /* reancora a cada volta pra não acumular deriva */
    const esq = Math.min(...camadas.flat().map((it) => it.x - it.w / 2));
    for (const it of camadas.flat()) it.x -= esq;
  }

  /* centra as camadas estreitas na largura final */
  const larguraUtil = Math.max(...camadas.flat().map((it) => it.x + it.w / 2));
  for (const camadaItens of camadas) {
    if (!camadaItens.length) continue;
    const a = camadaItens[0].x - camadaItens[0].w / 2;
    const b = camadaItens[camadaItens.length - 1].x + camadaItens[camadaItens.length - 1].w / 2;
    const desloca = (larguraUtil - (b - a)) / 2 - a;
    for (const it of camadaItens) it.x += desloca;
  }
  for (const it of camadas.flat()) it.x += M.pad;

  const yDaCamada = (ci: number) => M.pad + ci * passoY;

  /* ---------- 5. saída ---------- */
  const nos: NoLayout[] = [];
  for (const camadaItens of camadas) {
    for (const it of camadaItens) {
      if (!it.real || !it.c) continue;
      nos.push({
        ...it.c,
        camada: it.camada,
        slotCor: slotDeCor(it.c.materia, it.c.bloco),
        x: it.x - M.noW / 2,
        y: yDaCamada(it.camada),
        w: M.noW,
        h: M.noH,
        focado: it.c.id === opcoes.foco,
      });
    }
  }

  /* Quantas setas saem de cada módulo — quem tem mais de uma ganha tronco. */
  const saidas = new Map<string, number>();
  for (const corrente of correntes) {
    saidas.set(corrente.de, (saidas.get(corrente.de) ?? 0) + 1);
  }

  const arestas: ArestaLayout[] = [];
  for (const corrente of correntes) {
    const origem = itemDe.get(corrente.de)!;
    const destino = itemDe.get(corrente.para)!;
    /* Cada ponte contribui DOIS pontos, no topo e na base da faixa dela. Assim
       a linha atravessa a faixa dos módulos na vertical, dentro do corredor que
       a ponte reservou, e todo o desvio horizontal acontece no vão entre
       camadas, que é vazio. Com um ponto só, no centro da faixa, o trecho
       varria na diagonal por dentro da fileira e raspava os módulos vizinhos. */
    const base = yDaCamada(origem.camada) + M.noH;
    const pontos: [number, number][] = [
      [origem.x, base],
      /* Tronco: as setas que saem juntas descem um trecho reto ANTES de abrir o
         leque. Como o trecho é idêntico nas irmãs, elas se sobrepõem exatamente
         e o que se vê é uma linha só saindo do módulo, que só então bifurca. */
      ...((saidas.get(corrente.de) ?? 0) > 1
        ? ([[origem.x, base + M.tronco]] as [number, number][])
        : []),
      ...corrente.pontes.flatMap(
        (p) =>
          [
            [p.x, yDaCamada(p.camada)],
            [p.x, yDaCamada(p.camada) + M.noH],
          ] as [number, number][],
      ),
      [destino.x, yDaCamada(destino.camada)],
    ];
    let d = `M ${pontos[0][0].toFixed(1)} ${pontos[0][1].toFixed(1)}`;
    for (let i = 1; i < pontos.length; i++) {
      const [x0, y0] = pontos[i - 1];
      const [x1, y1] = pontos[i];
      const c = (y1 - y0) * 0.42;
      d += ` C ${x0.toFixed(1)} ${(y0 + c).toFixed(1)}, ${x1.toFixed(1)} ${(y1 - c).toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    arestas.push({ de: corrente.de, para: corrente.para, d, pontos });
  }

  const largura = Math.max(...camadas.flat().map((it) => it.x + it.w / 2)) + M.pad;
  const altura = M.pad * 2 + nCamadas * passoY - M.gapY;

  const areas: AreaLayout[] = ordenarAreas([
    ...new Set(conceitos.map((c) => `${c.materia}/${c.bloco}`)),
  ]).map((chave) => {
    const [materia, bloco] = chave.split('/') as [Materia, string];
    return { bloco, materia, rotulo: rotuloBloco(bloco), slotCor: slotDeCor(materia, bloco) };
  });

  return { nos, arestas, areas, largura, altura };
}

/* ------------------------------------------------------------------ *
 * Métricas — só pra medir a qualidade do desenho, não rodam no build
 * ------------------------------------------------------------------ */

/**
 * Os segmentos DESENHADOS, sem repetição.
 *
 * Trecho compartilhado por várias setas (o tronco, o corredor) é uma linha só na
 * tela, então tem que contar uma vez só — senão a métrica pune um desenho por
 * ele estar mais limpo. `pontas` guarda todos os módulos que são extremidade de
 * alguma seta que passa ali, pra sobreposição não acusar a própria origem.
 */
function segmentosDe(mapa: Mapa) {
  const porChave = new Map<
    string,
    { x1: number; y1: number; x2: number; y2: number; pontas: Set<string> }
  >();
  for (const a of mapa.arestas) {
    for (let i = 1; i < a.pontos.length; i++) {
      const [x1, y1] = a.pontos[i - 1];
      const [x2, y2] = a.pontos[i];
      const chave = [x1, y1, x2, y2].map((v) => v.toFixed(1)).join(',');
      let s = porChave.get(chave);
      if (!s) {
        s = { x1, y1, x2, y2, pontas: new Set() };
        porChave.set(chave, s);
      }
      s.pontas.add(a.de);
      s.pontas.add(a.para);
    }
  }
  return [...porChave.values()];
}

const perto = (a: number, b: number) => Math.abs(a - b) < 0.6;

/** Cruzamentos entre setas. */
export function contarCruzamentos(mapa: Mapa): number {
  const seg = segmentosDe(mapa);
  const lado = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) =>
    Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
  let n = 0;
  for (let i = 0; i < seg.length; i++) {
    for (let j = i + 1; j < seg.length; j++) {
      const p = seg[i];
      const q = seg[j];
      /* Encostar não é cruzar: dois trechos que saem do mesmo ponto (a bifurcação
         do tronco, ou dois trechos seguidos da mesma seta) tocam-se de propósito. */
      const toca =
        (perto(p.x1, q.x1) && perto(p.y1, q.y1)) ||
        (perto(p.x1, q.x2) && perto(p.y1, q.y2)) ||
        (perto(p.x2, q.x1) && perto(p.y2, q.y1)) ||
        (perto(p.x2, q.x2) && perto(p.y2, q.y2));
      if (toca) continue;
      if (
        lado(p.x1, p.y1, p.x2, p.y2, q.x1, q.y1) !== lado(p.x1, p.y1, p.x2, p.y2, q.x2, q.y2) &&
        lado(q.x1, q.y1, q.x2, q.y2, p.x1, p.y1) !== lado(q.x1, q.y1, q.x2, q.y2, p.x2, p.y2)
      ) {
        n++;
      }
    }
  }
  return n;
}

/** Setas passando por cima de um módulo que não é ponta delas. */
export function contarSobreposicoes(mapa: Mapa): number {
  const seg = segmentosDe(mapa);
  let n = 0;
  for (const s of seg) {
    for (const no of mapa.nos) {
      if (s.pontas.has(no.id)) continue;
      const x0 = no.x;
      const x1 = no.x + no.w;
      const y0 = no.y;
      const y1 = no.y + no.h;
      /* recorte de Liang–Barsky do segmento contra o retângulo */
      let t0 = 0;
      let t1 = 1;
      const dx = s.x2 - s.x1;
      const dy = s.y2 - s.y1;
      let dentro = true;
      for (const [p, q] of [
        [-dx, s.x1 - x0],
        [dx, x1 - s.x1],
        [-dy, s.y1 - y0],
        [dy, y1 - s.y1],
      ]) {
        if (p === 0) {
          if (q < 0) {
            dentro = false;
            break;
          }
        } else {
          const r = q / p;
          if (p < 0) {
            if (r > t1) {
              dentro = false;
              break;
            }
            if (r > t0) t0 = r;
          } else {
            if (r < t0) {
              dentro = false;
              break;
            }
            if (r < t1) t1 = r;
          }
        }
      }
      if (dentro && t0 < t1) n++;
    }
  }
  return n;
}
