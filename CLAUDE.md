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
bloco: aritmetica                            # a ÁREA do mapa. Máx. 5 por matéria — ver 3.1
prereqs: [reta-numerica]                     # ids que o aluno precisa ANTES. Só isto — não
                                             # existe campo inverso; os filhos são calculados
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
2. **Uma direção só.** Não existe `desbloqueia`. Quem depende de um conceito é
   calculado a partir dos `prereqs` dos outros. Criar um elo é editar **uma linha,
   num arquivo só** — e não tem como os dois lados divergirem.
3. **Declare só o pré-requisito mais próximo.** Se X precisa de A e de B, e A já é
   pré-requisito de B, **não liste A**: quem chega em B já passou por A. O mapa
   desenha só o elo essencial, e `npm run grafo` avisa quando um elo é redundante.
   Vale pra qualquer quantidade de caminhos, não só dois.
4. Sem ciclos. `npm run grafo` detecta.
5. Rode `npm run grafo` depois de **toda** sessão que mexer em `content/`.

### 3.1 Não existe divisão por ano escolar

Foi tentado e **descartado de propósito**. A escola ensina fração no 6º ano e de
novo, mais fundo, no 8º; dividir por ano obrigaria a criar módulos incrementais do
mesmo assunto, e o aluno adiantado que vem tapar um buraco teria que atravessar
dezenas de páginas pra achar o que precisa.

**Um assunto mora num módulo só.** A ordem do mapa é a ordem de DEPENDÊNCIA:
a profundidade de um módulo é quantos módulos você precisa atravessar até chegar
nele. Se um assunto for grande demais pra uma página, ele se divide por *conteúdo*
(círculo trigonométrico ≠ funções trigonométricas), nunca por série.

### 3.2 `bloco` é a área, e ela tem teto de cinco

O `bloco` escolhe a **cor** do módulo no mapa. Só isso — ele **não** influencia a
posição.

Já foi tentado: uma "gravidade" puxava módulos da mesma área pra perto uns dos
outros. Media bem (as áreas ficavam 39% mais compactas) e mesmo assim foi
**descartado**, porque embolava as linhas — agrupar por área briga com desembaraçar
o grafo, e o desenho legível vale mais que a vizinhança temática. Hoje o eixo
horizontal serve a um objetivo só: minimizar cruzamento de seta e sobreposição de
seta com módulo.

**Máximo 5 blocos por matéria.** Não é gosto: a paleta categórica foi validada
contra o papel do site, em todos os pares e nas três formas de daltonismo. Com azul
e vermelho reservados pra sinal e o amarelo pra rascunho, **cinco é o teto medido**
— quatro candidatos a sexto tom foram testados e todos colidem (o verde colide até
pra quem enxerga cores normalmente). Do sexto em diante a área vira cinza neutro.
`npm run grafo` avisa quando passa de cinco.

Foi por causa desse teto que a Matemática ficou com estas cinco, em
`src/lib/curriculo.ts`:

| Área | Absorve |
|---|---|
| `aritmetica` | número, operação, proporção, porcentagem, financeira |
| `algebra` | letra, equação, polinômio, matriz, complexo |
| `funcoes` | função, exponencial, log, progressões, trigonometria do círculo |
| `geometria` | ângulo, figura, área, volume, trigonometria do triângulo, analítica |
| `estatistica` | contagem, probabilidade, estatística descritiva |

Repare que **trigonometria foi partida em duas**: no triângulo retângulo é
geometria (razão entre lados); no círculo é função (algo que se repete). Não foi
pra caber no teto — é a divisão honesta do assunto.

A **ordem** da lista hoje só define a ordem da legenda e dos rótulos.

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
aparece como prosa normal, sem rótulo e sem clique; no Modo Aula some inteiro.
Nada de empilhar "Exemplo 2" como rótulo de camada — pra rotular um exemplo, use
um título de verdade (`### Exemplo 2`), que sobrevive no Modo Aula.

