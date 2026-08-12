/**
 * As constantes do currículo: as áreas (blocos) de cada matéria.
 *
 * NÃO existe divisão por ano escolar. Foi uma tentativa descartada de propósito:
 * a escola ensina fração no 6º e de novo, mais fundo, no 8º — e o aluno que vem
 * tapar um buraco não quer atravessar trinta módulos pra achar o assunto. Cada
 * assunto mora num módulo só, e a ordem do mapa é a ordem de DEPENDÊNCIA, não a
 * ordem do calendário escolar.
 *
 * Fica fora do content.config.ts pra não criar dependência circular.
 */

export type Materia = 'matematica' | 'fisica';

/**
 * As áreas, em ordem. A posição na lista faz duas coisas:
 *   1. escolhe a cor (slot 1..5 da paleta)
 *   2. dá a "gravidade" horizontal — o mapa puxa os módulos de uma mesma área
 *      pra perto uns dos outros, sem forçar
 *
 * MÁXIMO 5 POR MATÉRIA. Não é gosto: a paleta foi validada contra o papel do
 * site e cinco é o teto medido. Com azul e vermelho reservados pra sinal e o
 * amarelo pra rascunho, nenhum sexto tom passa na separação de daltonismo — o
 * verde falha até pra visão normal. Bloco fora da lista cai em cinza neutro.
 *
 * A ordem também importa pro desenho: áreas que se conectam muito devem ficar
 * VIZINHAS na lista, porque isso encurta as setas que cruzam áreas.
 */
export const BLOCOS_POR_MATERIA: Record<Materia, string[]> = {
  matematica: ['aritmetica', 'algebra', 'funcoes', 'geometria', 'estatistica'],
  fisica: ['cinematica', 'dinamica', 'ondas', 'eletricidade', 'termologia'],
};

export const ROTULO_BLOCO: Record<string, string> = {
  aritmetica: 'Aritmética',
  algebra: 'Álgebra',
  funcoes: 'Funções',
  geometria: 'Geometria',
  estatistica: 'Dados e contagem',
  cinematica: 'Cinemática',
  dinamica: 'Dinâmica',
  ondas: 'Ondas',
  eletricidade: 'Eletricidade',
  termologia: 'Termologia',
};

/** Vira "Geometria plana" a partir de "geometria-plana" quando não há rótulo. */
export function rotuloBloco(bloco: string): string {
  if (ROTULO_BLOCO[bloco]) return ROTULO_BLOCO[bloco];
  const s = bloco.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const ROTULO_MATERIA: Record<Materia, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
};

/**
 * Slot de cor do bloco dentro da matéria: 1..5, ou 0 pro neutro.
 * Vira a variável CSS --bloco-1 … --bloco-5 no global.css.
 */
export function slotDeCor(materia: Materia, bloco: string): number {
  const i = (BLOCOS_POR_MATERIA[materia] ?? []).indexOf(bloco);
  return i >= 0 && i < 5 ? i + 1 : 0;
}

export const ORDEM_MATERIAS: Materia[] = ['matematica', 'fisica'];

/**
 * Ordena as áreas que de fato aparecem no mapa: primeiro por matéria, depois
 * pela posição declarada em BLOCOS_POR_MATERIA. É essa ordem que vira a
 * "gravidade" horizontal — e é por isso que áreas que se conectam muito devem
 * estar VIZINHAS na lista.
 */
export function ordenarAreas(chaves: string[]): string[] {
  return [...chaves].sort((a, b) => {
    const [ma, ba] = a.split('/') as [Materia, string];
    const [mb, bb] = b.split('/') as [Materia, string];
    const dm = ORDEM_MATERIAS.indexOf(ma) - ORDEM_MATERIAS.indexOf(mb);
    if (dm !== 0) return dm;
    const ia = (BLOCOS_POR_MATERIA[ma] ?? []).indexOf(ba);
    const ib = (BLOCOS_POR_MATERIA[mb] ?? []).indexOf(bb);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || ba.localeCompare(bb, 'pt-BR');
  });
}
