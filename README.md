# Pré-vestibular

Material de aula presencial 1-a-1 para FUVEST — Matemática e Física.
Roda offline num notebook, na casa do aluno.

## Começar

```bash
npm install
npm run dev        # http://localhost:4321
```

## Em aula

**Nunca use `npm run dev` na casa do aluno.** Dev server recompila, trava e cai
no meio da explicação. Faça o build em casa e sirva estático:

```bash
npm run aula       # build + serve dist/ na porta 4321
```

Assim funciona sem internet e nada quebra se o Wi-Fi cair.

## Comandos

| | |
|---|---|
| `npm run dev` | desenvolvimento |
| `npm run build` | gera `dist/` |
| `npm run aula` | build + servidor estático — **é o de aula** |
| `npm run grafo` | valida elo morto, ciclo e prereq redundante |

Rode `npm run grafo` depois de toda sessão que mexer em `content/`.

## Onde as coisas ficam

```
content/conceitos/*.mdx     ← o conteúdo. É o ativo do projeto.
content/exercicios/*.mdx
src/components/viz/         ← os gráficos interativos
CLAUDE.md                   ← leia antes de gerar qualquer conteúdo
```

`content/` fica fora de `src/` de propósito: se um dia o app for reescrito, essa
pasta migra intacta.

## Atalhos em aula

`Alt+1` estudo · `Alt+2` aula · `Alt+Z` tamanho da fonte · `Esc` fecha painel

## Estado

Protótipo. O conceito de **Junção** (`content/conceitos/juncao.mdx`) é a fatia
vertical completa que valida o pipeline: conceito + pré-requisitos linkados +
componente interativo + exercícios nos três níveis.

Todo conteúdo está em `revisado: false`. Isso é intencional — veja a seção 8.1 do
`CLAUDE.md`.
