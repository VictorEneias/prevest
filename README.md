# Pré-vestibular

Material de aula presencial 1-a-1 para FUVEST — Matemática e Física.
Roda offline num notebook, na casa do aluno.

Vite + React + MDX. Um comando só.

## Começar

```bash
npm install
npm run dev        # http://localhost:4321
```

**`npm run dev` é o comando de aula também.** Sobe em segundos, e o que eu edito
aparece na tela na hora. O projeto foi Astro até aqui, com um build separado pra
servir `dist/` em aula; isso saiu porque na prática eu usava o dev de qualquer
jeito, e o build só criava a chance de eu estar servindo página velha sem saber.

## Comandos

| | |
|---|---|
| `npm run dev` | o único comando do dia a dia, e o de aula |
| `npm run grafo` | frontmatter inválido, elo morto, ciclo, prereq redundante |
| `npm run paginas` | renderiza todas as páginas no node e diz qual quebrou |
| `npm run check` | `tsc --noEmit` |
| `npm run build` | gera `dist/`, só pra publicar na nuvem |

Rode `npm run grafo` e `npm run paginas` depois de toda sessão que mexer em
`content/`. Os dois juntos são o que o build fazia de graça antes: um confere o
frontmatter e o grafo, o outro confere que toda página ainda renderiza.

## Onde as coisas ficam

```
content/conceitos/*.mdx     ← o conteúdo. É o ativo do projeto.
content/exercicios/*.mdx
src/components/viz/         ← os gráficos interativos
src/conteudo.ts             ← o índice do conteúdo, feito com import.meta.glob
CLAUDE.md                   ← leia antes de gerar qualquer conteúdo
```

`content/` fica fora de `src/` de propósito: quando o app for reescrito, essa
pasta migra intacta. Foi o que aconteceu na saída do Astro — nenhum `.mdx` mudou.

## Publicar

`npm run build` cospe `dist/` estático. É uma SPA, então o host precisa devolver
`index.html` pra qualquer caminho, senão abrir `/conceitos/juncao` direto dá 404.

## Atalhos em aula

`Alt+1` estudo · `Alt+2` aula · `Alt+Z` tamanho da fonte · `Esc` fecha painel

## Estado

Protótipo. O conceito de **Junção** (`content/conceitos/juncao.mdx`) é a fatia
vertical completa que valida o pipeline: conceito + pré-requisitos linkados +
componente interativo + exercícios nos três níveis.

Todo conteúdo está em `revisado: false`. Isso é intencional — veja a seção 8.1 do
`CLAUDE.md`.