As outras camadas continuam retráteis (`<details>`). Em página **não revisada**
elas somem no Modo Aula (portão da seção 8.1); em página revisada, colapsam pro
rótulo. `<Explicacao>`, por ser prosa, some no Modo Aula sempre — revisada ou não.

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
quer seguir o fio. Nasce fechada nos dois modos; o aluno clica pra abrir. Como
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

### `<MapaConceitos />` — o grafo desenhado

Não se usa em `.mdx`; é da home (`src/pages/index.astro`) e do rodapé de cada
conceito (`src/pages/conceitos/[id].astro`). Está documentado aqui porque é onde o
`ano` e o `bloco` viram imagem.

```astro
<MapaConceitos controles={true} altura="66vh" />   {/* mapa inteiro, com busca */}
<MapaConceitos foco="juncao" raio={1} />           {/* só a vizinhança */}
```

- **y = profundidade no grafo, x = só pra desembaraçar.** É Sugiyama: camadas por
  profundidade, **nós-ponte** pras setas que pulam camadas, ordenação por mediana
  com transposição e oito partidas embaralhadas, e coordenadas por regressão
  isotônica. O sorteio é semeado, então o mapa sai idêntico todo build.
- **Nó-ponte é o que impede a seta de passar por cima de um módulo.** A seta longa
  ganha um ponto em cada camada intermediária, esse ponto reserva um corredor na
  fila, e a linha atravessa a fileira **na vertical** dentro dele — todo o desvio
  horizontal acontece no vão entre camadas, que é vazio. Medido nos 71 módulos:
  sem ponte, 182 cruzamentos e 52 sobreposições; com ponte, **144 e zero**.
- **Seta que sai do mesmo módulo anda junto e só bifurca onde precisa.** São duas
  coisas somadas: (a) o corredor da ponte é do MÓDULO DE ORIGEM, não da seta —
  quatro setas longas saindo do mesmo lugar dividem um ponto por camada e descem
  coladas, cada uma se desprendendo na camada do destino dela; (b) todas as setas
  que saem de um módulo descem um trecho reto de 10px (`MEDIDAS.tronco`) antes de
  abrir o leque, e como o trecho é idêntico nas irmãs elas se sobrepõem exatamente.
  Medido nos 70 módulos: **14% menos linha desenhada** (35314 → 30337px de tinta,
  contando trecho compartilhado uma vez só), largura 2116 → 1986, cruzamentos 45 →
  44. O comprimento somado das setas SOBE 5% (uma seta cede um pouco pra caber no
  tronco da irmã) — é o preço, e ele compra as quatro paralelas que desciam o mapa
  inteiro dizendo a mesma coisa.
- **As setas já vêm reduzidas.** Elo redundante não é desenhado (regra 3 da seção
  3), então o que você vê é só a dependência mais próxima.
- **Passar o mouse acende a cadeia inteira** — sobe pelos pré-requisitos e desce
  pelos dependentes, apagando o resto. É o que torna um mapa de 70 módulos
  legível, e é a mitigação pros cruzamentos que sobram.
- **Rascunho é contorno tracejado**, nunca cor: o amarelo colidiria com a paleta
  das áreas, e verde/vermelho não serve pra daltônico.
- O layout mora em `src/lib/layout-grafo.ts`, separado do desenho, e recebe objeto
  simples em vez de `CollectionEntry` — assim dá pra rodar em node puro num teste
  de escala sem subir o Astro.
- **Se um dia virar novelo**, a volta pra árvore é dentro desse arquivo só:
  escolher um pai primário por nó e desenhar só aquela aresta. Nem o componente,
  nem a home, nem a página de conceito mudam.

### `<Questao />` — múltipla escolha com correção na hora

Fecha o módulo de um conceito. O aluno clica numa alternativa: acertou fica verde
com ✓, errou fica vermelho com ✗ e a correta é apontada com uma seta tracejada. Nos
dois casos o gabarito abre embaixo.

