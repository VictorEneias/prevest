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
/** `base` é revisão de fundamental que ficou porque trava o resto; `medio` é
 *  conteúdo de ensino médio. Quem usa o site já está no ensino médio. */
export type Nivel = 'base' | 'medio';

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
  /**
   * O que esta aula cobre por dentro, em linguagem de aluno. É o índice
   * remissivo do site: o grafo mostra 84 aulas, e é por aqui que alguém com
   * dúvida em "distância de ponto a reta" chega na aula certa sem que cada
   * assunto vire um nó no mapa.
   */
  topicos: string[];
  tempo_estimado?: number;
  /** Marca o rascunho na página. Só o Victor troca pra true, e só depois de
   *  refazer a conta linha por linha. */
  revisado: boolean;
  itens_fuvest?: number;
  resumo?: string;
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

export const conceitos: Conceito[] = carregar(modulosConceitos).map(({ id, fm, Corpo }) => ({
  id,
  titulo: (fm.titulo as string) ?? id,
  subtitulo: fm.subtitulo as string | undefined,
  materia: (fm.materia as Materia) ?? 'matematica',
  bloco: (fm.bloco as string) ?? 'aritmetica',
  prereqs: (fm.prereqs as string[]) ?? [],
  nivel: (fm.nivel as Nivel) ?? 'medio',
  topicos: (fm.topicos as string[]) ?? [],
  tempo_estimado: fm.tempo_estimado as number | undefined,
  revisado: fm.revisado === true,
  itens_fuvest: fm.itens_fuvest as number | undefined,
  resumo: fm.resumo as string | undefined,
  Corpo,
}));

export const porId = new Map(conceitos.map((c) => [c.id, c]));

/** Quem aponta pra esta aula. Calculado, nunca declarado. */
export const dependemDe = (id: string) => conceitos.filter((c) => c.prereqs.includes(id));
