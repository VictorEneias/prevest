/**
 * Onde cada aula e cada seta do mapa de conceitos vão parar na tela.
 *
 * É Sugiyama, com uma etapa por seção deste arquivo: as aulas se distribuem em
 * fileiras pela profundidade no grafo, cada fileira ganha uma ordem que
 * desembaraça as setas, cada item ganha uma coluna, e só então as setas viram
 * desenho. O y é a profundidade; o x serve a um objetivo só, que é deixar o
 * desenho legível.
 *
 * Duas coisas que este arquivo NÃO faz, e que já foram tentadas: aproximar
 * módulos da mesma área (mede bem e embola as linhas — a área se comunica por
 * cor e rótulo) e centrar as fileiras estreitas na largura do mapa (era o que
 * mais entortava seta, porque jogava uma fileira de dois módulos pro meio sem
 * olhar onde estavam os filhos dela).
 *
 * Roda no cliente, na primeira carga da home, e leva ~0,1 s com 84 aulas. A
 * entrada é objeto simples, e não o registro do conteúdo, pra dar pra rodar em
 * node puro num teste de escala sem subir o site.
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
  /** A polilinha por onde a seta passa, sem os cantos arredondados. */
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
  /** Largura do corredor de uma seta que atravessa a fileira. */
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
const yDaCamada = (ci: number) => M.pad + ci * passoY;

/* ------------------------------------------------------------------ *
 * O grafo, antes de virar desenho
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

/** O foco e tudo que está a até `raio` passos dele, nas duas direções. */
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
 * 1. Em que fileira cada aula entra
 * ------------------------------------------------------------------ */

/** Nenhuma fileira passa disso — ver `descerExcedente`. */
const TETO_FILEIRA = 8;

/**
 * A profundidade de cada aula: quantas aulas você atravessa até chegar nela.
 * Ciclo não deveria existir (`npm run grafo` acusa), e se existir a corrente
 * para em zero em vez de estourar a pilha.
 */
function profundidades(
  conceitos: ConceitoBruto[],
  essenciais: Map<string, string[]>,
): Map<string, number> {
  const camadaDe = new Map<string, number>();
  const visitando = new Set<string>();
  const camada = (id: string): number => {
    const pronto = camadaDe.get(id);
    if (pronto !== undefined) return pronto;
    if (visitando.has(id)) return 0;
    visitando.add(id);
    let v = 0;
    for (const p of essenciais.get(id) ?? []) v = Math.max(v, camada(p) + 1);
    visitando.delete(id);
    camadaDe.set(id, v);
    return v;
  };
  conceitos.forEach((c) => camada(c.id));
  return camadaDe;
}

/**
 * A fileira mais cheia manda na largura do mapa inteiro, e o mapa abre
 * enquadrado pela largura, então cada módulo a mais naquela fileira encolhe o
 * texto de todos os outros. Aqui o excedente desce uma fileira, e quem depende
 * dele desce junto. Fica mais alto, e alto não custa: a página rola.
 *
 * Isso quebra a leitura estrita de que a altura é a cadeia de prereqs — a
 * fileira de um módulo passa a ser a profundidade dele OU o lugar onde coube, o
 * que for mais fundo. Quem desce nunca sobe acima de um prereq, então a ordem
 * de estudo continua verdadeira; o que se perde é ler a distância exata no eixo.
 */
function descerExcedente(
  conceitos: ConceitoBruto[],
  essenciais: Map<string, string[]>,
  camadaDe: Map<string, number>,
) {
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
    const cheias = [...porCamada].filter(([, v]) => v.length > TETO_FILEIRA).map(([k]) => k);
    if (!cheias.length) break;

    const ci = Math.min(...cheias);
    const fila = porCamada.get(ci)!;
    /* Desce quem sai mais barato. Pai que fica pra trás vira uma seta que pula
       fileira, e é isso que embola o desenho, então ele pesa 4; filho logo
       abaixo desce junto e só empurra a cascata pra frente, e pesa 3. Nessa
       proporção o mapa fica com o mesmo cruzamento de quando não havia teto —
       com 4 contra 1, que era o meu primeiro chute, subia 16%. */
    const custo = (id: string) =>
      (filhosDe.get(id) ?? []).filter((f) => camadaDe.get(f) === ci + 1).length * 3 +
      (essenciais.get(id) ?? []).length * 4;
    fila.sort((a, b) => custo(a) - custo(b) || a.localeCompare(b));
    for (const id of fila.slice(0, fila.length - TETO_FILEIRA)) empurrar(id, ci + 1);
  }
}

/* ------------------------------------------------------------------ *
 * 2. A fila de cada fileira: os módulos e os corredores
 * ------------------------------------------------------------------ */

/** Um lugar na fila de uma fileira: ou um módulo, ou o corredor de uma seta. */
interface Item {
  chave: string;
  real: boolean;
  c?: ConceitoBruto;
  camada: number;
  w: number;
  x: number;
}

