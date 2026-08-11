# CLAUDE.md

Instruções para o Claude Code neste repositório. Leia inteiro antes de escrever
qualquer arquivo em `content/`.

---

## 1. O que este projeto é

Material de aula presencial 1-a-1 para pré-vestibular (FUVEST), Matemática e
Física. Roda em localhost num notebook levado à casa do aluno.

**O site é ~5% do trabalho. Os outros 95% são o conteúdo.** Toda decisão técnica
é julgada por uma pergunta só: *isso reduz o atrito de escrever conteúdo?* Se a
resposta for não, não faça.

O professor é Victor. Ele explica bem falando, tem visão espacial forte e o
gargalo dele é não conseguir mostrar o que imagina. **Os componentes interativos
existem pra resolver isso** — não são enfeite, são o produto.

### Não-objetivos (não implemente, mesmo se parecer útil)

- Login, contas, banco de dados, backend
- Dashboard de progresso do aluno, gamificação, pontuação
- Multi-tenant, pagamento, qualquer coisa de SaaS
- Dark mode
- Um CMS ou painel admin — o CMS é o VS Code

Se algo disso for pedido, pergunte antes de construir: quase sempre não melhora
uma aula, e é o modo clássico de o projeto morrer com a infra linda e o conteúdo
vazio.

---

## 2. Arquitetura

Astro 5 + MDX + ilhas React. Saída 100% estática.

```
content/                 ← O ATIVO. Fora de src/ de propósito.
  conceitos/*.mdx          Se um dia trocar de stack, esta pasta migra intacta.
  exercicios/*.mdx
src/
  content.config.ts      ← schemas Zod. Frontmatter inválido quebra o build.
  components/
    C.astro                elo de pré-requisito
    mdx.ts                 barrel: tudo aqui fica disponível no MDX sem import
    camadas/*.astro        Explicacao (prosa estática), Curiosidade, Dica,
                           Resolucao, Pensamento, Erros
    viz/
      Juncao.tsx           o componente React interativo (canônico)
      Juncao.astro         wrapper que aplica client:visible  ← LEIA A SEÇÃO 6
      Setas.astro          figura ESTÁTICA de junção (Astro puro, sem React)
  layouts/BaseLayout.astro pilha de painéis, Modo Aula, atalhos
  lib/grafo.ts             helpers do grafo
  pages/
    conceitos/[id].astro   página inteira
    fragmento/[id].astro   versão sem cromo, carregada no iframe do painel
    exercicios/[id].astro
scripts/checar-grafo.mjs  ← npm run grafo
```

### Comandos

| | |
|---|---|
| `npm run dev` | desenvolvimento (só em casa) |
| `npm run build` | gera `dist/` |
| `npm run aula` | build + serve estático na porta 4321 — **é isso que roda na casa do aluno** |
| `npm run grafo` | valida o grafo: elo morto, ciclo, reciprocidade |

**Nunca instrua o Victor a rodar `npm run dev` na casa do aluno.** Dev server
cai, recompila, trava. Em aula é `dist/` servido estático.

---

## 3. O grafo de conceitos

Cada conceito atômico é um `.mdx` em `content/conceitos/`. O nome do arquivo é o
`id`. Sempre kebab-case, sem acento: `juncao.mdx`, `geometria-plana-areas.mdx`.

### Frontmatter de conceito

```yaml
---
titulo: Junção
subtitulo: Por que a subtração não existe   # opcional, uma linha
materia: matematica                          # matematica | fisica
bloco: aritmetica                            # agrupador solto: "geometria-plana", "cinematica"
prereqs: [reta-numerica, numeros-negativos]  # ids que o aluno precisa ANTES
desbloqueia: [termos-semelhantes]            # ids que dependem deste
nivel: fundamento                            # fundamento | basico | medio | avancado
tempo_estimado: 45                           # minutos de aula
revisado: false                              # ← SEMPRE false ao criar. Ver seção 8.
itens_fuvest: 58                             # opcional, do Raio X FUVEST
resumo: Uma frase. Aparece na busca e no cartão do painel.
---
```

