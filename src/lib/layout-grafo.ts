/**
 * Posiciona o grafo de conceitos. Roda no build.
 *
 * O y é a profundidade: quantos módulos você atravessa até chegar naquele. O x
 * serve a um objetivo só, desembaraçar o desenho, minimizando cruzamento de
 * seta com seta e de seta com módulo. Aproximar módulos da mesma área foi
 * tentado e embolava as linhas; a área se comunica por cor e rótulo.
 *
 * É Sugiyama, em três passos: camadas por profundidade, nós-ponte pras setas
 * que pulam camada, e ordenação por mediana com transposição antes das
 * coordenadas.
 *
 * A entrada é objeto simples em vez de CollectionEntry pra dar pra rodar em
 * node puro num teste de escala, sem subir o Astro.
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
  /* O vão entre fileiras é onde as setas andam de lado, e cada uma ocupa uma
     altura própria; com os 80px de antes as linhas passavam a 12px do topo dos
     módulos e o vão concorrido embolava. */
  gapY: 96,
  /** Largura do corredor de uma seta que atravessa a camada. */
  ponteW: 22,
  /** Trecho reto abaixo do módulo onde as setas que saem dele andam juntas. */
  tronco: 10,
  /** Raio do canto onde a seta troca de vertical pra horizontal. */
  canto: 9,
  /** Abaixo disso o desvio vira curva em vez de degrau. */
  degrauMinimo: 44,
  /** Quanto a porta de chegada mais externa fica longe da quina do módulo. */
  margemPorta: 16,
  pad: 46,
};

const M = MEDIDAS;
const passoY = M.noH + M.gapY;

/* ------------------------------------------------------------------ *
 * Redução transitiva
 * ------------------------------------------------------------------ */

