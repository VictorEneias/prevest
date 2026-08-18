# Pré-vestibular

Material de aula presencial 1-a-1 para FUVEST — Matemática e Física.
Roda offline num notebook, na casa do aluno.

O aluno está no ensino médio: prestando vestibular ou tentando acompanhar a
escola. O site existe pra ele tapar o buraco que ficou pra trás, então o que
entra do fundamental é só o que ele executa sem entender e que trava o resto.

Vite + React + MDX. Um comando só.

## Começar

```bash
npm install
npm run dev        # http://localhost:4321
```

**`npm run dev` é o comando de aula também.** Sobe em segundos, e o que eu edito
aparece na tela na hora.

## Comandos

| | |
|---|---|
| `npm run dev` | o único comando do dia a dia, e o de aula |
| `npm run grafo` | frontmatter inválido, elo morto, ciclo, prereq redundante, aula sem tópicos |
| `npm run paginas` | renderiza todas as páginas no node e diz qual quebrou |
| `npm run check` | `tsc --noEmit` |
| `npm run build` | gera `dist/`, só pra publicar na nuvem |

Rode `npm run grafo` e `npm run paginas` depois de toda sessão que mexer em
`content/`.

## Como o conteúdo é organizado

Uma aula é **um arquivo de prosa**: markdown com títulos, fórmulas e os
componentes de visualização soltos no meio. Sem componente de camada, sem
estrutura de blocos.

Cada aula declara no frontmatter os **tópicos** que cobre. São duas
granularidades de propósito:

- o **mapa** tem 84 aulas e mostra como o curso se encaixa;
- o **índice** (`/indice`) tem 754 tópicos e serve pra quem chega com uma dúvida
  que já tem nome.

Quem procura "distância de ponto a reta" acha pelo índice, sem que esse assunto
precise virar um nó no mapa.

## Onde as coisas ficam

```
content/conceitos/*.mdx     ← o conteúdo. É o ativo do projeto.
src/components/viz/         ← os gráficos interativos
src/conteudo.ts             ← o índice do conteúdo, feito com import.meta.glob
src/pages/Indice.tsx        ← o índice remissivo
CLAUDE.md                   ← leia antes de gerar qualquer conteúdo
```

`content/` fica fora de `src/` de propósito: quando o app for reescrito, essa
pasta migra intacta. Foi o que aconteceu na saída do Astro, e de novo quando as
camadas saíram: nenhuma frase de conteúdo mudou.

## Publicar

`npm run build` cospe `dist/` estático. É uma SPA, então o host precisa devolver
`index.html` pra qualquer caminho, senão abrir `/conceitos/juncao` direto dá 404.

## Atalhos em aula

`Alt+1` estudo · `Alt+2` aula · `Alt+Z` tamanho da fonte · `Esc` fecha painel

Em Modo Aula a prosa some e ficam títulos, fórmulas e figuras. Quem explica sou
eu; o texto fica pro aluno reler em casa.

## Estado

Protótipo, com o currículo de Matemática desenhado inteiro e seis aulas escritas:
reta numérica, conjuntos numéricos, o que cada operação faz, junção, esticamento
e frações. As outras 78 são esqueleto honesto — dizem o que vão cobrir e o que
falta decidir.

Física ainda tem zero aulas, e as cinco áreas dela já estão nomeadas em
`src/lib/curriculo.ts`.

Todo conteúdo está em `revisado: false`. Isso é intencional — veja a seção 8.1 do
`CLAUDE.md`.