**Regras do grafo:**

1. `prereqs` só aponta pra conceitos que **já existem**. Se precisar de um que não
   existe, crie o esqueleto dele primeiro (seção 8).
2. Se A declara `desbloqueia: [B]`, então B deve ter A em `prereqs`. O
   `npm run grafo` avisa quando falta.
3. Sem ciclos. `npm run grafo` detecta.
4. Rode `npm run grafo` depois de **toda** sessão que mexer em `content/`.

### Ordem de currículo ≠ ordem de construção

O grafo **declara** dependência; ele não é uma fila. Construir o conceito 47 antes
do 3 não quebra nada. O currículo é base-first; a construção é oportunista, guiada
pelo que os alunos do Victor estão vendo na escola naquela semana.

---

## 4. Componentes disponíveis no MDX

Tudo em `src/components/mdx.ts` está disponível em qualquer `.mdx`
**sem import e sem diretiva `client:`**. Não escreva `import` em arquivos de
conteúdo. Nunca.

### `<C id="...">texto</C>` — elo de pré-requisito

```mdx
Logaritmo é a pergunta invertida da <C id="potenciacao">potenciação</C>.
```

Não navega: abre um painel por cima, e os painéis **empilham**. Serve pro momento
em que o aluno trava no meio da explicação e o Victor precisa descer dois níveis e
voltar sem perder o fio.

Use quando o texto menciona um conceito que é pré-requisito real. **Não** encha o
texto de elos — 3 a 6 por página é o razoável. Elo demais vira ruído e o aluno
para de clicar.

### Camadas — o que some no Modo Aula

| Componente | Retrátil? | Some em aula? | Serve pra |
|---|---|---|---|
| `<Explicacao>` | **não** — prosa estática | sim, sempre | a teoria escrita |
| `<Curiosidade rotulo="...">` | sim, nasce fechada | sim | um aparte opcional: a demonstração / o *porquê* que o aluno abre só se quiser |
| `<Dica n={1\|2\|3}>` | sim, sempre fechada | sempre fechada | a escada de dicas |
| `<Resolucao>` | sim | sim | as contas |
| `<Pensamento>` | sim | sim | o raciocínio antes da conta |
| `<Erros>` | sim | sim | as armadilhas |

**`<Explicacao>` NÃO é mais uma caixa retrátil.** É texto corrido: no Modo Estudo
aparece como prosa normal, sem rótulo e sem clique; no Modo Aula e no Modo Prova
some inteiro. Nada de empilhar "Exemplo 2" como rótulo de camada — pra rotular um
exemplo, use um título de verdade (`### Exemplo 2`), que sobrevive no Modo Aula.

As outras camadas continuam retráteis (`<details>`). Em página **não revisada**
elas somem em Aula/Prova (portão da seção 8.1); em página revisada, colapsam pro
rótulo. `<Explicacao>`, por ser prosa, some em Aula/Prova sempre — revisada ou não.

**Regra de ouro da estrutura de página:** títulos (`##`, `###`) e componentes
(o interativo `<Juncao>`, a figura estática `<Setas>`) ficam FORA das camadas; a
prosa fica DENTRO de `<Explicacao>`. Assim, em Modo Aula a página vira o esqueleto
de títulos + gráficos, e quem explica é o Victor. O texto continua ali pro aluno
reler em casa no Modo Estudo.

```mdx
## O primeiro ganho: a ordem parou de importar

<Explicacao>
Prosa aqui — some em Modo Aula.
</Explicacao>

<Juncao parcelas={[5, -8, 3, 2]} titulo="Comutatividade" />

<Explicacao>
Mais prosa comentando o que acabou de acontecer no gráfico.
</Explicacao>
```

### `<Curiosidade rotulo="...">` — o aparte que abre se quiser

