import { getCollection, type CollectionEntry } from 'astro:content';

export type Conceito = CollectionEntry<'conceitos'>;

export async function mapaConceitos() {
  const todos = await getCollection('conceitos');
  return new Map(todos.map((c) => [c.id, c]));
}

/** Pré-requisitos diretos, resolvidos. */
export async function prereqsDe(c: Conceito) {
  const mapa = await mapaConceitos();
  return c.data.prereqs.map((id) => ({ id, entrada: mapa.get(id) }));
}

/** Quem aponta pra este conceito (calculado, não declarado). */
export async function dependemDe(id: string) {
  const todos = await getCollection('conceitos');
  return todos.filter((c) => c.data.prereqs.includes(id));
}

/** Cadeia completa de pré-requisitos, em profundidade. Detecta ciclo. */
export async function cadeiaCompleta(id: string, vistos = new Set<string>()): Promise<string[]> {
  const mapa = await mapaConceitos();
  const c = mapa.get(id);
  if (!c || vistos.has(id)) return [];
  vistos.add(id);
  const out: string[] = [];
  for (const p of c.data.prereqs) {
    out.push(...(await cadeiaCompleta(p, vistos)), p);
  }
  return [...new Set(out)];
}
