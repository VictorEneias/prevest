import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * O conteúdo vive em /content, FORA de /src, de propósito.
 * O app é descartável; o conteúdo é o ativo. Se um dia trocar de stack,
 * essa pasta migra intacta.
 */

const MATERIAS = ['matematica', 'fisica'] as const;
const NIVEIS = ['fundamento', 'basico', 'medio', 'avancado'] as const;

const conceitos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/conceitos' }),
  schema: z.object({
    titulo: z.string(),
    subtitulo: z.string().optional(),
    materia: z.enum(MATERIAS),
    bloco: z.string(), // ex: "aritmetica", "geometria-plana", "cinematica"

    // O grafo. Só ids de outros conceitos. O build quebra se apontar pro vazio.
    prereqs: z.array(z.string()).default([]),
    desbloqueia: z.array(z.string()).default([]),

    nivel: z.enum(NIVEIS).default('medio'),
    tempo_estimado: z.number().int().positive().optional(), // minutos de aula

    // Portão de revisão. Enquanto for false, o Modo Aula recusa exibir.
    // NUNCA marque true sem ter lido linha por linha.
    revisado: z.boolean().default(false),

    // Rastreabilidade: quantos itens FUVEST esse bloco representa (das tabelas do Raio X)
    itens_fuvest: z.number().int().nonnegative().optional(),

    resumo: z.string().optional(), // 1 frase, usada na busca e no card do painel
  }),
});

const exercicios = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/exercicios' }),
  schema: z.object({
    fonte: z.string(), // "FUVEST 2019 — 1ª fase, Q42" ou "Autoral"
    assuntos: z.array(z.string()).min(1), // ids de conceitos
    nivel: z.enum(['A', 'B', 'C']), // A=mecânica, B=vestibular padrão, C=integração
    tempo_alvo: z.number().int().positive().optional(), // minutos
    revisado: z.boolean().default(false),
    gabarito: z.string().optional(),
  }),
});

export const collections = { conceitos, exercicios };