O único bloco de texto que continua retrátil de propósito. Serve pra demonstração,
dedução ou "de onde vem isso" — coisa que enriquece mas não pode travar quem só
quer seguir o fio. Nasce fechada em todos os modos; o aluno clica pra abrir. Como
é camada, respeita o portão de revisão (some no Modo Aula de página não revisada).

```mdx
<Curiosidade rotulo="Curiosidade — de onde vem o truque">
A dedução completa aqui. Pode ter LaTeX, $$bloco$$, o que precisar.
</Curiosidade>
```

### `<Setas />` — a figura ESTÁTICA de junção

A mesma reta numérica com setas encadeadas do `<Juncao>`, mas **congelada**: sem
controles, sem hidratação React (é Astro puro, roda no build). Para os exemplos
introdutórios, onde a conta é fixa e o aluno só precisa VER as setas caírem nos
números certos. Fica FORA das camadas, então aparece também no Modo Aula.

```mdx
<Setas
  parcelas={[3, -5]}
  legenda="3 − 5  →  (+3) + (−5) = −2"   {/* opcional, aparece acima da reta */}
  titulo="Junção de um positivo com um negativo"
  dominio={[-10, 10]}                     {/* opcional, trava a escala */}
/>
```

Quando o aluno precisa **mexer** (embaralhar, inverter, agrupar), aí sim é
`<Juncao>`. Regra: exemplo pra ilustrar → `<Setas>`; exploração → `<Juncao>`.

### `<Juncao />` — o primitivo de sinal

Reta numérica com setas encadeadas. Prova comutatividade (embaralhar),
associatividade (agrupar) e a equivalência soma/subtração (trocar notação).

```mdx
<Juncao
  parcelas={[7, -3]}
  notacao="subtracao"        {/* "subtracao" | "juncao" */}
  contexto="numero"          {/* "numero" | "deslocamento" | "forca" */}
  permitirEditar={true}
  permitirReordenar={true}
  permitirAgrupar={false}
  dominio={[-10, 10]}        {/* opcional, trava a escala */}
  titulo="Junção — encadeando setas"
  chaveUrl="j1"              {/* liga o botão "copiar link" — único POR PÁGINA */}
/>
```

`contexto="deslocamento"` e `contexto="forca"` transformam o mesmo componente em
soma vetorial 1D. Use em Física: resultante, velocidade relativa, deslocamento.
**Não crie um componente novo pra isso.**

---

## 5. Como escrever conteúdo — a voz

Amostra calibrada (é a abertura de `content/conceitos/juncao.mdx`):

> Vou começar admitindo o óbvio: você já sabe somar e subtrair. Você faz isso desde
> os sete anos. Por que perder uma aula inteira nisso?
>
> Porque tem uma diferença enorme entre **saber fazer** $7 - 3$ e **entender** o que
> está acontecendo ali. Enquanto os números são pequenos e sozinhos, dá pra ir no
> piloto automático e nunca perceber a diferença.

### Regras

- **Português do Brasil, informal, segunda pessoa** ("você"). Nunca "o discente",
  nunca "nós temos que".
- **Autoexplicativo.** O aluno tem que conseguir ler sozinho em casa. O texto não
  é roteiro pra professor.
- **Justifique o *porquê*, sempre.** Nunca só o comando. "Reordenei porque junção é
  comutativa" > "reordenando, temos".
- **Proibido:** "é fácil ver que", "trivialmente", "basta notar", "obviamente",
  "como sabemos". Se fosse fácil de ver, não precisaria de aula.
- **Antecipe a objeção.** O aluno está pensando "pra que isso serve?" — responda
  antes que ele pergunte.
- **Traga pra realidade.** Analogia concreta > formalismo. Mas nunca troque rigor
  por analogia: a analogia entra *além* da definição correta, não no lugar dela.
- Matemática em LaTeX: `$inline$` e `$$bloco$$`.
- Frases curtas. Parágrafos de 2–4 linhas.