/**
 * Prereq que já vem por outro caminho é ruído no desenho: se X depende de A e
 * de B, e A já é prereq de B, a seta A→X não acrescenta nada, porque quem chega
 * em B já passou por A. Vale pra qualquer quantidade de caminhos.
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

  /* ---------- 1b. teto de largura ----------
     A fileira mais cheia manda na largura do mapa inteiro, e o mapa abre
     enquadrado pela largura, então cada módulo a mais naquela fileira encolhe o
     texto de todos os outros. Aqui o excedente desce uma camada, e quem depende
     dele desce junto. Fica mais alto, e alto não custa: a página rola.

     Isso quebra a leitura estrita de que a altura é a cadeia de prereqs — a
     camada de um módulo passa a ser a profundidade dele OU o lugar onde coube,
     o que for mais fundo. Quem desce nunca sobe acima de um prereq, então a
     ordem de estudo continua verdadeira; o que se perde é poder ler a distância
     exata no eixo. */
  const TETO_CAMADA = 8;
  const filhosDe = new Map<string, string[]>();
  for (const c of conceitos) {
    for (const p of essenciais.get(c.id) ?? []) {
      const lista = filhosDe.get(p);
      if (lista) lista.push(c.id);
      else filhosDe.set(p, [c.id]);
    }
  }
  const empurrar = (id: string, minimo: number) => {
    if (camadaDe.get(id)! >= minimo) return;
    camadaDe.set(id, minimo);
    for (const f of filhosDe.get(id) ?? []) empurrar(f, minimo + 1);
  };
  for (let guarda = 0; guarda < 400; guarda++) {
    const porCamada = new Map<number, string[]>();
    for (const c of conceitos) {
      const k = camadaDe.get(c.id)!;
      const lista = porCamada.get(k);
      if (lista) lista.push(c.id);
      else porCamada.set(k, [c.id]);
    }
    const cheias = [...porCamada].filter(([, v]) => v.length > TETO_CAMADA).map(([k]) => k);
    if (!cheias.length) break;
    const ci = Math.min(...cheias);
    const fila = porCamada.get(ci)!;
    /* Desce quem sai mais barato. Pai que fica pra trás vira uma seta que pula
       camada, e é isso que embola o desenho, então ele pesa 4; filho logo
       abaixo desce junto e só empurra a cascata pra frente, e pesa 3. Nessa
       proporção o mapa fica com o mesmo cruzamento de quando não havia teto —
       com 4 contra 1, que era o meu primeiro chute, subia 16%. */
    const custo = (id: string) =>
      (filhosDe.get(id) ?? []).filter((f) => camadaDe.get(f) === ci + 1).length * 3 +
      (essenciais.get(id) ?? []).length * 4;
    fila.sort((a, b) => custo(a) - custo(b) || a.localeCompare(b));
    for (const id of fila.slice(0, fila.length - TETO_CAMADA)) empurrar(id, ci + 1);
  }

  const nCamadas = Math.max(...conceitos.map((c) => camadaDe.get(c.id)!)) + 1;

  /* ---------- 2. nós-ponte ----------
     Seta que pula mais de uma camada vira uma corrente de pontos, um por camada
     intermediária. A ponte pega lugar na fila junto com os módulos, e é esse
     corredor reservado que impede a linha de passar por cima de um módulo. De
     quebra, a ordenação passa a enxergar a seta longa como várias curtas. */
  const camadas: Item[][] = Array.from({ length: nCamadas }, () => []);
  const itemDe = new Map<string, Item>();
  for (const c of conceitos) {
    const it: Item = { chave: c.id, real: true, c, camada: camadaDe.get(c.id)!, w: M.noW, x: 0 };
    camadas[it.camada].push(it);
    itemDe.set(c.id, it);
  }

  const trechos: Trecho[] = [];
  const correntes: { de: string; para: string; pontes: Item[] }[] = [];

  /* O corredor é do módulo de origem, não da seta. Quando cada seta longa abria
     uma ponte só dela, quatro setas saindo do mesmo módulo desciam o mapa
     inteiro como quatro paralelas dizendo a mesma coisa. Dividindo um ponto por
     camada elas descem coladas e cada uma se desprende na camada do destino. */
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
     Mediana e transposição, guardando a melhor tentativa. A ordem inicial é
     alfabética só pra ser determinística; daí pra frente quem manda é o número
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
  /* Quanto muda o cruzamento se `a` e `b`, vizinhos na fila, trocarem de lugar:
     negativo quer dizer que a troca melhora. Só as setas dos dois mudam de
     posição relativa, então basta olhar os vizinhos deles. Antes eu recontava a
     camada inteira duas vezes por troca, e era isso que comia quase todo o
     tempo do layout: com o saldo local o mesmo resultado sai 19 vezes mais
     rápido, e é esse troco que paga as partidas a mais. */
  const saldoDaTroca = (a: Item, b: Item) => {
    let ganho = 0;
    for (const lado of [acima, abaixo]) {
      const va = lado.get(a.chave) ?? [];
      const vb = lado.get(b.chave) ?? [];
      for (const x of va) {
        const px = ordem.get(x.chave)!;
        for (const y of vb) {
          const py = ordem.get(y.chave)!;
          if (px > py) ganho++;
          else if (px < py) ganho--;
        }
      }
    }
    return -ganho;
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

  /* O resultado da mediana depende da ordem inicial, então saio de alguns
     pontos diferentes e fico com o melhor, que sai mais barato que qualquer
     heurística mais esperta. Sorteio semeado: mesmo build, mesmo mapa. */
  let semente = 20260812;
  const sorteio = () => ((semente = (semente * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  /* A transposição continua quadrática no número de trechos, então grafo grande
     leva menos partidas pra a primeira carga não arrastar: 600 módulos com 8
     partidas levam 4,5 s. Com 84 módulos (112 trechos) são 64 partidas de 10
     passadas em 0,11 s, contra 0,65 s de 16 partidas antes do saldo local.
     Passar de 64 não mudou nada. */
  const partidas = trechos.length > 400 ? 8 : trechos.length > 200 ? 24 : 64;

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
  /* Eram 24 passadas e as 14 últimas não mexiam em nada: com a mediana, o
     resultado dos 11 grafos é igual com 8. Deixo 10 de folga, e o corte é o que
     paga as partidas a mais. */
  for (let passada = 0; passada < 10; passada++) {
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
          const a = camadas[ci][i];
          const b = camadas[ci][i + 1];
          if (saldoDaTroca(a, b) >= 0) continue;
          camadas[ci][i] = b;
          camadas[ci][i + 1] = a;
          ordem.set(b.chave, i);
          ordem.set(a.chave, i + 1);
          mexeu = true;
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
     mínimo, o que é regressão isotônica e tem solução exata (PAVA). Antes eu
     resolvia por empurrão sucessivo e o mapa inchava: a varredura empurra pra
     direita e nada puxa de volta, e o acumulado deixou o desenho três vezes
     mais largo do que precisava.

     A corrente de ponte já pesou 2,5 vezes um módulo, pra seta longa não
     serpentear entre as camadas. Com o alvo dos dois lados isso deixou de ser
     preciso, e o peso extra só atrapalhava: em 1 o desenho tem menos tinta e
     menos trecho torto que em 1,5 ou em 2,5. */
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

  /* Quanto o item cede da posição ideal pra não abrir vão. Sem isso o
     baricentro espalha: em 0, a camada 1 abria 2040px pra 6 módulos.
     Medido no currículo de 71 módulos:

       peso   largura   desvio médio   comprimento total das setas
       0       2414        115px            35457
       0.15    2134        112px            34152   ← menor os três
       0.30    2109        113px            34154
       0.60    2097        118px            35212

     Cruzamento e sobreposição não mudam com esse peso, porque a ordem já foi
     fixada na etapa anterior, então dá pra escolher só por largura e retidão.
     Retestei 0,2 a 0,5 depois que o alvo passou a ser a mediana dos dois lados:
     estreitam menos de 1% e desalinham mais, então 0,15 continua. */
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
    const w = camadaItens.map((it) => (desejado.has(it.chave) ? 1 : 0.05));
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
      const desejado = new Map<string, number>();
      for (const it of camadas[ci]) {
        /* O alvo é a mediana dos vizinhos dos DOIS lados. Olhando só o lado de
           onde a varredura vem, o item alinha com os pais e fica torto com os
           filhos, e a volta seguinte desfaz; com os dois lados ele para no
           lugar. E a mediana, no lugar da média, impede que um módulo com seis
           filhos arraste o pai pro meio deles. Medido em 11 grafos (o currículo
           e dez recortes dele): 4,8% menos largura, 6,8% menos tinta, 7% menos
           desvio horizontal e 15% menos trecho torto, com o mesmo cruzamento. */
        const vs = [...(acima.get(it.chave) ?? []), ...(abaixo.get(it.chave) ?? [])];
        if (!vs.length) continue;
        const xs = vs.map((v) => v.x).sort((a, b) => a - b);
        const m = xs.length >> 1;
        desejado.set(it.chave, xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2);
      }
      compactar(camadas[ci], desejado);
    }
    /* reancora a cada volta pra não acumular deriva */
    const esq = Math.min(...camadas.flat().map((it) => it.x - it.w / 2));
    for (const it of camadas.flat()) it.x -= esq;
  }

  /* Encaixe fino: cada módulo tenta pousar EXATAMENTE no x de um vizinho, e só
     se couber sem empurrar ninguém. A compactação anterior minimiza a distância
     média até os vizinhos, o que com seta em curva bastava; com seta ortogonal
     não, porque 20px de diferença já viram um degrau, e o que se lê como linha
     limpa é a seta que desce reta. Rende pouco, 10 setas retas de 112, porque
     com módulo de 156px e fileira apertada quase nunca sobra o espaço exato —
     mas as que pegam são as cadeias simples, que é onde o degrau mais incomoda. */
  {
    const grau = (it: Item) =>
      (acima.get(it.chave) ?? []).length + (abaixo.get(it.chave) ?? []).length;
    for (let volta = 0; volta < 4; volta++) {
      const indices = volta % 2 === 0 ? [...camadas.keys()] : [...camadas.keys()].reverse();
      for (const ci of indices) {
        const itens = camadas[ci];
        /* A ponte tenta primeiro, pra corrente longa ficar numa coluna só, e
           depois quem tem mais vizinhos, que é quem tem mais a ganhar. */
        const prioridade = [...itens.keys()].sort(
          (a, b) =>
            Number(!itens[b].real) - Number(!itens[a].real) || grau(itens[b]) - grau(itens[a]),
        );
        for (const i of prioridade) {
          const it = itens[i];
          const vizinhos = [...(acima.get(it.chave) ?? []), ...(abaixo.get(it.chave) ?? [])];
          if (!vizinhos.length) continue;
          const limEsq = i > 0 ? itens[i - 1].x + sep(itens[i - 1], it) : -Infinity;
          const limDir = i < itens.length - 1 ? itens[i + 1].x - sep(it, itens[i + 1]) : Infinity;
          const alvos = [...new Set(vizinhos.map((v) => v.x))].sort(
            (a, b) => Math.abs(a - it.x) - Math.abs(b - it.x),
          );
          /* Só pousa se couber onde está: deixar o módulo empurrar os vizinhos
             pra conseguir se alinhar desmancha o alinhamento deles, e o saldo
             medido é negativo (12 setas retas viram 10). */
          for (const alvo of alvos) {
            if (alvo >= limEsq - 0.01 && alvo <= limDir + 0.01) {
              it.x = alvo;
              break;
            }
          }
        }
      }
    }
    const esq = Math.min(...camadas.flat().map((it) => it.x - it.w / 2));
    for (const it of camadas.flat()) it.x -= esq;
  }

  /* Corredor reto: a seta longa desce numa coluna só pelo maior trecho que
     couber. Cada ponte nascia da compactação da camada dela, e sozinhas ficavam
     fora de prumo umas das outras — na tela isso é a seta descendo em
     zigue-zague, desviando 8px numa camada e voltando 15px na seguinte, que foi
     a primeira coisa que me apontaram como errada no desenho.

     A ponte não precisa ficar no vão onde a ordenação a pôs: ela precisa é não
     encostar em ninguém. Então olho TODOS os vãos livres de cada fileira, vou
     intersectando enquanto desço, e quando a interseção esvazia fecho ali um
     trecho e começo outro. Isso dá o menor número de desvios possível. */
  {
    const posicaoNaCamada = new Map<string, number>();
    camadas.forEach((c) => c.forEach((it, i) => posicaoNaCamada.set(it.chave, i)));

    /* Os pedaços de uma fileira onde uma ponte cabe sem raspar em nada. */
    const vaosLivres = (ci: number, minhas: Set<string>): [number, number][] => {
      const obstaculos = camadas[ci]
        .filter((it) => !minhas.has(it.chave))
        .map((it): [number, number] => {
          /* A folga aqui é menor que a que a compactação usou: o corredor tem
             22px de largura mas a linha desenhada é fina, então ela pode andar
             uns 12px dentro dele sem chegar perto de módulo nenhum, e são esses
             12px de manobra que deixam a corrente ficar reta por mais camadas. */
          const meia = it.w / 2 + 6 + M.ponteW / 2;
          return [it.x - meia, it.x + meia];
        })
        .sort((a, b) => a[0] - b[0]);
      const livres: [number, number][] = [];
      let corrente = -Infinity;
      for (const [a, b] of obstaculos) {
        /* o vão que a própria ponte ocupava tem largura exatamente zero, e é o
           candidato mais importante de todos: sem o >= ele sumia da lista e a
           corrente fugia pra borda do mapa atrás de espaço */
        if (a >= corrente - 0.01) livres.push([corrente, Math.max(a, corrente)]);
        corrente = Math.max(corrente, b);
      }
      livres.push([corrente, Infinity]);
      return livres;
    };

    const cruza = (a: [number, number], b: [number, number]): [number, number] | null => {
      const lo = Math.max(a[0], b[0]);
      const hi = Math.min(a[1], b[1]);
      return lo <= hi ? [lo, hi] : null;
    };

    for (const [id, corredor] of corredorDe) {
      const pontes = [...corredor.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p);
      const minhas = new Set(pontes.map((p) => p.chave));
      let alvo = itemDe.get(id)!.x;
      let trecho: Item[] = [];
      let janela: [number, number] | null = null;

      const fechar = () => {
        if (!janela || !trecho.length) return;
        const x = Math.min(Math.max(alvo, janela[0]), janela[1]);
        for (const p of trecho) p.x = x;
        alvo = x;
        trecho = [];
        janela = null;
      };

      for (const ponte of pontes) {
        const livres = vaosLivres(ponte.camada, minhas);
        const atual: [number, number] | null = janela;
        const proxima: [number, number] | null = atual
          ? (livres.map((v) => cruza(atual, v)).find((v) => v) ?? null)
          : null;
        if (janela && proxima) {
          janela = proxima;
          trecho.push(ponte);
          continue;
        }
        fechar();
        /* Trecho novo: fico no vão mais perto de onde a seta vinha, mas só se
           ele estiver a um módulo e meio de distância. Sem esse limite a seta
           acha uma coluna livre do outro lado do mapa e atravessa tudo pra
           descer reta, que é pior que o zigue-zague que eu queria tirar. */
        const raio = 1.5 * M.noW;
        const dist = (w: [number, number], ref: number) => Math.max(w[0] - ref, ref - w[1], 0);
        const perto = livres.filter((v) => dist(v, alvo) <= raio);
        const ref = perto.length ? alvo : ponte.x;
        janela = (perto.length ? perto : livres).reduce((melhor, v) =>
          dist(v, ref) < dist(melhor, ref) ? v : melhor,
        );
        trecho = [ponte];
      }
      fechar();
    }
  }

  /* As camadas estreitas já foram centradas na largura final, por estética, e
     isso era o que mais entortava seta no mapa: uma fileira de dois módulos ia
     pro meio dos 2450px sem olhar onde estavam os filhos dela, e as setas saíam
     em diagonal atrás. Tirar a centralização custa 43px de largura e derruba os
     trechos tortos de 46 pra 28. */
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

  /* Porta de chegada: ela acompanha a seta, em vez de a seta desviar pra achar
     a porta. O topo do módulo tem 156px de borda e a seta não precisa entrar
     pelo meio: se ela vem de uma coluna que cai dentro dessa faixa, entra ali e
     desce reta, e o degrau de 10px que existia só pra centralizar some.

     Quando duas setas chegariam a menos de 24px uma da outra, elas passam a
     usar a MESMA porta e se juntam antes de entrar — que é como o olho lê
     "essas duas vão pro mesmo lugar". É o tronco da saída, do lado de cá. */
  const portaDe = new Map<string, number>();
  /* Setas que precisam do degrau mesmo com desvio curto, porque estão entrando
     por uma porta que não é a coluna delas pra se juntar a uma irmã. */
  const forcaDegrau = new Set<string>();
  {
    const porDestino = new Map<string, { chave: string; vemDe: number }[]>();
    for (const corrente of correntes) {
      const origem = itemDe.get(corrente.de)!;
      const ultima = corrente.pontes[corrente.pontes.length - 1];
      const lista = porDestino.get(corrente.para) ?? [];
      lista.push({ chave: `${corrente.de}»${corrente.para}`, vemDe: (ultima ?? origem).x });
      porDestino.set(corrente.para, lista);
    }
    const limite = M.noW / 2 - M.margemPorta;
    for (const [id, lista] of porDestino) {
      const centro = itemDe.get(id)!.x;
      /* Cada seta entra na coluna de onde vem, presa à borda do módulo. Duas
         que vêm de longe do mesmo lado batem no mesmo limite, ganham a mesma
         porta e se juntam — a junção sai do próprio clamp. Agrupar as que
         chegam perto uma da outra numa porta média foi testado e é pior: em vez
         de duas retas paralelas entrando lado a lado, dá duas molinhas
         convergindo. */
      for (const e of lista) {
        portaDe.set(e.chave, Math.min(Math.max(e.vemDe - centro, -limite), limite));
      }

      /* Fusão na chegada: se a seta desce cortando o trecho de lado de uma irmã
         que vai pro MESMO módulo, ela passa a entrar pela porta da irmã e a
         dividir o canal. Antes ela cruzava a irmã pra chegar sozinha na porta
         do lado — dois traços paralelos entrando no mesmo lugar, com um
         cruzamento no meio do caminho que não precisava existir. */
      const comCanal = lista
        .map((e) => ({ e, porta: centro + portaDe.get(e.chave)! }))
        .filter((c) => Math.abs(c.e.vemDe - c.porta) >= M.degrauMinimo)
        .sort((a, b) => Math.abs(b.e.vemDe - b.porta) - Math.abs(a.e.vemDe - a.porta));
      for (const b of comCanal) {
        const de = Math.min(b.e.vemDe, b.porta);
        const ate = Math.max(b.e.vemDe, b.porta);
        const sentido = Math.sign(b.porta - b.e.vemDe);
        for (const e of lista) {
          if (e === b.e) continue;
          const porta = centro + portaDe.get(e.chave)!;
          /* Mesma porta e mesmo sentido: a irmã já anda de lado até ali, então
             esta desce até o canal dela e entra junto, em vez de cortar o
             caminho dela em curva pra chegar sozinha no mesmo ponto. */
          if (porta === b.porta && Math.sign(porta - e.vemDe) === sentido) {
            forcaDegrau.add(e.chave);
            continue;
          }
          /* Porta diferente, mas a descida corta o trecho de lado da irmã: vale
             mudar de porta e entrar junto, que apaga o cruzamento. */
          if (porta !== b.porta && e.vemDe > de + 0.5 && e.vemDe < ate - 0.5) {
            portaDe.set(e.chave, b.porta - centro);
            forcaDegrau.add(e.chave);
          }
        }
      }
    }
  }

  /* Saída: quem tem uma seta só desliza o ponto de partida na base do módulo
     pra ela sair alinhada com o destino. Com duas ou mais, o ponto continua no
     meio, porque é o tronco compartilhado que faz as irmãs saírem juntas. */
  const saidaDe = new Map<string, number>();
  {
    const conta = new Map<string, number>();
    for (const c of correntes) conta.set(c.de, (conta.get(c.de) ?? 0) + 1);
    const limite = M.noW / 2 - M.margemPorta;
    for (const corrente of correntes) {
      if ((conta.get(corrente.de) ?? 0) > 1) continue;
      const origem = itemDe.get(corrente.de)!;
      const destino = itemDe.get(corrente.para)!;
      const chegada = destino.x + (portaDe.get(`${corrente.de}»${corrente.para}`) ?? 0);
      const alvo = corrente.pontes.length ? corrente.pontes[0].x : chegada;
      saidaDe.set(
        `${corrente.de}»${corrente.para}`,
        Math.min(Math.max(alvo - origem.x, -limite), limite),
      );
    }
  }

  /* Rota da seta: só vertical e horizontal, com o canto arredondado. Enquanto
     era Bézier, toda seta que mudava de coluna descia em diagonal e o olho
     perdia qual entrava em qual módulo; na vertical a seta sai debaixo do
     módulo, anda de lado no vão vazio entre as fileiras e desce reta no
     destino, e a flecha chega sempre por cima.

     O trecho horizontal mora num CANAL dentro do vão. Sem canal, duas setas que
     andam de lado no mesmo vão viram uma linha só e não dá pra saber quem vai
     pra onde: aqui cada uma pega a primeira altura livre, e trechos que não se
     cruzam em x dividem a mesma. */
  /** Um canal por (vão, ponto de chegada, lado de onde vem). */
  const chaveDoCanal = (ci: number, x0: number, x1: number) =>
    `${ci}|${x1.toFixed(1)}|${Math.sign(x1 - x0)}`;

  const canalDe = new Map<string, number>();
  {
    type Trecho = { chave: string; a: number; b: number; entradas: number[]; saida: number };
    const porVao = new Map<number, Trecho[]>();
    for (const corrente of correntes) {
      const pontos = rotaBruta(corrente);
      const forcado = forcaDegrau.has(`${corrente.de}»${corrente.para}`);
      for (let i = 1; i < pontos.length; i++) {
        const [x0, y0] = pontos[i - 1];
        const [x1] = pontos[i];
        if (Math.abs(x1 - x0) < M.degrauMinimo && !(forcado && i === pontos.length - 1)) continue;
        const ci = Math.floor((y0 - M.pad) / passoY);
        const chave = chaveDoCanal(ci, x0, x1);
        const lista = porVao.get(ci) ?? [];
        const ja = lista.find((t) => t.chave === chave);
        /* Duas setas que terminam no mesmo ponto e vêm do mesmo lado dividem o
           canal de propósito: elas se sobrepõem no pedaço comum e o que se vê é
           uma linha só entrando no módulo, que é como o olho lê "essas duas vão
           pro mesmo lugar". O tronco faz isso na saída; isto é o mesmo na
           chegada. */
        if (ja) {
          ja.a = Math.min(ja.a, x0, x1);
          ja.b = Math.max(ja.b, x0, x1);
          if (!ja.entradas.includes(x0)) ja.entradas.push(x0);
        } else {
          lista.push({
            chave,
            a: Math.min(x0, x1),
            b: Math.max(x0, x1),
            entradas: [x0],
            saida: x1,
          });
        }
        porVao.set(ci, lista);
      }
    }

    const dentro = (v: number, t: Trecho) => v > t.a + 0.5 && v < t.b - 0.5;
    /* Quantas vezes as duas setas se cruzam, sabendo quem está no canal de
       cima: a que desce depois atravessa o trecho de lado da que já virou. */
    const cruzaPar = (cima: Trecho, baixo: Trecho) => {
      let n = 0;
      for (const e of baixo.entradas) if (dentro(e, cima)) n++;
      if (dentro(cima.saida, baixo)) n++;
      return n;
    };

    for (const [, lista] of porVao) {
      /* O desvio curto pega o canal de cima e o longo desce mais antes de andar
         de lado; alocar na ordem do x deixa o mapa com mais cruzamento. */
      lista.sort((p, q) => p.b - p.a - (q.b - q.a) || p.a - q.a);
      const ocupado: number[] = [];
      const canal = new Map<string, number>();
      for (const t of lista) {
        let c = 0;
        while (c < ocupado.length && ocupado[c] > t.a + 0.5) c++;
        ocupado[c] = t.b;
        canal.set(t.chave, c);
      }

      /* Troca de canal entre dois trechos enquanto isso desfizer cruzamento.
         O greedy só olha quem cabe onde; ele produz cruzamentos que somem só
         com a troca — os micro-cruzamentos logo abaixo de um módulo, que não
         precisavam existir. */
      const custo = () => {
        let n = 0;
        for (let i = 0; i < lista.length; i++) {
          for (let j = i + 1; j < lista.length; j++) {
            const ci2 = canal.get(lista[i].chave)!;
            const cj = canal.get(lista[j].chave)!;
            if (ci2 === cj) continue;
            n += ci2 < cj ? cruzaPar(lista[i], lista[j]) : cruzaPar(lista[j], lista[i]);
          }
        }
        return n;
      };
      const livre = (t: Trecho, c: number) =>
        lista.every(
          (o) => o === t || canal.get(o.chave) !== c || o.b <= t.a + 0.5 || o.a >= t.b - 0.5,
        );
      let melhorou = true;
      let voltas = 0;
      while (melhorou && voltas++ < 8) {
        melhorou = false;
        for (let i = 0; i < lista.length; i++) {
          for (let j = i + 1; j < lista.length; j++) {
            const a = lista[i];
            const b = lista[j];
            const ca = canal.get(a.chave)!;
            const cb = canal.get(b.chave)!;
            if (ca === cb) continue;
            const antes = custo();
            canal.set(a.chave, cb);
            canal.set(b.chave, ca);
            if (!livre(a, cb) || !livre(b, ca) || custo() >= antes) {
              canal.set(a.chave, ca);
              canal.set(b.chave, cb);
            } else {
              melhorou = true;
            }
          }
        }
      }
      for (const [chave, c] of canal) canalDe.set(chave, c);
    }
  }

  /** Onde fica, em y, o canal `n` do vão abaixo da camada `ci`. */
  const yDoCanal = (ci: number, n: number, total: number) => {
    const base = yDaCamada(ci) + M.noH;
    const alto = base + M.tronco + M.canto + 3;
    const baixo = base + M.gapY - M.canto - 10;
    if (total <= 1) return (alto + baixo) / 2;
    return alto + ((baixo - alto) * n) / (total - 1);
  };
  const canaisDoVao = new Map<number, number>();
  for (const [chave, n] of canalDe) {
    const ci = Number(chave.split('|')[0]);
    canaisDoVao.set(ci, Math.max(canaisDoVao.get(ci) ?? 0, n + 1));
  }

  const arestas: ArestaLayout[] = [];
  for (const corrente of correntes) {
    const origem = itemDe.get(corrente.de)!;
    const destino = itemDe.get(corrente.para)!;
    /* Cada ponte dá dois pontos, no topo e na base da faixa dela, pra linha
       atravessar a fileira de módulos na vertical, dentro do corredor, e todo o
       desvio horizontal acontecer no vão entre camadas, que é vazio. Com um
       ponto só, no centro, o trecho varria na diagonal por dentro da fileira e
       raspava os módulos vizinhos. */
    const bruta = rotaBruta(corrente);
    const chaveDaAresta = `${corrente.de}»${corrente.para}`;
    const pontos: [number, number][] = [bruta[0]];
    const n = (v: number) => v.toFixed(1);
    let d = `M ${n(bruta[0][0])} ${n(bruta[0][1])}`;
    for (let i = 1; i < bruta.length; i++) {
      const [x0, y0] = bruta[i - 1];
      const [x1, y1] = bruta[i];
      if (Math.abs(x1 - x0) < 0.5) {
        d += ` V ${n(y1)}`;
        pontos.push([x1, y1]);
        continue;
      }
      /* Degrau curto não vira canto: dois cantos separados por 20px de reta
         parecem defeito de desenho, e uma curva curta lê melhor. */
      if (Math.abs(x1 - x0) < M.degrauMinimo && !(forcaDegrau.has(chaveDaAresta) && i === bruta.length - 1)) {
        const c = (y1 - y0) * 0.42;
        d += ` C ${n(x0)} ${n(y0 + c)}, ${n(x1)} ${n(y1 - c)}, ${n(x1)} ${n(y1)}`;
        pontos.push([x1, y1]);
        continue;
      }
      const ci = Math.floor((y0 - M.pad) / passoY);
      const chave = chaveDoCanal(ci, x0, x1);
      const ym = yDoCanal(ci, canalDe.get(chave) ?? 0, canaisDoVao.get(ci) ?? 1);
      const lado = Math.sign(x1 - x0);
      const r = Math.min(M.canto, Math.abs(x1 - x0) / 2, ym - y0, y1 - ym);
      d +=
        ` V ${n(ym - r)}` +
        ` Q ${n(x0)} ${n(ym)}, ${n(x0 + lado * r)} ${n(ym)}` +
        ` H ${n(x1 - lado * r)}` +
        ` Q ${n(x1)} ${n(ym)}, ${n(x1)} ${n(ym + r)}` +
        ` V ${n(y1)}`;
      pontos.push([x0, ym], [x1, ym], [x1, y1]);
    }
    arestas.push({ de: corrente.de, para: corrente.para, d, pontos });
  }

  /** Os cantos da rota, antes de arredondar: origem, tronco, pontes e destino. */
  function rotaBruta(corrente: { de: string; para: string; pontes: Item[] }) {
    const origem = itemDe.get(corrente.de)!;
    const destino = itemDe.get(corrente.para)!;
    const base = yDaCamada(origem.camada) + M.noH;
    const chave = `${corrente.de}»${corrente.para}`;
    return [
      [origem.x + (saidaDe.get(chave) ?? 0), base],
      /* Tronco: as setas irmãs descem um trecho reto antes de abrir o leque.
         Como o trecho é idêntico, elas se sobrepõem exatamente e o que se vê é
         uma linha só saindo do módulo, que só então bifurca. */
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
      [destino.x + (portaDe.get(chave) ?? 0), yDaCamada(destino.camada)],
    ] as [number, number][];
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
 * Métricas: medem a qualidade do desenho, não rodam no build
 * ------------------------------------------------------------------ */

/**
 * Os segmentos desenhados, sem repetição. Trecho compartilhado por várias setas
 * (o tronco, o corredor) é uma linha só na tela, então conta uma vez só, senão a
 * métrica pune o desenho justamente por ele estar mais limpo. `pontas` guarda os
 * módulos que são extremidade de alguma seta dali, pra sobreposição não acusar a
 * própria origem.
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

/** O ponto está em cima do segmento (ponta de um encostando no meio do outro). */
function noSegmento(
  s: { x1: number; y1: number; x2: number; y2: number },
  x: number,
  y: number,
) {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const comprimento = Math.hypot(dx, dy);
  if (comprimento < 0.6) return false;
  const distancia = Math.abs(dy * (x - s.x1) - dx * (y - s.y1)) / comprimento;
  if (distancia > 0.6) return false;
  const t = ((x - s.x1) * dx + (y - s.y1) * dy) / (comprimento * comprimento);
  return t >= -0.01 && t <= 1.01;
}

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
      /* Encostar não é cruzar: dois trechos que saem do mesmo ponto, seja a
         bifurcação do tronco ou dois trechos seguidos da mesma seta, se tocam
         de propósito. O mesmo vale pro T, que é uma seta entrando no canal de
         outra pra chegarem juntas no mesmo módulo — desde que a rota passou a
         fundir na chegada, contar isso como cruzamento inflava o número. */
      const toca =
        (perto(p.x1, q.x1) && perto(p.y1, q.y1)) ||
        (perto(p.x1, q.x2) && perto(p.y1, q.y2)) ||
        (perto(p.x2, q.x1) && perto(p.y2, q.y1)) ||
        (perto(p.x2, q.x2) && perto(p.y2, q.y2));
      if (toca) continue;
      const emT =
        noSegmento(q, p.x1, p.y1) ||
        noSegmento(q, p.x2, p.y2) ||
        noSegmento(p, q.x1, q.y1) ||
        noSegmento(p, q.x2, q.y2);
      if (emT) continue;
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
