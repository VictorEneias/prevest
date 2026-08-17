/**
 * O índice do conteúdo. Substitui as content collections do Astro.
 *
 * Os .mdx de /content viram módulos no build do Vite, e cada um exporta o corpo
 * já compilado mais o frontmatter. Aqui eu só normalizo os campos que têm padrão
 * e ordeno por id, porque a ordem da lista entra no layout do mapa e eu quero o
 * mesmo desenho a cada carga.
 *
 * Quem confere se o frontmatter está válido é o `npm run grafo`, que já lê esses
 * arquivos pra validar o grafo. Antes essa checagem era dividida entre o Zod e o
 * script, e agora mora num lugar só.
 */
import type { ComponentType } from 'react';

export type Materia = 'matematica' | 'fisica';
export type Nivel = 'fundamento' | 'basico' | 'medio' | 'avancado';
export type NivelExercicio = 'A' | 'B' | 'C';

export interface Conceito {
  id: string;
  titulo: string;
  subtitulo?: string;
  materia: Materia;
  /** A área do mapa, que escolhe a cor. Máximo 5 por matéria, ver lib/curriculo.ts */
  bloco: string;
  /**
   * O grafo, numa direção só. Não existe campo inverso: quem depende deste
   * conceito é calculado por dependemDe(). Declare só o prereq mais próximo.
   */
  prereqs: string[];
  nivel: Nivel;
  tempo_estimado?: number;
  /** Portão de revisão: enquanto for false o Modo Aula esconde as camadas. */
  revisado: boolean;
  itens_fuvest?: number;
  resumo?: string;
  Corpo: ComponentType<Record<string, unknown>>;
}

export interface Exercicio {
  id: string;
  fonte: string;
  assuntos: string[];
  nivel: NivelExercicio;
  tempo_alvo?: number;
  revisado: boolean;
  gabarito?: string;
  Corpo: ComponentType<Record<string, unknown>>;
}

type ModuloMdx = {
  default: ComponentType<Record<string, unknown>>;
  frontmatter?: Record<string, unknown>;
};

const idDoCaminho = (caminho: string) => caminho.split('/').pop()!.replace(/\.mdx$/, '');

function carregar(modulos: Record<string, ModuloMdx>) {
  return Object.entries(modulos)
    .map(([caminho, mod]) => ({
      id: idDoCaminho(caminho),
      fm: mod.frontmatter ?? {},
      Corpo: mod.default,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

const modulosConceitos = import.meta.glob<ModuloMdx>('/content/conceitos/*.mdx', { eager: true });
const modulosExercicios = import.meta.glob<ModuloMdx>('/content/exercicios/*.mdx', { eager: true });

export const conceitos: Conceito[] = carregar(modulosConceitos).map(({ id, fm, Corpo }) => ({
  id,
  titulo: (fm.titulo as string) ?? id,
  subtitulo: fm.subtitulo as string | undefined,
  materia: (fm.materia as Materia) ?? 'matematica',
  bloco: (fm.bloco as string) ?? 'aritmetica',
  prereqs: (fm.prereqs as string[]) ?? [],
  nivel: (fm.nivel as Nivel) ?? 'medio',
  tempo_estimado: fm.tempo_estimado as number | undefined,
  revisado: fm.revisado === true,
  itens_fuvest: fm.itens_fuvest as number | undefined,
  resumo: fm.resumo as string | undefined,
  Corpo,
}));

export const exercicios: Exercicio[] = carregar(modulosExercicios).map(({ id, fm, Corpo }) => ({
  id,
  fonte: (fm.fonte as string) ?? 'Autoral',
  assuntos: (fm.assuntos as string[]) ?? [],
  nivel: (fm.nivel as NivelExercicio) ?? 'B',
  tempo_alvo: fm.tempo_alvo as number | undefined,
  revisado: fm.revisado === true,
  gabarito: fm.gabarito as string | undefined,
  Corpo,
}));

export const porId = new Map(conceitos.map((c) => [c.id, c]));
export const exercicioPorId = new Map(exercicios.map((e) => [e.id, e]));

/** Quem aponta pra este conceito. Calculado, nunca declarado. */
export const dependemDe = (id: string) => conceitos.filter((c) => c.prereqs.includes(id));