```mdx
<Questao n={1} correta="b" alternativas={["$-11$", "$-3$", "$3$", "$11$"]}>

Qual é o resultado de $-7 + 4$ ?

<div slot="gabarito">

O passo a passo aqui. Markdown normal, LaTeX, e pode chamar <Setas /> dentro.

</div>

</Questao>
```

- **`correta`** é a letra (`"a"`..`"e"`). Se apontar pra alternativa que não existe,
  **o build quebra** — de propósito: gabarito errado em aula é o pior defeito
  possível.
- **`alternativas`** aceita de 2 a 5. Trechos entre `$...$` viram LaTeX; o resto é
  texto (`"Nenhuma das anteriores"` funciona).
- O **enunciado é o slot padrão**; o gabarito vai num `<div slot="gabarito">`, com
  linha em branco depois da abertura pra o Markdown de dentro ser parseado.
- O gabarito respeita o **portão da seção 8.1**: some no Modo Aula enquanto a página
  for `revisado: false`.
- Verde/vermelho é o par que daltônico deutan/protan **não** distingue, por isso
  todo estado carrega glifo (✓ ✗ ←) e uma frase no veredito. Se mexer no
  componente, a cor continua sendo reforço — nunca a informação sozinha.

---

## 5. Como escrever conteúdo — a voz

Amostra calibrada (é a abertura de `content/conceitos/juncao.mdx`, escrita pelo
Victor — mantenha esta citação em sincronia se o texto de lá mudar):

> Eu entendo que a essa altura você já deve estar bem familiarizado com os conceitos
> de adição e subtração, porém hoje eu vou te mostrar uma coisa que a princípio
> parece muito óbvia, e que mesmo assim pode te ajudar demais com toda a matemática
> pelo resto da sua vida.
>
> Hoje eu vou te ensinar o conceito de JUNÇÃO, que a priori não vai mudar
> absolutamente nada nos resultados das suas contas, porém vai mudar completamente o
> seu jeito de pensar nos números, de um jeito que vai facilitar o entendimento de
> conceitos mais complexos, além de melhorar a sua capacidade de resolução de
> problemas.

Repare no ritmo: períodos longos, encadeados com "porém", "além de", "de um jeito
que". É fala transcrita, não prosa editada.

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
- Matemática em LaTeX. Inline é `$x + 1$`. **Bloco exige os `$$` em linhas
  próprias** — `$$x + 1$$` numa linha só é parseado como inline pelo `remark-math`
  e sai pequeno, no meio do texto, em vez de centralizado:

  ```
  $$
  x - y = -\,(y - x)
  $$
  ```
- **Período longo é permitido e desejável.** O Victor fala em frases encadeadas,
  com vírgula e "porém". Não pique o texto em frases curtas de efeito: é o que faz
  a página soar como IA.

### Tiques que denunciam IA — não escreva assim

O texto tem que soar como o Victor falando, não como prosa editada. Os padrões
abaixo já foram reprovados por ele numa revisão:

- **Frase-soco isolada** fechando parágrafo: "Funciona.", "É o contrário.",
  "Nada de novo aqui." Cadência de post de LinkedIn.
- **Antítese "não é X, é Y"** — inclusive em títulos de seção. Um "não é pra
  complicar" basta; não emende o "é pra enxergar".
- **Travessão como muleta.** No máximo um por parágrafo. O Victor usa vírgula,
  parêntese e reticências.
- **Podar as digressões.** O "né…", o "sem mais enrolação" e os parênteses de três
  linhas **são a voz dele** — mantenha.

