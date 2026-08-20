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
  tempo_leitura?: number;
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
  tempo_leitura: fm.tempo_leitura as number | undefined,
  revisado: fm.revisado === true,
  itens_fuvest: fm.itens_fuvest as number | undefined,
  resumo: fm.resumo as string | undefined,
  Corpo,
}));

export const porId = new Map(conceitos.map((c) => [c.id, c]));

/** Quem aponta pra esta aula. Calculado, nunca declarado. */
export const dependemDe = (id: string) => conceitos.filter((c) => c.prereqs.includes(id));

/* ---------- exercícios ---------- */

/** A dificuldade, e ela não diz de onde o exercício veio: `facil` é o que sai
 *  na primeira leitura, `medio` cobra duas ou três coisas juntas, e `desafio` é
 *  o que exige uma ideia antes da conta. Um básico da aula pode ser desafio, e
 *  uma questão de vestibular pode ser fácil. */
export type NivelExercicio = 'facil' | 'medio' | 'desafio';

export interface Exercicio {
  id: string;
  /** Uma linha dizendo o que o exercício cobra. É o que a busca mostra na lista. */
  resumo: string;
  /**
   * A banca ("FUVEST", "UNICAMP") ou "Autoral", e é ela que diz o que o
   * exercício é: autoral é o básico da aula, e todo o resto é prova de verdade.
   * Não existe campo "basico" pelo mesmo motivo que não existe
   * "multidisciplinar" — dois campos dizendo a mesma coisa acabam divergindo.
   */
  fonte: string;
  ano?: number;
  /** Obrigatório quando não é autoral: é o que a auditoria abre pra conferir se
   *  a transcrição do enunciado bate com o original. */
  fonte_url?: string;
  fonte_questao?: string;
  nivel: NivelExercicio;
  /**
   * As aulas que o exercício cobra, o principal primeiro. Não existe campo
   * "multidisciplinar": quem tem mais de um módulo já é, e a página calcula.
   * Mesma regra do grafo, onde `desbloqueia` não existe.
   */
  modulos: string[];
  /** A resposta, pro checador saber que o exercício tem gabarito declarado. */
  resposta?: string;
  /** Só o Victor troca pra true, e só depois de refazer a conta e comparar o
   *  enunciado com a fonte. Exercício não verificado não aparece na busca. */
  verificado: boolean;
  Corpo: ComponentType<Record<string, unknown>>;
}

const modulosExercicios = import.meta.glob<ModuloMdx>('/content/exercicios/*.mdx', {
  eager: true,
});

export const exercicios: Exercicio[] = carregar(modulosExercicios).map(({ id, fm, Corpo }) => ({
  id,
  resumo: (fm.resumo as string) ?? id,
  fonte: (fm.fonte as string) ?? 'Autoral',
  ano: fm.ano as number | undefined,
  fonte_url: fm.fonte_url as string | undefined,
  fonte_questao: fm.fonte_questao !== undefined ? String(fm.fonte_questao) : undefined,
  nivel: (fm.nivel as NivelExercicio) ?? 'facil',
  modulos: (fm.modulos as string[]) ?? [],
  resposta: fm.resposta !== undefined ? String(fm.resposta) : undefined,
  verificado: fm.verificado === true,
  Corpo,
}));

/**
 * O básico da aula: autoral, de uma aula só, e é o que fecha a página dela.
 * Calculado da fonte, nunca declarado.
 */
export const ehBasico = (e: Exercicio) => e.fonte.trim().toLowerCase() === 'autoral';

/** "FUVEST 2024", ou "básico da aula" — pro aluno, "Autoral" não quer dizer nada. */
export const rotuloFonte = (e: Exercicio) =>
  ehBasico(e) ? 'básico da aula' : e.ano ? `${e.fonte} ${e.ano}` : e.fonte;

/**
 * O que aparece no site. Exercício não verificado fica FORA do site publicado, e
 * não escondido atrás de um selo: resolução com sinal trocado que o Victor ainda
 * não leu é pior que exercício nenhum.
 *
 * Em `npm run dev` ele aparece, com o selo de não verificado e um filtro só pra
 * ele. É essa a mesa de auditoria enquanto não existe conta de admin: quem roda
 * o dev é o Victor, e o editor continua sendo o VS Code.
 */
export const exerciciosVisiveis = import.meta.env.DEV
  ? exercicios
  : exercicios.filter((e) => e.verificado);

/** Os do fim da aula: os básicos daquele módulo, na ordem que o arquivo dá. */
export const exerciciosDaAula = (id: string) =>
  exerciciosVisiveis.filter((e) => ehBasico(e) && e.modulos[0] === id);