### A seção `<Pensamento>` é o ativo mais valioso do projeto

Todo cursinho tem resolução. Quase nenhum tem o raciocínio **antes** da conta.

Escreva em primeira pessoa, como o Victor pensando em voz alta:
- o que olhei primeiro no enunciado
- o que eu descartei, e por quê
- como eu soube que esse era o caminho
- o que eu faria se o aluno errasse *desse* jeito específico

Não é resumo da resolução. Se o `<Pensamento>` só reconta os passos, está errado.

### `<Erros>`

Escreva o erro **do jeito que o aluno comete**, não do jeito certo. Mostre a linha
errada. Depois diga qual conceito está faltando — não qual regra foi violada.

---

## 6. Componentes interativos novos

Sempre DOIS arquivos:

1. `src/components/viz/Nome.tsx` — o React, com `export interface NomeProps`
2. `src/components/viz/Nome.astro` — wrapper de 4 linhas que aplica `client:visible`

E registre no `src/components/mdx.ts`.

**Por que o wrapper:** o Astro só hidrata uma ilha React se a diretiva `client:*`
estiver num arquivo que ele analisa estaticamente. Componentes injetados via
`components={...}` no MDX não passam por essa análise. Sem o wrapper o build
falha com *"Could not render X. No matching import has been found."*
Com ele, o MDX escreve `<Nome ... />` limpo.

**Exceção — figura estática:** se o componente NÃO reage a clique (é só um
desenho fixo, tipo `<Setas>`), não use React. Um único `.astro` que calcula tudo
no frontmatter e devolve `<svg>` já basta — sem `.tsx`, sem wrapper, sem
hidratar. Mais leve e é o que a página precisa. O checklist abaixo é só pros
componentes de verdade **interativos**.

### Checklist de todo componente de visualização

- [ ] **Manipulável.** O aluno mexe e a tela responde. Figura estática não conta.
- [ ] **Slider + campo numérico.** Slider pra explorar, número pra travar em valor
      exato quando for resolver uma questão de verdade.
- [ ] **Congelar** — deixa o estado atual em cinza no fundo. O aprendizado está na
      comparação, não no estado final.
- [ ] **Isolar parâmetro** — travar os outros e deixar um só livre. Se tudo mexe
      junto, o aluno não separa as causas.
- [ ] **Teclado.** Setas ajustam valores; foco visível.
- [ ] **Reset** e presets nomeados ("o caso que inverte a concavidade").
- [ ] **`chaveUrl`** — estado no hash da URL, pra o Victor achar a configuração
      perfeita no preparo e o link virar parte do material.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] `aria-label` no `<svg>` descrevendo o estado atual em palavras.
- [ ] Cores **só** via as variáveis CSS de `global.css`. Nunca hex solto.

### Reuso antes de criação

Antes de criar um componente novo, verifique se um existente cobre o caso com
outra `prop`. A meta é ~15 componentes cobrindo o currículo inteiro, não um por
tópico. O `<Funcao>` com quatro sliders (`A + B·f(Cx + D)`) sozinho cobre
quadrática, exponencial, logaritmo, modular e trigonometria — e a mesma estrutura
é a equação da onda.

---

## 7. Exercícios

Arquivo em `content/exercicios/`. Nome: `{conceito}-{nivel}{n}.mdx` →
`juncao-a01.mdx`, `geometria-plana-b03.mdx`.

```yaml
---
fonte: FUVEST 2019 — 1ª fase, Q42     # ou "Autoral"
assuntos: [juncao, termos-semelhantes] # ids de conceitos, o primeiro é o principal
nivel: B                               # A=mecânica | B=vestibular | C=integração
tempo_alvo: 4                          # minutos
revisado: false
gabarito: "-4"
---
```

Estrutura fixa do corpo, nesta ordem:

