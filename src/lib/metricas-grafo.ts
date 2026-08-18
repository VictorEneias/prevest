/**
 * Mede a qualidade do desenho do mapa. Nada aqui roda quando o site abre: são
 * as contas que eu uso pra decidir se uma mudança no layout melhorou ou piorou,
 * rodando num script à parte contra o currículo inteiro e contra recortes dele.
 *
 * Sem isso, "ficou melhor" vira opinião — e já aconteceu de uma ideia bonita
 * (agrupar módulos da mesma área) medir bem numa conta e destruir o desenho na
 * outra.
 */
import type { Mapa } from './layout-grafo';

interface Segmento {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Módulos que são ponta de alguma seta que passa por aqui. */
  pontas: Set<string>;
}

/**
 * Os segmentos desenhados, sem repetição. Trecho compartilhado por várias setas
 * (o tronco, o corredor, o canal de chegada) é uma linha só na tela, então
 * conta uma vez só, senão a métrica pune o desenho justamente por ele estar
 * mais limpo.
 */
function segmentosDe(mapa: Mapa): Segmento[] {
  const porChave = new Map<string, Segmento>();
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

const ladoDe = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) =>
  Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));

/** A ponta de um segmento está pousada em cima do outro. */
function encostaNoMeio(s: Segmento, x: number, y: number) {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const comprimento = Math.hypot(dx, dy);
  if (comprimento < 0.6) return false;
  const distancia = Math.abs(dy * (x - s.x1) - dx * (y - s.y1)) / comprimento;
  if (distancia > 0.6) return false;
  const t = ((x - s.x1) * dx + (y - s.y1) * dy) / (comprimento * comprimento);
  return t >= -0.01 && t <= 1.01;
}

/**
 * Setas que se cruzam de verdade.
 *
 * Encostar não é cruzar, e são dois casos: dois trechos que saem do mesmo ponto
 * (a bifurcação do tronco, ou dois trechos seguidos da mesma seta) e o T, que é
 * uma seta entrando no canal de outra pra chegarem juntas no mesmo módulo.
 * Depois que a rota passou a fundir setas na chegada, contar o T inflava o
 * número: os 113 do currículo eram 61.
 */
export function contarCruzamentos(mapa: Mapa): number {
  const seg = segmentosDe(mapa);
  let n = 0;
  for (let i = 0; i < seg.length; i++) {
    for (let j = i + 1; j < seg.length; j++) {
      const p = seg[i];
      const q = seg[j];
      const tocaNaPonta =
        (perto(p.x1, q.x1) && perto(p.y1, q.y1)) ||
        (perto(p.x1, q.x2) && perto(p.y1, q.y2)) ||
        (perto(p.x2, q.x1) && perto(p.y2, q.y1)) ||
        (perto(p.x2, q.x2) && perto(p.y2, q.y2));
      if (tocaNaPonta) continue;
      const emT =
        encostaNoMeio(q, p.x1, p.y1) ||
        encostaNoMeio(q, p.x2, p.y2) ||
        encostaNoMeio(p, q.x1, q.y1) ||
        encostaNoMeio(p, q.x2, q.y2);
      if (emT) continue;
      if (
        ladoDe(p.x1, p.y1, p.x2, p.y2, q.x1, q.y1) !==
          ladoDe(p.x1, p.y1, p.x2, p.y2, q.x2, q.y2) &&
        ladoDe(q.x1, q.y1, q.x2, q.y2, p.x1, p.y1) !== ladoDe(q.x1, q.y1, q.x2, q.y2, p.x2, p.y2)
      ) {
        n++;
      }
    }
  }
  return n;
}

/**
 * Setas passando por cima de um módulo que não é ponta delas. Tem que dar zero:
 * seta cortando módulo é o único defeito do desenho que não dá pra relevar.
 */
export function contarSobreposicoes(mapa: Mapa): number {
  let n = 0;
  for (const s of segmentosDe(mapa)) {
    for (const no of mapa.nos) {
      if (s.pontas.has(no.id)) continue;
      if (cruzaRetangulo(s, no.x, no.y, no.x + no.w, no.y + no.h)) n++;
    }
  }
  return n;
}

/** Recorte de Liang–Barsky do segmento contra o retângulo do módulo. */
function cruzaRetangulo(
  s: Segmento,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): boolean {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of [
    [-dx, s.x1 - x0],
    [dx, x1 - s.x1],
    [-dy, s.y1 - y0],
    [dy, y1 - s.y1],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return t0 < t1;
}
