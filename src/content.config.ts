import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * O conteúdo mora em /content, fora de /src, de propósito: o app é descartável
 * e o conteúdo é o ativo. Se um dia eu trocar de stack, essa pasta migra
 * intacta.
 */

const MATERIAS = ['matematica', 'fisica'] as const;
const NIVEIS = ['fundamento', 'basico', 'medio', 'avancado'] as const;

const conceitos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/conceitos' }),
  schema: z.object({
    titulo: z.string(),
    subtitulo: z.string().optional(),
    materia: z.enum(MATERIAS),
    bloco: z.string(), // a área do mapa. Máximo 5 por matéria, ver lib/curriculo.ts

    /**
     * O grafo, numa direção só: id de conceito que existe (quem checa é o
     * npm run grafo, o Zod aqui só garante que é lista de string).
     *
     * Não tem campo inverso: quem depende deste conceito é calculado. Assim um
     * elo é uma linha num arquivo só e os dois lados não têm como divergir.
     *
     * Declare só o prereq mais próximo. Se A já vem por B, não liste A.
     */
    prereqs: z.array(z.string()).default([]),

    nivel: z.enum(NIVEIS).default('medio'),
    tempo_estimado: z.number().int().positive().optional(), // minutos de aula

    // Portão de revisão: enquanto for false o Modo Aula esconde as camadas.
    // Só marco true depois de ler linha por linha.
    revisado: z.boolean().default(false),

    itens_fuvest: z.number().int().nonnegative().optional(), // do Raio X FUVEST

    resumo: z.string().optional(), // 1 frase, usada na busca e no cartão do painel
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