/** Um pedaço de seta entre duas fileiras vizinhas. */
interface Trecho {
  a: Item;
  b: Item;
}

/** Uma seta inteira: de onde sai, aonde vai, e por quais corredores passa. */
interface Corrente {
  de: string;
  para: string;
  pontes: Item[];
}

interface Malha {
  camadas: Item[][];
  itemDe: Map<string, Item>;
  correntes: Corrente[];
  /** Os corredores de cada módulo de origem, por fileira. */
  corredorDe: Map<string, Map<number, Item>>;
  trechos: Trecho[];
  acima: Map<string, Item[]>;
  abaixo: Map<string, Item[]>;
}

/**
 * Seta que pula mais de uma fileira vira uma corrente de pontos, um por fileira
 * do meio do caminho. Esse ponto pega lugar na fila junto com os módulos, e é o
 * corredor reservado que impede a linha de passar por cima de um módulo. De
 * quebra, a ordenação passa a enxergar a seta longa como várias curtas.
 *
 * O corredor é do MÓDULO DE ORIGEM, não da seta: quando cada seta longa abria
 * um corredor só dela, quatro setas saindo do mesmo módulo desciam o mapa
 * inteiro como quatro paralelas dizendo a mesma coisa. Dividindo um ponto por
 * fileira elas descem coladas e cada uma se desprende na fileira do destino.
 */
function montarMalha(
  conceitos: ConceitoBruto[],
  essenciais: Map<string, string[]>,
  camadaDe: Map<string, number>,
  nCamadas: number,
): Malha {
  const camadas: Item[][] = Array.from({ length: nCamadas }, () => []);
  const itemDe = new Map<string, Item>();
  for (const c of conceitos) {
    const it: Item = { chave: c.id, real: true, c, camada: camadaDe.get(c.id)!, w: M.noW, x: 0 };
    camadas[it.camada].push(it);
    itemDe.set(c.id, it);
  }

  const trechos: Trecho[] = [];
  const correntes: Corrente[] = [];
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

  const acima = new Map<string, Item[]>();
  const abaixo = new Map<string, Item[]>();
  for (const t of trechos) {
    acima.set(t.b.chave, [...(acima.get(t.b.chave) ?? []), t.a]);
    abaixo.set(t.a.chave, [...(abaixo.get(t.a.chave) ?? []), t.b]);
  }

  return { camadas, itemDe, correntes, corredorDe, trechos, acima, abaixo };
}

/** Todos os vizinhos de um item, de cima e de baixo. */
const vizinhosDe = (malha: Malha, it: Item) => [
  ...(malha.acima.get(it.chave) ?? []),
  ...(malha.abaixo.get(it.chave) ?? []),
];

/* ------------------------------------------------------------------ *
 * 3. A ordem dentro de cada fileira
 * ------------------------------------------------------------------ */

/** Mediana ponderada de Gansner: com número par de vizinhos, pende pro lado mais apertado. */
function medianaDeGansner(v: number[]): number {
  if (!v.length) return -1;
  const s = [...v].sort((p, q) => p - q);
  const m = s.length >> 1;
  if (s.length % 2) return s[m];
  if (s.length === 2) return (s[0] + s[1]) / 2;
  const esq = s[m - 1] - s[0];
  const dir = s[s.length - 1] - s[m];
  return (s[m - 1] * dir + s[m] * esq) / (esq + dir || 1);
}

/**
 * Mediana e transposição, guardando a melhor tentativa. A ordem inicial é
 * alfabética só pra ser determinística; daí pra frente quem manda é o número de
 * cruzamentos.
 */