**Caixa alta no texto cru do Victor = negrito.** Ele escreve em editor sem
formatação, então JUNÇÃO, ISSO É JUNÇÃO e afins são ênfase, não grito. Converta
pra `**negrito**` ao trazer pro MDX, e aproveite pra destacar também as frases que
sustentam o argumento — sem exagerar: umas 8 a 10 marcações por página.
- **Inventar número de efeito** ("resolve metade dos erros dos próximos três
  anos"). Se ninguém mediu, não escreva.

Quando o Victor mandar o texto cru dele, **aproveite as frases literais** e mexa
só no necessário pra caber na estrutura de camadas. Reescrever o que já estava na
voz certa é retrabalho que piora.

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

### 5.1 Comentário de código é escrito na mesma voz

O código também é lido pelo Victor, e comentário com cara de documentação de
biblioteca denuncia IA tanto quanto prosa com frase-soco. As mesmas regras da
seção 5 valem aqui, mais estas:

- **Explique a decisão, não o código.** Se o comentário reconta o que a linha
  abaixo faz, apague. O que vale registrar é o que foi tentado e descartado, o
  número que foi medido, e a armadilha que fez o código ficar torto.
- **Enxuto.** Uma ou duas frases. Cabeçalho de arquivo pode ter um parágrafo, e
  só quando o arquivo carrega uma decisão de arquitetura de verdade.
- **Nada de CAIXA ALTA pra ênfase**, nada de `POR QUE ISSO EXISTE:`, nada de
  moldura de `=====` ou `-----` em volta do texto. Separador de seção dentro do
  arquivo pode, é o `/* ---------- nome ---------- */` que já está no código.
- **Sem bullet decorativo** (`·`) e sem lista de três itens paralelos, que é o
  formato que a IA usa quando não tem o que dizer. Frase corrida encadeada com
  "porque", "então" e "senão".
- **Primeira pessoa** quando é decisão sua: "não uso `disabled` porque…",
  "antes eu resolvia por empurrão e o mapa inchava". Não "optou-se por".
- **Um travessão por comentário, no máximo.** Prefira vírgula e dois-pontos.
- **Número só se foi medido.** Os números que estão nos comentários hoje (14%
  menos tinta, largura 2116 → 1986, ΔE da paleta) saíram de medição de verdade —
  se você não rodou a medida, não escreva o número.
- **Comentário que virou mentira é pior que comentário nenhum.** Ao mexer no
  código, releia o comentário de cima: já aconteceu de sobrar comentário falando
  de "gravidade" que aproxima áreas, uma ideia que tinha sido descartada.

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

**Exceção — componente que embrulha conteúdo MDX:** se a interação é ligar/desligar
estado (mostrar, marcar, colapsar) e o componente precisa receber **texto com LaTeX
dentro**, use `.astro` com `<slot>` e um `<script>` vanilla, como o `<Questao>`.
Motivo: `$...$` só vira fórmula quando passa pelo pipeline do MDX. Prop de string
entregue a uma ilha React não passa por ele e sai crua na tela. Componente que
**desenha** (SVG, arrasto, slider) continua sendo React com wrapper.

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

### 7.1 Como se escreve um gabarito — o padrão

Vale pro `slot="gabarito"` do `<Questao>` e pra toda `<Resolucao>`. Calibrado
contra sete páginas do caderno do Victor (EDO, convolução, modelagem de tanques).

**O ritmo é rótulo curto + conta. Alternando apertado.** Não é parágrafo de prosa
com a fórmula no meio — esse é o erro clássico, e ele deixa o gabarito com cara de
apostila.

```
Reescrevendo cada número com o sinal que é dele:      ← rótulo, 6 palavras, dois-pontos

$$
-7 + 4 \;=\; (-7) + (+4)                              ← a conta, em bloco
$$

Como o 4 é menor que o 7, eu não chego no zero:       ← só o passo que não é óbvio

$$
(-7) + (+4) = -3
$$
```

Os movimentos que ele faz, em ordem de importância:

1. **Rótulo antes de cada conta, terminado em dois-pontos.** Diz o que ele está
   prestes a fazer, não o que a conta significa. É curto: *"logo nossa eq.
   característica:"*, *"Multiplicando por $Ce^{\sigma t}$:"*, *"Trocando $\tau$ por
   $t-\tau$:"*, *"Então substituindo nas equações temos:"*, *"Ou seja:"*, *"Com:"*.
2. **Modelo em palavras antes do símbolo**, quando a questão é de modelagem.
   Ele escreveu literalmente `Água no tanque = Água que entrou − Água que saiu`
   e só depois virou integral. Faça isso sempre que der: é o passo que o aluno
   nunca vê em lugar nenhum.
3. **Anuncia a estratégia antes de executar**, quando o caminho não é óbvio:
   *"por sabermos que $y(t)$ tem o formato $c\,e^{\lambda t}$, trocamos o `c` por
   uma função genérica $v(t)$, jogamos isso na EDO e vemos o que ela nos devolve"*.
4. **Justifica só o passo que trava**, em meia linha, e segue: *"Como uma
   exponencial nunca é 0, então $v''=0$"*. Não justifique o que é mecânico.
5. **Orienta no meio do caminho** quando a resolução é longa: *"Mas ainda não
   acabamos."*
6. **Reaproveita em vez de repetir**: *"Similarmente, para o segundo tanque:"*,
   *"E usando a mesma lógica para os itens b) e c)"*.
7. **Encadeia com `→` na mesma linha** quando o passo é puramente mecânico:
   $h_1 = 5r_1 \to \frac{dh_1}{dt} = 5\frac{dr_1}{dt}$.
8. **Destaca o resultado final** com uma linha própria e um rótulo curto
   (ele desenha uma caixa no caderno).

**Primeira pessoa, mas econômica.** Ele escreve "trocamos", "jogamos", "vemos",
"eu paro". Não é narração de cada respiração — é um colega apontando pro papel.

**Não é `<Pensamento>`.** O `<Pensamento>` é a estratégia *antes* de escolher o
caminho (o que descartei e por quê). O gabarito é a execução, com o mínimo de
narração pra ela não virar uma parede de fórmulas.

**Calibre o tamanho pelo assunto.** Conta de duas linhas → gabarito de duas linhas.
**Não encha linguiça onde não precisa**: texto longo em questão simples ensina o
aluno a pular o gabarito, e aí ele pula também o das questões que importam.

Quando ajudar a ver, chame `<Setas />` (ou outro componente) dentro do próprio
gabarito. A figura fecha melhor que mais um parágrafo.

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
| Fórmula de bloco sai pequena, no meio do parágrafo | escreveu `$$x$$` numa linha só. Os `$$` têm que ficar em linhas próprias (seção 5) |
| Alternativa do `<Questao>` mostra `$-3$` literal | faltou o `$` de fechamento na string, ou usou aspas simples dentro do array |
| Gabarito não abre no Modo Aula | a página está `revisado: false`. É o portão da 8.1 funcionando |
| Área do mapa saiu cinza | é o 6º bloco da matéria — a paleta só tem 5 (seção 3.2). Funda dois |
| Declarei um prereq e a seta não apareceu | ele é redundante, já vem por outro caminho. `npm run grafo` diz por qual |
| Módulo caiu fundo demais no mapa | a profundidade é a cadeia de prereqs. Provavelmente há um prereq exagerado na corrente |
| Build ficou lento depois de muitos módulos | é a transposição do layout, que é quadrática. Há teto de partidas em `layout-grafo.ts` — abaixe se precisar |
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
| `Alt+Z` | tamanho da fonte (normal → grande → enorme) |
| `Esc` | fecha o painel do topo da pilha |

O modo escolhido vale também dentro dos painéis.

**Só existem dois modos.** Existiu um terceiro, o Modo Prova, que escondia tudo
menos o enunciado; foi removido porque na prática o Modo Aula já fazia isso e
manter dois portões quase iguais só espalhava condição pelo CSS. Se pedirem "modo
prova" de volta, pergunte o que ele faria que o Modo Aula não faz.