```mdx
## Enunciado
...

<Dica n={1}>relê o enunciado / o que o problema está pedindo</Dica>
<Dica n={2}>aponta um dado específico, sem dizer o que fazer com ele</Dica>
<Dica n={3}>nomeia a ferramenta, sem aplicar</Dica>

<Resolucao>as contas</Resolucao>
<Pensamento>o raciocínio antes das contas</Pensamento>
<Erros>as armadilhas</Erros>
```

**Nenhuma dica pode entregar a resposta.** As três dicas são a escada que o Victor
usa em aula, materializada: nem ele nem o aluno consegue pular direto pro fim,
porque tem que clicar em cada degrau. Isso vira disciplina estrutural em vez de
força de vontade.

Os níveis:
- **A** — mecânica pura, 5–8 por conceito, fixa o procedimento
- **B** — vestibular padrão, o corpo do treino
- **C** — 1–2 por conceito, combina com algo anterior. É o que separa quem passa
  de quem quase passa; a FUVEST raramente cobra um tópico isolado.

---

## 8. Regras invioláveis

### 8.1 `revisado: false` ao criar. Sempre.

Todo conteúdo novo nasce em rascunho e o Modo Aula se recusa a exibir camadas de
conteúdo não revisado.

Isso não é burocracia. **Conteúdo de matemática e física gerado por IA contém
erros** — não grosseiros, sutis: sinal trocado numa passagem, condição de
existência omitida, caso particular tratado como geral. Em resolução de exercício
a taxa é maior. O Victor ensinando com um erro desses causa dano real e demora
pra ser detectado.

**Nunca marque `revisado: true`.** Só o Victor faz isso, depois de ler linha por
linha e refazer a conta.

### 8.2 Não invente conteúdo factual

Enunciado de prova real (FUVEST, UNICAMP, ENEM) só entra se o Victor colar o
texto. Nunca reconstrua de memória: o enunciado sai quase certo e o *quase* é
justamente onde o aluno se perde.

Se precisar de exercício e não houver fonte, escreva **autoral** e marque
`fonte: Autoral`. Exercício autoral honesto vale mais que FUVEST inventada.

### 8.3 Esqueletos são honestos

Ao criar um conceito só pra fechar o grafo, escreva um esqueleto de verdade:
título, resumo, e um parágrafo dizendo o que a página *vai* cobrir e o que ainda
falta decidir. Termine com uma linha em itálico listando o que falta.

Não escreva meia página plausível pra parecer completo. Página pela metade que
parece inteira é pior que página vazia — ela some do radar.

### 8.4 Uma sessão, um tópico

Não gere dez conceitos de uma vez. O gargalo é a revisão do Victor, não a
geração. Dez páginas não revisadas é dívida, não progresso.

---

## 9. Pegadinhas conhecidas

| Sintoma | Causa |
|---|---|
| Gráfico aparece mas não responde ao clique | falta o wrapper `.astro` com `client:visible` (seção 6) |
| Build: *"Could not render X"* | componente React usado no MDX sem wrapper |
| Elo `<C>` aparece vermelho | o id não existe. `npm run grafo` lista |
| LaTeX aparece cru | cifrão desbalanceado, ou `\$` escapado sem querer |
| Painel abre em branco | a página `fragmento/[id]` não foi gerada — rode `npm run build` |
| Mudei o `.mdx` e nada mudou em aula | está servindo `dist/` antigo. Rebuild |

Não use `localStorage` dentro de componentes React de visualização — o estado
deles vai no hash da URL via `chaveUrl`. `localStorage` é só do `BaseLayout`,
pra modo e tamanho de fonte.

---

## 10. Atalhos do Modo Aula

| | |
|---|---|
| `Alt+1` | Estudo — tudo aberto |
| `Alt+2` | Aula — só títulos e gráficos |
| `Alt+3` | Prova — só enunciado |
| `Alt+Z` | tamanho da fonte (normal → grande → enorme) |
| `Esc` | fecha o painel do topo da pilha |

O modo escolhido vale também dentro dos painéis.