function ordenarFileiras(malha: Malha, nCamadas: number) {
  const { camadas, trechos, acima, abaixo } = malha;
  const ordem = new Map<string, number>();
  for (const camadaItens of camadas) {
    camadaItens.sort((a, b) =>
      (a.c?.titulo ?? a.chave).localeCompare(b.c?.titulo ?? b.chave, 'pt-BR'),
    );
    camadaItens.forEach((it, i) => ordem.set(it.chave, i));
  }
  const inicial = camadas.map((c) => c.map((it) => it.chave));

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

  /* Quanto muda o cruzamento se `a` e `b`, vizinhos na fila, trocarem de lugar:
     negativo quer dizer que a troca melhora. Só as setas dos dois mudam de
     posição relativa, então basta olhar os vizinhos deles. Antes eu recontava a
     fileira inteira duas vezes por troca, e era isso que comia quase todo o
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

  const salvar = () => camadas.map((c) => c.map((it) => it.chave));
  const restaurar = (snap: string[][]) => {
    snap.forEach((chaves, ci) => {
      const porChave = new Map(camadas[ci].map((it) => [it.chave, it]));
      camadas[ci] = chaves.map((k) => porChave.get(k)!);
      camadas[ci].forEach((it, i) => ordem.set(it.chave, i));
    });
  };

  let melhor = salvar();
  let melhorCruz = contarTudo();

  /** Uma tentativa: passadas de mediana, cada uma seguida de transposição. */
  const otimizar = () => {
    /* Eram 24 passadas e as 14 últimas não mexiam em nada: com a mediana, o
       resultado dos 11 grafos de teste é igual com 8. Deixo 10 de folga, e o
       corte é o que paga as partidas a mais. */
    for (let passada = 0; passada < 10; passada++) {
      const paraBaixo = passada % 2 === 0;
      const indices = paraBaixo
        ? [...camadas.keys()].slice(1)
        : [...camadas.keys()].slice(0, -1).reverse();

      for (const ci of indices) {
        const vizinhos = paraBaixo ? acima : abaixo;
        const alvo = new Map<string, number>();
        for (const it of camadas[ci]) {
          const pos = (vizinhos.get(it.chave) ?? []).map((v) => ordem.get(v.chave)!);
          alvo.set(it.chave, medianaDeGansner(pos));
        }
        camadas[ci] = [...camadas[ci]].sort((a, b) => {
          const ma = alvo.get(a.chave)!;
          const mb = alvo.get(b.chave)!;
          /* quem não tem vizinho daquele lado (mediana −1) fica onde estava */
          if (ma < 0 && mb < 0) return ordem.get(a.chave)! - ordem.get(b.chave)!;
          if (ma < 0) return -1;
          if (mb < 0) return 1;
          return ma - mb;
        });
        camadas[ci].forEach((it, i) => ordem.set(it.chave, i));
      }

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
  };

  /* O resultado da mediana depende da ordem inicial, então saio de vários
     pontos diferentes e fico com o melhor, que sai mais barato que qualquer
     heurística mais esperta. Sorteio semeado: mesma carga, mesmo mapa.

     A transposição continua quadrática no número de trechos, então grafo grande
     leva menos partidas pra a primeira carga não arrastar: 600 módulos com 8
     partidas levam 4,5 s. Com 84 módulos (112 trechos) são 64 partidas em
     0,11 s, contra 0,65 s de 16 partidas antes do saldo local. Passar de 64 não
     mudou nada. */
  let semente = 20260812;
  const sorteio = () => ((semente = (semente * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const partidas = trechos.length > 400 ? 8 : trechos.length > 200 ? 24 : 64;

  for (let partida = 0; partida < partidas; partida++) {
    if (partida === 0) {
      restaurar(inicial);
    } else {
      restaurar(
        inicial.map((chaves) => {
          const v = [...chaves];
          for (let i = v.length - 1; i > 0; i--) {
            const j = Math.floor(sorteio() * (i + 1));
            [v[i], v[j]] = [v[j], v[i]];
          }
          return v;
        }),
      );
    }
    otimizar();
  }
  restaurar(melhor);
}

/* ------------------------------------------------------------------ *
 * 4. A coluna de cada item
 * ------------------------------------------------------------------ */

/** Espaço livre exigido entre dois itens vizinhos na fila. */
const folga = (a: Item, b: Item) => (a.real && b.real ? M.gapX : !a.real && !b.real ? 12 : 18);

/** Distância mínima entre os centros de dois itens vizinhos. */
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

/* Quanto o item cede da posição ideal pra não abrir vão. Sem isso o baricentro
   espalha: em 0, a camada 1 abria 2040px pra 6 módulos. Medido no currículo de
   71 módulos:

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

/**
 * Cada item quer ficar no x que os vizinhos pedem, respeitando o espaçamento
 * mínimo — o que é regressão isotônica e tem solução exata. Antes eu resolvia
 * por empurrão sucessivo e o mapa inchava: a varredura empurra pra direita e
 * nada puxa de volta, e o acumulado deixou o desenho três vezes mais largo do
 * que precisava.
 */
function compactar(camadaItens: Item[], desejado: Map<string, number>) {
  const acumulado: number[] = [0];
  for (let i = 1; i < camadaItens.length; i++) {
    acumulado[i] = acumulado[i - 1] + sep(camadaItens[i - 1], camadaItens[i]);
  }
  /* alvo alternativo: tudo encostado, centrado na média dos desejos */
  const desejos = camadaItens.map((it) => desejado.get(it.chave) ?? it.x);
  const centroDesejo = desejos.reduce((s, v) => s + v, 0) / desejos.length;
  const centroPacote = acumulado.reduce((s, v) => s + v, 0) / acumulado.length;
  const deslocaPacote = centroDesejo - centroPacote;

  const d = camadaItens.map((_, i) => {
    const junto = acumulado[i] + deslocaPacote;
    return (1 - PESO_COMPACTA) * desejos[i] + PESO_COMPACTA * junto - acumulado[i];
  });
  const w = camadaItens.map((it) => (desejado.has(it.chave) ? 1 : 0.05));
  const z = isotonica(d, w);
  camadaItens.forEach((it, i) => (it.x = z[i] + acumulado[i]));
}

/** Encosta tudo à esquerda de novo, pra as voltas não acumularem deriva. */
function reancorar(camadas: Item[][]) {
  const esq = Math.min(...camadas.flat().map((it) => it.x - it.w / 2));
  for (const it of camadas.flat()) it.x -= esq;
}

/** Onde o item pode ir sem invadir os vizinhos de fila. */
function limitesNaFila(itens: Item[], i: number): [number, number] {
  const it = itens[i];
  return [
    i > 0 ? itens[i - 1].x + sep(itens[i - 1], it) : -Infinity,
    i < itens.length - 1 ? itens[i + 1].x - sep(it, itens[i + 1]) : Infinity,
  ];
}

/** Varre as fileiras alternando o sentido, mirando na mediana dos vizinhos. */
function aproximarDosVizinhos(malha: Malha) {
  const { camadas } = malha;
  for (const camadaItens of camadas) {
    let acc = 0;
    for (let i = 0; i < camadaItens.length; i++) {
      if (i > 0) acc += sep(camadaItens[i - 1], camadaItens[i]);
      camadaItens[i].x = acc;
    }
  }

  for (let volta = 0; volta < 16; volta++) {
    const indices =
      volta % 2 === 0 ? [...camadas.keys()].slice(1) : [...camadas.keys()].slice(0, -1).reverse();
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
        const vs = vizinhosDe(malha, it);
        if (!vs.length) continue;
        const xs = vs.map((v) => v.x).sort((a, b) => a - b);
        const m = xs.length >> 1;
        desejado.set(it.chave, xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2);
      }
      compactar(camadas[ci], desejado);
    }
    reancorar(camadas);
  }
}

/**
 * Cada módulo tenta pousar EXATAMENTE no x de um vizinho, e só se couber sem
 * empurrar ninguém. A compactação anterior minimiza a distância média até os
 * vizinhos, o que com seta em curva bastava; com seta ortogonal não, porque
 * 20px de diferença já viram um degrau, e o que se lê como linha limpa é a seta
 * que desce reta.
 *
 * Rende pouco no alinhamento em si, porque com módulo de 156px e fileira
 * apertada quase nunca sobra o espaço exato: das 39 setas que descem retas hoje,
 * 37 já saíam retas sem esta etapa — quem faz esse trabalho é a porta de
 * chegada, na etapa 5. O que ele paga mesmo é cruzamento: desligar aqui sobe de
 * 61 pra 66, ao preço de 22px de largura.
 */
function encaixarNaColunaDoVizinho(malha: Malha) {
  const { camadas } = malha;
  const grau = (it: Item) => vizinhosDe(malha, it).length;

  for (let volta = 0; volta < 4; volta++) {
    const indices = volta % 2 === 0 ? [...camadas.keys()] : [...camadas.keys()].reverse();
    for (const ci of indices) {
      const itens = camadas[ci];
      /* O corredor tenta primeiro, pra corrente longa ficar numa coluna só, e
         depois quem tem mais vizinhos, que é quem tem mais a ganhar. */
      const prioridade = [...itens.keys()].sort(
        (a, b) =>
          Number(!itens[b].real) - Number(!itens[a].real) || grau(itens[b]) - grau(itens[a]),
      );
      for (const i of prioridade) {
        const it = itens[i];
        const vizinhos = vizinhosDe(malha, it);
        if (!vizinhos.length) continue;
        const [limEsq, limDir] = limitesNaFila(itens, i);
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
  reancorar(camadas);
}

/**
 * A seta longa desce numa coluna só pelo maior trecho que couber. Cada corredor
 * nascia da compactação da fileira dele, e sozinhos ficavam fora de prumo uns
 * dos outros — na tela isso é a seta descendo em zigue-zague, desviando 8px
 * numa fileira e voltando 15px na seguinte.
 *
 * O corredor não precisa ficar no vão onde a ordenação o pôs: ele precisa é não
 * encostar em ninguém. Então olho TODOS os vãos livres de cada fileira, vou
 * intersectando enquanto desço, e quando a interseção esvazia fecho ali um
 * trecho e começo outro. Isso dá o menor número de desvios possível.
 */
function endireitarCorredores(malha: Malha) {
  const { camadas, corredorDe, itemDe } = malha;

  /* Os pedaços de uma fileira onde um corredor cabe sem raspar em nada. */
  const vaosLivres = (ci: number, meus: Set<string>): [number, number][] => {
    const obstaculos = camadas[ci]
      .filter((it) => !meus.has(it.chave))
      .map((it): [number, number] => {
        /* A folga aqui é menor que a que a compactação usou: o corredor tem
           22px de largura mas a linha desenhada é fina, então ela pode andar
           uns 12px dentro dele sem chegar perto de módulo nenhum, e são esses
           12px de manobra que deixam a corrente ficar reta por mais fileiras. */
        const meia = it.w / 2 + 6 + M.ponteW / 2;
        return [it.x - meia, it.x + meia];
      })
      .sort((a, b) => a[0] - b[0]);

    const livres: [number, number][] = [];
    let ate = -Infinity;
    for (const [a, b] of obstaculos) {
      /* O vão que o próprio corredor ocupava tem largura exatamente zero, e é o
         candidato mais importante de todos: sem o >= ele sumia da lista e a
         corrente fugia pra borda do mapa atrás de espaço. */
      if (a >= ate - 0.01) livres.push([ate, Math.max(a, ate)]);
      ate = Math.max(ate, b);
    }
    livres.push([ate, Infinity]);
    return livres;
  };

  const intersecao = (a: [number, number], b: [number, number]): [number, number] | null => {
    const lo = Math.max(a[0], b[0]);
    const hi = Math.min(a[1], b[1]);
    return lo <= hi ? [lo, hi] : null;
  };
  const distancia = (v: [number, number], ref: number) => Math.max(v[0] - ref, ref - v[1], 0);

  for (const [id, corredor] of corredorDe) {
    const pontes = [...corredor.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p);
    const meus = new Set(pontes.map((p) => p.chave));
    let alvo = itemDe.get(id)!.x;
    let trecho: Item[] = [];
    let janela: [number, number] | null = null;

    const fecharTrecho = () => {
      if (!janela || !trecho.length) return;
      const x = Math.min(Math.max(alvo, janela[0]), janela[1]);
      for (const p of trecho) p.x = x;
      alvo = x;
      trecho = [];
      janela = null;
    };

    for (const ponte of pontes) {
      const livres = vaosLivres(ponte.camada, meus);
      const atual: [number, number] | null = janela;
      const continua: [number, number] | null = atual
        ? (livres.map((v) => intersecao(atual, v)).find((v) => v) ?? null)
        : null;
      if (continua) {
        janela = continua;
        trecho.push(ponte);
        continue;
      }
      fecharTrecho();
      /* Trecho novo: fico no vão mais perto de onde a seta vinha, mas só se ele
         estiver a um módulo e meio de distância. Sem esse limite a seta acha uma
         coluna livre do outro lado do mapa e atravessa tudo pra descer reta, que
         é pior que o zigue-zague que eu queria tirar. */
      const perto = livres.filter((v) => distancia(v, alvo) <= 1.5 * M.noW);
      const ref = perto.length ? alvo : ponte.x;
      janela = (perto.length ? perto : livres).reduce((melhor, v) =>
        distancia(v, ref) < distancia(melhor, ref) ? v : melhor,
      );
      trecho = [ponte];
    }
    fecharTrecho();
  }
}

/* ------------------------------------------------------------------ *
 * 5. A rota das setas
 * ------------------------------------------------------------------ */

/**
 * A seta só anda na vertical e na horizontal, com o canto arredondado: sai
 * debaixo do módulo, desce, anda de lado no vão vazio entre duas fileiras e
 * desce reta no destino, então a flecha chega sempre por cima. Enquanto era
 * curva de Bézier, toda seta que mudava de coluna descia em diagonal e o olho
 * perdia qual entrava em qual módulo.
 */
interface Ligacoes {
  itemDe: Map<string, Item>;
  correntes: Corrente[];
  /** Quantas setas saem de cada módulo — quem tem mais de uma ganha tronco. */
  saidas: Map<string, number>;
  /** Deslocamento do ponto de chegada em relação ao centro do topo do módulo. */
  portaDe: Map<string, number>;
  /** Deslocamento do ponto de partida em relação ao centro da base. */
  saidaDe: Map<string, number>;
  /** Setas que fazem degrau mesmo com desvio curto, pra entrar junto com a irmã. */
  forcaDegrau: Set<string>;
}

const chaveDaAresta = (corrente: Corrente) => `${corrente.de}»${corrente.para}`;

/**
 * A porta de chegada acompanha a seta, em vez de a seta desviar pra achar a
 * porta. O topo do módulo tem 156px de borda e a seta não precisa entrar pelo
 * meio: se ela vem de uma coluna que cai dentro dessa faixa, entra ali e desce
 * reta, e o degrau que existia só pra centralizar some.
 *
 * Duas setas que vêm de longe do mesmo lado batem no mesmo limite, ganham a
 * mesma porta e se juntam antes de entrar — a junção sai do próprio limite.
 * Agrupar numa porta média as que chegam perto uma da outra foi testado e é
 * pior: em vez de duas retas paralelas entrando lado a lado, dá duas molinhas
 * convergindo.
 */
function escolherPortas(itemDe: Map<string, Item>, correntes: Corrente[]) {
  const portaDe = new Map<string, number>();
  const forcaDegrau = new Set<string>();

  const porDestino = new Map<string, { chave: string; vemDe: number }[]>();
  for (const corrente of correntes) {
    const origem = itemDe.get(corrente.de)!;
    const ultima = corrente.pontes[corrente.pontes.length - 1];
    const lista = porDestino.get(corrente.para) ?? [];
    lista.push({ chave: chaveDaAresta(corrente), vemDe: (ultima ?? origem).x });
    porDestino.set(corrente.para, lista);
  }

  const limite = M.noW / 2 - M.margemPorta;
  for (const [id, lista] of porDestino) {
    const centro = itemDe.get(id)!.x;
    for (const e of lista) {
      portaDe.set(e.chave, Math.min(Math.max(e.vemDe - centro, -limite), limite));
    }

    /* Fusão na chegada: se a seta desce cortando o trecho de lado de uma irmã
       que vai pro MESMO módulo, ela passa a entrar pela porta da irmã e a
       dividir o canal. Antes ela cruzava a irmã pra chegar sozinha na porta do
       lado — dois traços paralelos entrando no mesmo lugar, com um cruzamento
       no meio do caminho que não precisava existir. */
    const comCanal = lista
      .map((e) => ({ e, porta: centro + portaDe.get(e.chave)! }))
      .filter((c) => Math.abs(c.e.vemDe - c.porta) >= M.degrauMinimo)
      .sort((a, b) => Math.abs(b.e.vemDe - b.porta) - Math.abs(a.e.vemDe - a.porta));

    for (const irma of comCanal) {
      const de = Math.min(irma.e.vemDe, irma.porta);
      const ate = Math.max(irma.e.vemDe, irma.porta);
      const sentido = Math.sign(irma.porta - irma.e.vemDe);
      for (const e of lista) {
        if (e === irma.e) continue;
        const porta = centro + portaDe.get(e.chave)!;
        /* Mesma porta e mesmo sentido: a irmã já anda de lado até ali, então
           esta desce até o canal dela e entra junto, em vez de cortar o caminho
           dela em curva pra chegar sozinha no mesmo ponto. */
        if (porta === irma.porta && Math.sign(porta - e.vemDe) === sentido) {
          forcaDegrau.add(e.chave);
          continue;
        }
        /* Porta diferente, mas a descida corta o trecho de lado da irmã: vale
           mudar de porta e entrar junto, que apaga o cruzamento. */
        if (porta !== irma.porta && e.vemDe > de + 0.5 && e.vemDe < ate - 0.5) {
          portaDe.set(e.chave, irma.porta - centro);
          forcaDegrau.add(e.chave);
        }
      }
    }
  }
  return { portaDe, forcaDegrau };
}

/**
 * Quem tem uma seta só desliza o ponto de partida na base do módulo pra ela
 * sair alinhada com o destino. Com duas ou mais, o ponto continua no meio,
 * porque é o tronco compartilhado que faz as irmãs saírem juntas.
 */
function escolherSaidas(
  itemDe: Map<string, Item>,
  correntes: Corrente[],
  saidas: Map<string, number>,
  portaDe: Map<string, number>,
) {
  const saidaDe = new Map<string, number>();
  const limite = M.noW / 2 - M.margemPorta;
  for (const corrente of correntes) {
    if ((saidas.get(corrente.de) ?? 0) > 1) continue;
    const origem = itemDe.get(corrente.de)!;
    const destino = itemDe.get(corrente.para)!;
    const chave = chaveDaAresta(corrente);
    const chegada = destino.x + (portaDe.get(chave) ?? 0);
    const alvo = corrente.pontes.length ? corrente.pontes[0].x : chegada;
    saidaDe.set(chave, Math.min(Math.max(alvo - origem.x, -limite), limite));
  }
  return saidaDe;
}

/**
 * Os cantos da rota, antes de arredondar. Cada corredor dá dois pontos, no topo
 * e na base da faixa dele, pra linha atravessar a fileira de módulos na
 * vertical e todo o desvio horizontal acontecer no vão entre fileiras, que é
 * vazio. Com um ponto só, no centro, o trecho varria na diagonal por dentro da
 * fileira e raspava os módulos vizinhos.
 */
function cantosDaRota(corrente: Corrente, l: Ligacoes): [number, number][] {
  const origem = l.itemDe.get(corrente.de)!;
  const destino = l.itemDe.get(corrente.para)!;
  const base = yDaCamada(origem.camada) + M.noH;
  const chave = chaveDaAresta(corrente);
  return [
    [origem.x + (l.saidaDe.get(chave) ?? 0), base],
    /* Tronco: as setas irmãs descem um trecho reto antes de abrir o leque. Como
       o trecho é idêntico, elas se sobrepõem exatamente e o que se vê é uma
       linha só saindo do módulo, que só então bifurca. */
    ...((l.saidas.get(corrente.de) ?? 0) > 1
      ? ([[origem.x, base + M.tronco]] as [number, number][])
      : []),
    ...corrente.pontes.flatMap(
      (p) =>
        [
          [p.x, yDaCamada(p.camada)],
          [p.x, yDaCamada(p.camada) + M.noH],
        ] as [number, number][],
    ),
    [destino.x + (l.portaDe.get(chave) ?? 0), yDaCamada(destino.camada)],
  ];
}

/** O trecho de lado é curto demais pra virar degrau e sai como curva. */
const desvioCurto = (x0: number, x1: number) => Math.abs(x1 - x0) < M.degrauMinimo;

/** Em que vão cai um ponto: o de baixo da fileira `ci`. */
const vaoDe = (y: number) => Math.floor((y - M.pad) / passoY);

/** Um canal por (vão, ponto de chegada, lado de onde vem). */
const chaveDoCanal = (ci: number, x0: number, x1: number) =>
  `${ci}|${x1.toFixed(1)}|${Math.sign(x1 - x0)}`;

/** Um trecho de lado dentro de um vão, com todas as setas que o dividem. */
interface FaixaLateral {
  chave: string;
  /** Extremos em x, somando todas as setas que entram nesta faixa. */
  a: number;
  b: number;
  /** De onde cada seta desce pra entrar na faixa. */
  entradas: number[];
  /** O ponto de chegada, comum a todas. */
  saida: number;
}

/**
 * O trecho horizontal mora num CANAL dentro do vão. Sem canal, duas setas que
 * andam de lado no mesmo vão viram uma linha só e não dá pra saber quem vai pra
 * onde: aqui cada uma pega a primeira altura livre, e trechos que não se cruzam
 * em x dividem a mesma.
 *
 * Duas setas que terminam no mesmo ponto e vêm do mesmo lado dividem o canal de
 * propósito: elas se sobrepõem no pedaço comum e o que se vê é uma linha só
 * entrando no módulo. O tronco faz isso na saída; isto é o mesmo na chegada.
 */
function escolherCanais(l: Ligacoes): Map<string, number> {
  const porVao = new Map<number, FaixaLateral[]>();
  for (const corrente of l.correntes) {
    const cantos = cantosDaRota(corrente, l);
    const forcado = l.forcaDegrau.has(chaveDaAresta(corrente));
    for (let i = 1; i < cantos.length; i++) {
      const [x0, y0] = cantos[i - 1];
      const [x1] = cantos[i];
      if (desvioCurto(x0, x1) && !(forcado && i === cantos.length - 1)) continue;

      const ci = vaoDe(y0);
      const chave = chaveDoCanal(ci, x0, x1);
      const lista = porVao.get(ci) ?? [];
      const ja = lista.find((t) => t.chave === chave);
      if (ja) {
        ja.a = Math.min(ja.a, x0, x1);
        ja.b = Math.max(ja.b, x0, x1);
        if (!ja.entradas.includes(x0)) ja.entradas.push(x0);
      } else {
        lista.push({ chave, a: Math.min(x0, x1), b: Math.max(x0, x1), entradas: [x0], saida: x1 });
      }
      porVao.set(ci, lista);
    }
  }

  const dentro = (v: number, t: FaixaLateral) => v > t.a + 0.5 && v < t.b - 0.5;
  /* Quantas vezes as duas se cruzam, sabendo quem está no canal de cima: a que
     desce depois atravessa o trecho de lado da que já virou. */
  const cruzamentosNoPar = (cima: FaixaLateral, baixo: FaixaLateral) => {
    let n = 0;
    for (const e of baixo.entradas) if (dentro(e, cima)) n++;
    if (dentro(cima.saida, baixo)) n++;
    return n;
  };

  const canalDe = new Map<string, number>();
  for (const [, lista] of porVao) {
    /* O desvio curto pega o canal de cima e o longo desce mais antes de andar
       de lado; alocar na ordem do x deixa o mapa com mais cruzamento. */
    lista.sort((p, q) => p.b - p.a - (q.b - q.a) || p.a - q.a);
    const ocupadoAte: number[] = [];
    const canal = new Map<string, number>();
    for (const t of lista) {
      let c = 0;
      while (c < ocupadoAte.length && ocupadoAte[c] > t.a + 0.5) c++;
      ocupadoAte[c] = t.b;
      canal.set(t.chave, c);
    }

    /* Troca de canal entre dois trechos enquanto isso desfizer cruzamento. A
       ordem gulosa só olha quem cabe onde, e produz cruzamento que some com uma
       troca — os micro-cruzamentos logo abaixo de um módulo, que não precisavam
       existir: 132 contra 106 no mesmo desenho. */
    const custo = () => {
      let n = 0;
      for (let i = 0; i < lista.length; i++) {
        for (let j = i + 1; j < lista.length; j++) {
          const ci = canal.get(lista[i].chave)!;
          const cj = canal.get(lista[j].chave)!;
          if (ci === cj) continue;
          n +=
            ci < cj ? cruzamentosNoPar(lista[i], lista[j]) : cruzamentosNoPar(lista[j], lista[i]);
        }
      }
      return n;
    };
    const cabeNoCanal = (t: FaixaLateral, c: number) =>
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
          if (!cabeNoCanal(a, cb) || !cabeNoCanal(b, ca) || custo() >= antes) {
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
  return canalDe;
}

/** Monta o `d` do SVG de cada seta. */
function desenharSetas(l: Ligacoes): ArestaLayout[] {
  const canalDe = escolherCanais(l);
  const canaisDoVao = new Map<number, number>();
  for (const [chave, n] of canalDe) {
    const ci = Number(chave.split('|')[0]);
    canaisDoVao.set(ci, Math.max(canaisDoVao.get(ci) ?? 0, n + 1));
  }

  /** Onde fica, em y, o canal `n` de um vão que tem `total` canais. */
  const yDoCanal = (ci: number, n: number, total: number) => {
    const base = yDaCamada(ci) + M.noH;
    const alto = base + M.tronco + M.canto + 3;
    const baixo = base + M.gapY - M.canto - 10;
    if (total <= 1) return (alto + baixo) / 2;
    return alto + ((baixo - alto) * n) / (total - 1);
  };

  const arestas: ArestaLayout[] = [];
  for (const corrente of l.correntes) {
    const cantos = cantosDaRota(corrente, l);
    const forcado = l.forcaDegrau.has(chaveDaAresta(corrente));
    const pontos: [number, number][] = [cantos[0]];
    const n = (v: number) => v.toFixed(1);
    let d = `M ${n(cantos[0][0])} ${n(cantos[0][1])}`;

    for (let i = 1; i < cantos.length; i++) {
      const [x0, y0] = cantos[i - 1];
      const [x1, y1] = cantos[i];

      if (Math.abs(x1 - x0) < 0.5) {
        d += ` V ${n(y1)}`;
        pontos.push([x1, y1]);
        continue;
      }
      /* Degrau curto não vira canto: dois cantos separados por 20px de reta
         parecem defeito de desenho, e uma curva curta lê melhor. A exceção é a
         seta que está entrando junto com uma irmã, que precisa do degrau pra
         cair no canal dela. */
      if (desvioCurto(x0, x1) && !(forcado && i === cantos.length - 1)) {
        const c = (y1 - y0) * 0.42;
        d += ` C ${n(x0)} ${n(y0 + c)}, ${n(x1)} ${n(y1 - c)}, ${n(x1)} ${n(y1)}`;
        pontos.push([x1, y1]);
        continue;
      }

      const ci = vaoDe(y0);
      const ym = yDoCanal(ci, canalDe.get(chaveDoCanal(ci, x0, x1)) ?? 0, canaisDoVao.get(ci) ?? 1);
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
  return arestas;
}

/* ------------------------------------------------------------------ *
 * A montagem
 * ------------------------------------------------------------------ */

export function calcularLayout(
  conceitos: ConceitoBruto[],
  opcoes: { foco?: string } = {},
): Mapa {
  if (!conceitos.length) {
    return { nos: [], arestas: [], areas: [], largura: 0, altura: 0 };
  }
  const { essenciais } = reduzirTransitivamente(conceitos);

  const camadaDe = profundidades(conceitos, essenciais);
  descerExcedente(conceitos, essenciais, camadaDe);
  const nCamadas = Math.max(...conceitos.map((c) => camadaDe.get(c.id)!)) + 1;

  const malha = montarMalha(conceitos, essenciais, camadaDe, nCamadas);
  ordenarFileiras(malha, nCamadas);

  aproximarDosVizinhos(malha);
  encaixarNaColunaDoVizinho(malha);
  endireitarCorredores(malha);
  for (const it of malha.camadas.flat()) it.x += M.pad;

  const nos: NoLayout[] = [];
  for (const camadaItens of malha.camadas) {
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

  const saidas = new Map<string, number>();
  for (const corrente of malha.correntes) {
    saidas.set(corrente.de, (saidas.get(corrente.de) ?? 0) + 1);
  }
  const { portaDe, forcaDegrau } = escolherPortas(malha.itemDe, malha.correntes);
  const saidaDe = escolherSaidas(malha.itemDe, malha.correntes, saidas, portaDe);
  const arestas = desenharSetas({
    itemDe: malha.itemDe,
    correntes: malha.correntes,
    saidas,
    portaDe,
    saidaDe,
    forcaDegrau,
  });

  const areas: AreaLayout[] = ordenarAreas([
    ...new Set(conceitos.map((c) => `${c.materia}/${c.bloco}`)),
  ]).map((chave) => {
    const [materia, bloco] = chave.split('/') as [Materia, string];
    return { bloco, materia, rotulo: rotuloBloco(bloco), slotCor: slotDeCor(materia, bloco) };
  });

  return {
    nos,
    arestas,
    areas,
    largura: Math.max(...malha.camadas.flat().map((it) => it.x + it.w / 2)) + M.pad,
    altura: M.pad * 2 + nCamadas * passoY - M.gapY,
  };
}
