# CLAUDE.md

Instruções para o Claude Code neste repositório. Leia inteiro antes de escrever
qualquer arquivo em `content/`.

---

## 1. O que este projeto é

Uma apostila de Matemática e Física para pré-vestibular (FUVEST), com explicação
mais simples e mais detalhada do que a do livro, feita pro aluno ler sozinho.
Exercícios entram quando voltarem (seção 7).

**Quem usa o site é o aluno estudando.** Isso vale pra 99% de quem vai abrir a
página, e é o que decide como o site fala: ele fala com quem está lendo pra
aprender, e não com quem está dando aula. Frase de rodapé, texto de página e
comentário nenhum devem descrever o site como "material pra dar aula", porque
isso é verdade só pro Victor e na tela desorienta o resto.

**O Modo Aula é a exceção, e ele é uma ferramenta em cima da apostila**, não a
razão dela existir: é o Victor projetando a página enquanto explica. Está
previsto que um dia a conta escolha entre aluno e professor, e que o Modo Aula
só apareça pra professor. Enquanto conta não existe, o modo fica no menu pra
todo mundo, e a página que fala dele (`/sobre`) já diz que ele é pra quem está
explicando pra alguém.

**O aluno está no ensino médio.** Ou prestando vestibular, ou tentando acompanhar
a escola. Isso é premissa de projeto e não frase pra escrever na página: nada de
"isso cai muito em vestibular" nem de "agora que você está no ensino médio". O que
a premissa decide é o que entra no currículo (ele já arma conta, então não existe
aula de armar conta) e o tom (nada de falar com ele como se fosse criança, nem nos
assuntos mais simples).

O que fica do fundamental é o que ele executa sem entender e que trava o resto:
junção, escalamento, fração. O que sai é o que ele já faz sozinho.

**O site é ~5% do trabalho. Os outros 95% são o conteúdo.** Toda decisão técnica
é julgada por uma pergunta só: *isso reduz o atrito de escrever conteúdo?* Se a
resposta for não, não faça.

Quem escreve é o Victor, que também dá aula particular com o site aberto. Ele
explica bem falando, tem visão espacial forte e o gargalo dele é não conseguir
mostrar o que imagina. **Os componentes interativos existem pra resolver
isso**: não são enfeite, são o produto.

### Não-objetivos (não implemente, mesmo se parecer útil)

- Login, contas, banco de dados, backend, **até o Victor pedir.** A conta com
  papel de aluno ou professor está no plano dele, e `/entrar` e `/criar-conta`
  já existem como página de "ainda não existe". Continua valendo não construir
  isso por conta própria
- Dashboard de progresso do aluno, gamificação, pontuação
- Multi-tenant, pagamento, qualquer coisa de SaaS
- Um CMS ou painel admin no site publicado. O CMS é o VS Code, e a única exceção
  é a `/revisar` do `npm run dev`, que existe pra aprovar exercício sem caçar
  arquivo na pasta (seção 7)

Se algo disso for pedido, pergunte antes de construir: quase sempre não melhora
uma aula, e é o modo clássico de o projeto morrer com a infra linda e o conteúdo
vazio.

---

## 2. Arquitetura

Vite + React 19 + MDX. Um comando só, sem build no meio do caminho.

O projeto foi Astro até aqui e saiu de propósito. O que a troca comprou: componente
interativo voltou a ser **um arquivo só** (não existe mais wrapper com
`client:visible`), o painel de pré-requisito virou componente em vez de `<iframe>`
com uma segunda rota dentro, e `npm run dev` passou a ser o único comando, então
não tem mais `dist/` velho pra servir sem eu perceber. O que ela custou: a página
é renderizada no cliente, então não existe mais HTML estático nem zero-JS. Pra
material de aula 1-a-1 em localhost isso não muda nada.

```
content/                 ← O ATIVO. Fora de src/ de propósito.
  conceitos/*.mdx          Uma aula = um arquivo. Se um dia trocar de stack,
                           esta pasta migra intacta.
  exercicios/*.mdx         Um exercício = um arquivo. Seção 7.
index.html               ← a casca; o app monta em #raiz
vite.config.ts           ← MDX + KaTeX na compilação, e o providerImportSource
src/
  main.tsx                 entrypoint: BrowserRouter + ProvedorAula
  App.tsx                  topo, rotas, pilha de painéis, MDXProvider
  estado.tsx               modo, tamanho da fonte, pilha, atalhos, título da aba
  conteudo.ts            ← o índice: import.meta.glob dos .mdx + frontmatter
  components/
    C.tsx                  elo de pré-requisito
    mdx.tsx                a lista do que o MDX pode usar sem import
    Dicas.tsx              a escada de dicas, um degrau por vez
    Resolucao.tsx          a resolução, fechada por padrão
    CartaoExercicio.tsx    o cartão, na busca e no fim da aula
    viz/
      Juncao.tsx           interativo de sinal
      RetaZoom.tsx         interativo de escala
      Coordenadas.tsx      interativo de par ordenado
      Setas.tsx            figura congelada de junção
      Reta.tsx             figura congelada de reta
      Plano.tsx            figura congelada de plano: curva, ponto e figura
      MapaConceitos.tsx    o grafo desenhado
  lib/
    layout-grafo.ts        o Sugiyama, TS puro, roda em node sem o app
    metricas-grafo.ts      mede o desenho (cruzamento, seta por cima de módulo)
    curriculo.ts           áreas, rótulos e cores
  pages/
    Home.tsx               as duas portas de entrada e o mapa inteiro
    Indice.tsx             o índice remissivo: todo tópico de toda aula
    Exercicios.tsx         a busca de exercícios, com os filtros
    Revisar.tsx            a mesa de auditoria, só no dev
plugins/
  revisar.ts             ← o middleware que grava o .mdx. Só no dev
    Conceito.tsx           serve de página e de conteúdo de painel
  styles/global.css      ← todo o CSS do site, sem escopo
scripts/
  checar-grafo.mjs       ← npm run grafo
  render-tudo.mjs        ← npm run paginas
```

### Uma aula é um arquivo de prosa

Não existe componente de camada. A aula é markdown: parágrafo, título, tabela,
fórmula, e os componentes de visualização soltos no meio. Existiu uma estrutura
de blocos (`<Explicacao>`, `<Curiosidade>`, `<Resolucao>`, `<Pensamento>`,
`<Erros>`, `<Questao>`) e ela saiu em agosto de 2026, porque obrigava o texto a
saber em que caixa morava: pra escrever um parágrafo eu tinha que decidir antes
se aquilo era explicação ou curiosidade, e cada decisão dessas era uma chance de
empacotar errado.

O que era `<Curiosidade rotulo="X">` hoje é `### X`. O que era `<Erros>` hoje é
`### Onde o pessoal escorrega`. O conteúdo é o mesmo.

### Comandos

| | |
|---|---|
| `npm run dev` | **é isso que roda na casa do aluno**, na porta 4321 |
| `npm run grafo` | frontmatter inválido, elo morto, ciclo, prereq redundante, teto de 5 áreas, e o frontmatter dos exercícios |
| `npm run paginas` | renderiza as páginas e o corpo de todo exercício no node, e diz qual quebrou |
| `npm run tempos` | recalcula o `tempo_estimado` das 84 aulas |
| `npm run plano` | reescreve o `PLANO-DE-AULAS.md` a partir do frontmatter |
| `npm run check` | `tsc --noEmit` |
| `npm run build` | gera `dist/` — só serve pra publicar na nuvem |

**Rode `npm run grafo` e `npm run paginas` depois de toda sessão que mexer em
`content/` ou em componente.** Juntos eles são o que o build do Astro fazia de
graça: um confere o frontmatter e o grafo, o outro confere que toda página ainda
renderiza. Sem eles, componente escrito errado no MDX só aparece na hora da aula.

### 2.1 `PLANO-DE-AULAS.md` é a referência do currículo

É o documento que eu uso pra planejar a aula longe do site: panorama por área, os
gargalos do grafo, uma ordem linear possível, a ficha de cada aula (resumo,
prereqs, quem ela destrava, os tópicos, o que falta decidir) e o índice remissivo
dos 762 tópicos.

**Leia ele antes de mexer no currículo**, que é onde está o estado atual de tudo,
e **rode `npm run tempos` e depois `npm run plano` no fim de toda sessão que mexer
em `content/`**, junto com `grafo` e `paginas`. Nessa ordem, porque o plano lê o
tempo que o outro acabou de escrever. Ele é gerado: editar o `.md` à mão é trabalho perdido,
porque o script sobrescreve. O que muda o documento é o frontmatter da aula, e a
linha `*Falta: …*` do fim do `.mdx` é o que vira o "Falta" da ficha.

O mesmo comando escreve um `PLANO-DE-AULAS.html` com busca, que fica fora do git
e mora em <https://claude.ai/code/artifact/6dc79f40-c45f-4239-a8f1-7e5a6dae8a26>.
Pra atualizar a página, republique passando essa URL, senão nasce um artifact
novo em vez de atualizar o que já existe.

---

## 3. O grafo de conceitos

Cada conceito atômico é um `.mdx` em `content/conceitos/`. O nome do arquivo é o
`id`. Sempre kebab-case, sem acento: `juncao.mdx`, `geometria-plana-areas.mdx`.

### Frontmatter de aula

```yaml
---
titulo: A reta no plano
subtitulo: Toda reta cabe numa equação        # opcional, uma linha
materia: matematica                            # matematica | fisica
bloco: geometria                               # a ÁREA do mapa. Máx. 5 por matéria — ver 3.2
prereqs: [analitica-ponto, funcao-afim]        # ids que o aluno precisa ANTES. Só isto — não
                                               # existe campo inverso; os filhos são calculados
nivel: medio                                   # base | medio — ver abaixo
tempo_estimado: 50                             # minutos de aula, e
tempo_leitura: 25                              # minutos do aluno lendo em casa.
                                               # NÃO escreva os dois à mão: quem
                                               # preenche é `npm run tempos` — 3.3
revisado: false                                # ← SEMPRE false ao criar. Ver seção 8.
itens_fuvest: 58                               # opcional, do Raio X FUVEST
resumo: Uma frase. Aparece na busca e no cartão do painel.
topicos:                                       # ← o índice remissivo. Obrigatório.
  - coeficiente angular
  - distância de ponto a reta
  - retas perpendiculares
---
```

**`nivel` tem dois valores.** `base` é revisão de fundamental que ficou no
currículo porque trava o resto; `medio` é conteúdo de ensino médio. Não existe
mais fundamento/basico/medio/avancado: com o público definido, o que o aluno
precisa saber é se está tapando buraco ou aprendendo coisa nova.

### `topicos` é o que faz o aluno achar o assunto

Este campo resolve o problema que o grafo sozinho não resolve. O mapa tem 84
aulas e serve pra ver como o curso se encaixa; ele não serve pra quem chega com
uma dúvida com nome. Quem procura "distância de ponto a reta" ia percorrer a
linha de geometria, não achar nada com esse nome e sair fora.

A saída foi separar as duas granularidades:

- **o nó do grafo** é uma aula de 25 a 55 minutos, e são 84;
- **os tópicos** são o que cada aula cobre por dentro, e são 762.

Os tópicos viram a página `/indice` (ordem alfabética, filtro que ignora acento),
a busca do mapa e a lista "o que tem nesta aula" no topo da página. É a mesma
distinção entre o sumário e o índice remissivo de um livro.

Escreva o tópico **como o aluno diria**, não como o livro escreveu o capítulo:
"menos com menos dá mais" é um tópico legítimo, e é assim que alguém procura.
Entre 6 e 13 por aula. Termo genérico demais (`grau`, `mediana`, `condição de
existência`) precisa de qualificação, senão o índice fica ambíguo: use "grau do
polinômio", "mediana do triângulo".

**Tópico declarado é promessa.** Se a aula não cobre aquilo, ou o tópico sai ou a
nota de "falta" no fim da página diz que aquela parte ainda não foi escrita.

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
5. Rode `npm run grafo`, `npm run paginas` e `npm run plano` depois de **toda**
   sessão que mexer em `content/`.

### 3.1 Não existe divisão por ano escolar

Foi tentado e **descartado de propósito**. A escola ensina fração no 6º ano e de
novo, mais fundo, no 8º; dividir por ano obrigaria a criar módulos incrementais do
mesmo assunto, e o aluno adiantado que vem tapar um buraco teria que atravessar
dezenas de páginas pra achar o que precisa. Com o público no ensino médio o
argumento fica mais forte ainda: ele não vem cursar uma série, vem tapar um buraco.

**Um assunto mora numa aula só.** A ordem do mapa é a ordem de DEPENDÊNCIA: a
profundidade de uma aula é quantas aulas você precisa atravessar até chegar nela,
ou o lugar onde ela coube na fileira, o que for mais fundo — ver o teto de oito
na seção 4. Quem desce por causa do teto nunca fica acima de um prereq, então a
ordem de estudo continua verdadeira; o que se perde é ler a distância exata pela
altura.
Se um assunto for grande demais pra uma aula, ele se divide por *conteúdo*
(círculo trigonométrico ≠ funções trigonométricas), nunca por série. Se o assunto
couber numa aula mas tiver muita coisa dentro, quem resolve é `topicos`, não uma
aula nova.

**O corte de tamanho é 25 a 55 minutos.** Passou muito disso, divide. Hoje nenhuma
aula escrita passa de 50, e a mais longa é frações, que junta divisibilidade, MMC e
MDC de propósito, porque esses três existem pra você conseguir mexer com fração.


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

### 3.3 O tempo da aula é calculado, e não chutado

`tempo_estimado` sai do `npm run tempos`, e quem manda é `scripts/tempo-aula.mjs`.
**Não edite o campo à mão**, porque o script sobrescreve.

Antes os 84 números eram chute meu, um por um, e chute não dá pra revisar: ninguém
olha "45 min" e sabe dizer se está certo. Pior, eu já usei um chute pra calibrar
outro e apresentei como conta, o que é o jeito mais rápido de um número errado virar
verdade no projeto.

O modelo tem duas taxas, e elas vêm de fora:

| | |
|---|---|
| **65 palavras por minuto** | a aula. É a taxa de "muitos conceitos novos" com objetivo de **engajar** no estimador de carga do Wake Forest (Barre e Esarey), que é ler discutindo e respondendo, que é o que uma aula 1-a-1 é |
| **130 palavras por minuto** | a leitura do aluno em casa, a mesma tabela com objetivo de **entender** |

Como a aula roda na metade da taxa da leitura, **a aula sempre dá o dobro do tempo
que o aluno leva pra ler a página sozinho**. Os dois ficam no frontmatter, e qual
deles aparece na ficha depende do modo: em **Estudo** o aluno vê só o tempo de
leitura dele, e em **Aula** aparece o tempo da aula, que é meu. Um "45 min" na
frente do aluno desencoraja quem ia sentar pra ler 23.

Fórmula, tabela, figura e interativo entram como palavra equivalente (12, 8, 30 e
200), e esses quatro pesos são escolha, não medida: saem de estimar quanto cada
coisa toma em aula. O que sustenta a ordem de grandeza é uma medida de verdade: o
Victor lê a aula de junção inteira em 6 minutos, o modelo dá 16 minutos de leitura
pro aluno e 30 de aula, e a diferença entre 6 e 16 é exatamente a diferença entre
quem escreveu o texto e quem está vendo pela primeira vez.

**Aula que ainda não foi escrita não tem página pra medir**, então o tempo dela sai
de uma régua por tópicos, ajustada por mínimos quadrados nas aulas que já existem. O
plano marca qual é qual: as escritas dizem "medido na página" e as outras dizem
"planejado pelos tópicos".

O que fazer quando o número parecer errado: **cronometre a aula de verdade e ajuste
os pesos**, em vez de corrigir o frontmatter da aula. Um número errado no
`tempo-aula.mjs` erra 84 vezes, e é por isso que ele é o lugar certo de consertar.

### Ordem de currículo ≠ ordem de construção

O grafo **declara** dependência; ele não é uma fila. Construir o conceito 47 antes
do 3 não quebra nada. O currículo é base-first; a construção é oportunista, guiada
pelo que os alunos do Victor estão vendo na escola naquela semana.

---

## 4. Componentes disponíveis no MDX

Tudo em `src/components/mdx.tsx` está disponível em qualquer `.mdx` **sem
import**, porque quem entrega a lista é o `<MDXProvider>` do `App.tsx`. Não
escreva `import` em arquivo de conteúdo. Nunca.

### `<C id="...">texto</C>` — elo de pré-requisito

```mdx
Logaritmo é a pergunta invertida da <C id="potencias">potência</C>.
```

Não navega: abre um painel por cima, e os painéis **empilham**. Serve pro momento
em que o aluno trava no meio da explicação e o Victor precisa descer dois níveis e
voltar sem perder o fio.

Use quando o texto menciona um conceito que é pré-requisito real. **Não** encha o
texto de elos — 3 a 6 por página é o razoável. Elo demais vira ruído e o aluno
para de clicar.

### O Modo Aula, sem componente nenhum

Em Modo Aula o site esconde `p`, `ul`, `ol`, `table`, `blockquote` e `pre` que
estejam dentro de `.aula`. Sobram os títulos, as fórmulas em bloco e as figuras,
que é o esqueleto que eu quero projetado enquanto explico. O texto continua no
arquivo pro aluno reler em casa.

Isso é CSS puro, em `global.css`. O `.mdx` não sabe que existem dois modos, e é
por isso que escrever conteúdo ficou mais simples: escreve parágrafo e pronto.

**A consequência prática pra quem escreve:** título e figura sobrevivem em aula,
prosa não. Então a estrutura de títulos de uma aula tem que fazer sentido sozinha,
lida de cima a baixo, sem o texto no meio. Se ao esconder a prosa a página vira
uma lista de títulos que não conta história nenhuma, os títulos estão ruins.

Uma consequência que vale saber: o portão da seção 8.1 agia escondendo as camadas
em Modo Aula, e sem camadas ele deixou de existir como mecanismo. O que sobrou é
o selo de rascunho na página. A regra de nunca marcar `revisado: true` continua.

### `<Setas />` — a figura ESTÁTICA de junção

A mesma reta numérica com setas encadeadas do `<Juncao>`, mas **congelada**: sem
controle nenhum e sem estado. Para os exemplos introdutórios, onde a conta é fixa
e o aluno só precisa VER as setas caírem nos números certos. Fica FORA das
camadas, então aparece também no Modo Aula.

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

### `<Reta />` — a reta sozinha, congelada

Mesma reta do `<Setas>`, só que sem conta em cima. Fica FORA das camadas, então
aparece também no Modo Aula. Serve pra falar de escala: a mesma figura com passo grande
cabe do 0 ao 100 e com passo pequeno mostra quem mora entre o 1 e o 2.

```mdx
<Reta
  dominio={[0, 100]}
  passo={10}          {/* distância entre as marcas que ganham rótulo */}
  menores={10}        {/* opcional, marcas sem rótulo entre duas rotuladas */}
  destacar={[1, 2]}   {/* opcional, marca mais alta e rótulo em negrito */}
  titulo="Passo pequeno: cabe do 0 ao 100"
  legenda="a mesma reta, com cada unidade valendo bem pouco espaço"
/>
```

Rótulo decimal sai com vírgula, que é como se escreve em português.

### `<Plano />` — o plano cartesiano com curvas, pontos e figuras, congelado

A `<Reta>` um andar acima: mesma família de figura estática, sem controle nenhum,
pro caso em que o argumento é o desenho. A curva chega como **função de x**, e
não como lista de pontos, porque quem escreve o `.mdx` pensa em "−x² + 2x + 1" e
não em duzentos pares de números.

```mdx
<Plano
  dominio={[-4, 4]}
  imagem={[-4, 4]}          {/* opcional; sem isto, o mesmo do x */}
  curvas={[
    { f: (x) => -x * x + 2 * x + 1, de: 0, ate: 3, nome: 'f', rotuloEm: 1.55, cor: 1 },
    { f: (x) => 2 * (-x * x + 2 * x + 1), de: 0, ate: 3, nome: 'w', cor: 2 },
  ]}
  titulo="As duas curvas"
/>
```

A escala é a mesma nos dois eixos e quem se ajusta é a altura da figura, senão a
parábola sai achatada e o aluno lê uma inclinação que não existe. O rótulo fica
encostado na curva, e não numa legenda ao lado: com seis curvas, legenda lateral
obriga o olho a ir e voltar seis vezes: é o mesmo motivo pelo qual o mapa escreve
o nome dentro do módulo. `cor` é 0 a 5, a paleta das áreas.

Quem vai deixar o aluno mexer nos coeficientes é o `<Funcao>` com sliders, que
ainda não existe. Este aqui é a figura congelada, do jeito que uma prova desenha.

Ele também desenha **ponto** e **figura ligando pontos**, que foi o que a aula de
plano cartesiano pediu: lá o assunto é o par ordenado, e quadrante, espelho e
translação são a mesma figura com outra lista de pares.

```mdx
<Plano
  dominio={[-5, 5]}
  quadrantes={true}          {/* escreve I, II, III e IV no fundo */}
  pontos={[
    { x: 4, y: 3, nome: 'P (4, 3)', guias: true, cor: 3 },
    { x: -4, y: 3, nome: '(−4, 3)', cor: 2, vazio: true, lado: 'esquerda' },
  ]}
  poligonos={[
    { vertices: [[1, 1], [4, 1], [4, 3]], nome: 'T', cor: 3 },
    { vertices: [[-1, 1], [-4, 1], [-4, 3]], nome: "T'", cor: 2, tracejado: true },
  ]}
/>
```

`guias` é o tracejado do ponto até os dois eixos, `vazio` é a bolinha vazada do
ponto que está sendo comparado com outro, e `lado` (`cima`, `baixo`, `esquerda`,
`direita`, `cima-direita`) escolhe de que lado da bolinha o nome encosta. A
diagonal existe pro ponto que cai em cima de um eixo, onde `cima` põe o nome em
cima da linha e `baixo` põe no meio dos números dela.

### `<Linhas />` — o gráfico de linha por categoria, congelado

O terceiro da família estática. Aqui o eixo de baixo não é numérico, é uma lista
de rótulos (ano, mês, faixa), que é como quase todo gráfico de jornal e de prova
é montado.

```mdx
<Linhas
  categorias={[2012, 2013, 2014]}
  series={[
    { nome: 'Homens', cor: 2, traco: 'cheio', valores: [74.5, 74.4, 74.0] },
    { nome: 'Mulheres', cor: 3, traco: 'tracejado', valores: [51.9, 51.6, 51.4] },
  ]}
  minimo={30}
  maximo={80}
  rotulos={true}          {/* escreve o valor em cima de cada ponto */}
  titulo="Taxa de participação na força de trabalho"
  legenda="PNAD Contínua, IBGE"
/>
```

`rotulos` existe por causa de prova: quando a questão escreve o valor em cima de
cada ponto, **aquele número é parte do enunciado**, e sem ele a alternativa que
fala em "11,7" viraria adivinhação na régua. As casas decimais saem dos dados,
porque um $74$ escrito onde a prova escreveu $74{,}0$ já não é o mesmo número.

A série se distingue por traço além da cor (`cheio`, `tracejado`, `pontilhado`),
porque três linhas no mesmo desenho é o caso em que quem não separa verde de
vermelho fica sem saber qual é qual.

### `<RetaZoom />` — a reta com a escala na mão do aluno

O interativo de escala: arrastar anda pelos números, o slider afasta e aproxima,
e o passo entre as marcas fica escrito por extenso embaixo, senão o aluno olha só
o desenho e não percebe que a escala mudou. Tem travar o centro, que separa
"andei" de "aproximei", e as setas do teclado.

```mdx
<RetaZoom centro={0} janela={20} titulo="Afaste e aproxime" chaveUrl="rz" />
```

`janela` é quantos números cabem na tela de uma vez, de 0,4 a 400.

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

### `<Caixas />` — o número procurando a caixa dele

Naturais dentro de inteiros dentro de racionais, e o número entra na menor caixa
que aceita ele. O slider varre de quarto em quarto, então o aluno vê o ponto cair
pra fora de duas caixas no meio do caminho entre dois inteiros, e o campo de texto
aceita fração, dízima e raiz, que é o que faz a caixa de fora (os irracionais)
existir na tela.

```mdx
<Caixas valor="3" titulo="Joga um número e vê em quais caixas ele cai" chaveUrl="cx" />
```

`valor` é string de propósito: `"3"`, `"-2"`, `"0,75"`, `"3/4"`, `"8/4"`,
`"0,333..."`, `"√2"`, `"π"`.

### `<Retangulo />` — a comutatividade que gira

Bolinhas em linha e coluna, com botão pra contar por linha, contar por coluna e
girar. É a prova honesta de que $3 \times 4 = 4 \times 3$, e substituiu um bloco
de `●` que, sendo `pre`, sumia no Modo Aula justamente na hora de explicar.

```mdx
<Retangulo linhas={3} colunas={4} titulo="O mesmo retângulo, contado de dois jeitos" chaveUrl="rt" />
```

A mesma figura serve pra área do retângulo e pra distributiva quando essas aulas
forem escritas: passe `linhas`/`colunas` diferentes em vez de criar componente.

### `<Barra />` — a fração como pedaço de barra

O denominador corta e o numerador pinta. Com `b` aparece a segunda barra, pra
comparar, e com `soma` aparece a terceira, já cortada no MMC. O coração da figura
é o aluno cortar as duas barras no mesmo número na mão: os cortes multiplicam e o
pintado não muda de tamanho, que é a equivalência acontecendo. Isso já foi um
botão de "igualar os pedaços", e o botão fazia a conta no lugar dele.

```mdx
<Barra a={[3, 5]} b={[3, 7]} titulo="Quem pintou mais?" chaveUrl="b1" />
<Barra a={[1, 2]} b={[1, 3]} soma={true} titulo="Só junta depois de igualar" chaveUrl="b2" />
```

A barra mostra **dois** inteiros lado a lado, com a linha grossa marcando o fim do
primeiro e a régua embaixo escrevendo 0, 1 e 2, então $7/4$ passa da marca do 1 em
vez de estourar o desenho.

**Não dá pra pintar mais do que a barra tem.** O teto do numerador é o denominador
vezes dois (vezes um só quando `soma` está ligado, senão a terceira barra é que
estouraria), e diminuir o corte puxa o pintado junto. Sem isso o rótulo escrevia
$8/3 = 2{,}667$ e o desenho parava no 2, que é a figura mentindo. O teto vale também
pro que o `.mdx` pede e pro que vem no hash da URL.

### `<Esticar />` — multiplicar como esticar, encolher e virar

Uma seta na reta multiplicada por um fator: acima de 1 estica, entre 0 e 1 encolhe,
negativo vira pro outro lado do zero. É o que faz "menos com menos dá mais" virar
uma coisa que se vê, e pondo o fator no inverso do valor (com `valor={4}`, fator
$0{,}25$) a ponta larga exatamente no 1, que é a divisão inteira num desenho só.
Escolha um `valor` cujo inverso caia no passo de $0{,}25$ do slider, senão o aluno
não consegue chegar nele arrastando.

```mdx
<Esticar valor={4} fator={2} titulo="Estica, encolhe e vira" chaveUrl="es" />
```

`dominio` trava a escala; sem ele a reta se ajusta ao resultado. O fator aparece
escrito como fração quando é uma fração de denominador pequeno, senão `1/3` viraria
`0,3333` na tela e ninguém reconheceria o inverso.

### `<Coordenadas />` — o ponto que o aluno arrasta

O interativo do plano cartesiano, e o irmão de mãos dadas do `<Plano>`: aqui o
aluno pega o ponto com o dedo ou com o mouse e vê o par ordenado responder. É a
única coisa da aula que desenho parado não mostra, porque o que ensina é o
primeiro número reagindo ao movimento horizontal e o sinal virando na hora em que
o ponto atravessa o eixo.

```mdx
<Coordenadas x={3} y={2} dominio={[-6, 6]} titulo="Arrasta o ponto e lê o par" chaveUrl="pc" />
```

Os dois botões ligam jeitos de ver e não fazem conta nenhuma: **o caminho** desenha
a seta que anda no x e depois a que sobe no y, que é a leitura do par ordenado
acontecendo, e **os espelhos** põem os três simétricos na tela pro aluno arrastar o
ponto e descobrir sozinho qual sinal cada reflexão troca. Os dois começam
desligados, e `caminho` e `espelhos` ligam de saída.

O ponto anda de meio em meio, então cai coordenada quebrada, e aí o par sai com
ponto e vírgula (`(2,5; −1)`), senão ninguém sabe onde um número acaba e o outro
começa.

### `<Conjunto />` — o diagrama de conjunto, congelado

Da família do `<Setas />` e do `<Reta />`: figura estática, sem controle. Existe
porque a sintaxe ($\in$, $\subset$, $\cup$, $\cap$) só entra quando o símbolo e o
desenho aparecem juntos, e porque o mesmo par de conjuntos desenhado de dois jeitos
é o que mostra que `C ⊂ A` e `A ⊃ C` dizem a mesma coisa.

```mdx
<Conjunto
  layout="venn"                {/* um | separados | venn | aninhados */}
  conjuntos={[
    { nome: 'A', elementos: [1, 2, 3, 4, 5, 6] },
    { nome: 'B', elementos: [5, 6, 7, 8] },
  ]}
  destacar={[5, 6]}            {/* bolinha cheia */}
  fora={[2]}                   {/* elemento desenhado do lado de fora, pro ∉ */}
  regiao="intersecao"          {/* intersecao | uniao — pinta a região */}
  envolver="D"                 {/* contorno tracejado em volta de tudo */}
  titulo="A ∩ B é só o miolo"
  legenda="a parte pintada é onde os dois se cruzam"
/>
```

**Onde cada elemento cai é calculado, não escrito à mão.** No `venn`, quem está nos
dois vai pro miolo; no `aninhados`, quem é só do de fora fica no anel. Então dá pra
mexer na lista de elementos no `.mdx` sem recalcular desenho nenhum. Em `aninhados`
o primeiro conjunto é o de fora.

Ele tem duas geometrias, uma para a largura inteira e uma para dentro do `<Par>`, e
a segunda não é a primeira encolhida: na metade da largura o círculo precisa ser
proporcionalmente maior, senão as bolinhas não cabem e o texto de 14px vira 7px na
tela. Quem liga a segunda é o `<Par>`, e não o `.mdx`.

### `<Par>` — duas figuras na mesma linha

```mdx
<Par>
  <Conjunto layout="separados" ... />
  <Conjunto layout="aninhados" ... />
</Par>
```

Para quando o mesmo assunto é desenhado de dois jeitos e o argumento **é** a
comparação: empilhar as duas obriga o aluno a rolar entre uma e outra justamente
na hora de comparar, e faz a página parecer o dobro do que ela é. Vira uma coluna
só abaixo de 900px.

**Só use com componente que entende `compacto`**, que hoje é o `<Conjunto>`. O
`<Par>` avisa o filho que ele agora tem metade da largura; quem não escuta esse
aviso só encolhe junto com o viewBox, e aí o rótulo fica ilegível.

### `<Alem>` — a curiosidade que está fora do escopo

```mdx
<Alem titulo="De onde vem esse truque" precisa="fatoração">

A explicação inteira, em markdown normal.

</Alem>
```

Caixinha fechada, com um aviso automático em cima dizendo que aquilo está fora do
que a aula precisa e fora dos pré-requisitos dela, que quem já viu é bem-vindo e
que quem não viu pode pular sem perder nada. `precisa` nomeia o assunto que a
explicação usa e que ainda não foi dado.

Serve pro caso do "de onde vem esse truque" da junção: a explicação é boa e eu
quero ela na página, porém ela mexe com fatoração, e quem lê pela primeira vez
trava ali achando que precisa entender aquilo pra seguir. Fechada, ela vira convite
em vez de obstáculo, e em Modo Aula sobra como uma linha só.

**Isto não é a volta das camadas** que saíram em agosto (seção 2). Aquelas obrigavam
todo parágrafo a escolher uma caixa antes de ser escrito; esta é uma caixa só, com
um trabalho só, e o texto normal continua sendo prosa solta. Se aparecer uma segunda
caixa, releia esta frase antes de criar.

### `<Alternativas>` e `<Alt>` — a múltipla escolha que o aluno responde

```mdx
<Alternativas correta="D">
  <Alt>$w(x) = 2h(x)$ e $n(x) = -f(x - 4)$</Alt>
  <Alt>$h(x) = f(x) - 2$ e $m(x) = f(x - 3)$</Alt>
</Alternativas>
```

Uma por linha, e clicável: a certa fica verde, a errada fica vermelha, e o
"tentar novamente" limpa. A letra sai da posição, então não se escreve "(A)" no
texto. As erradas **continuam marcadas**, porque eliminar alternativa é parte de
resolver questão de prova, e apagar a eliminação seria apagar o raciocínio.

Antes isso era prosa com "(A) … (B) …" na mesma linha, e numa questão com fórmula
o (B) encostava no fim da fórmula do (A). Agora também é a única parte do
exercício em que o aluno responde antes de abrir a resolução.

Cor nunca vai sozinha: cada marca leva um glifo (✓ ou ✗) e a linha de baixo diz
em palavra o que aconteceu, que é a regra da paleta do `global.css` — deutan e
protan não separam verde de vermelho.

### `<Dicas>`, `<Dica>` e `<Resolucao>` — só em exercício

A escada que abre um degrau por vez e a resolução que nasce fechada. Não use em
aula: lá o texto é prosa solta, e caixa retrátil no meio de explicação foi
justamente o que saiu em agosto. O formato está na seção 7.

### `<MapaConceitos />` — o grafo desenhado

Não se usa em `.mdx`; é da home (`src/pages/Home.tsx`) e do rodapé de cada
conceito (`src/pages/Conceito.tsx`). Está documentado aqui porque é onde o
`bloco` vira imagem.

```tsx
<MapaConceitos controles={true} altura="66vh" />   {/* mapa inteiro, com busca */}
<MapaConceitos foco="juncao" raio={1} />           {/* só a vizinhança */}
```

- **y = profundidade no grafo, x = só pra desembaraçar.** É Sugiyama: camadas por
  profundidade, **nós-ponte** pras setas que pulam camadas, ordenação por mediana
  com transposição e 64 partidas embaralhadas, e coordenadas por regressão
  isotônica, cada módulo mirando na mediana dos vizinhos dos dois lados. O
  sorteio é semeado e a lista de conceitos chega ordenada por id, então o mapa
  sai idêntico a cada carga.
- **Nenhuma fileira passa de oito aulas.** É a fileira mais cheia que manda na
  largura do mapa inteiro, e o mapa abre enquadrado pela largura, então cada aula
  a mais naquela fileira encolhe o texto de todas as outras. O excedente desce
  uma camada e quem depende dele desce junto; alto não custa nada, porque a
  página rola. Desce quem sai mais barato, e a conta pesa 4 pro pai que fica pra
  trás (ele vira uma seta que pula camada, e é isso que embola o desenho) contra
  3 pro filho que desce junto. Com o teto: largura 2450 → 2112, trecho torto
  64 → 31, e a fileira mais cheia de 12 pra 8.
- **Camada estreita não é centrada.** Já foi, por estética, e era o que mais
  entortava seta: uma fileira de dois módulos ia pro meio dos 2450px sem olhar
  onde estavam os filhos dela. Tirar isso custou 43px de largura e derrubou os
  trechos tortos de 46 pra 28.
- **A seta só anda na vertical e na horizontal**, com o canto arredondado. Ela
  sai debaixo do módulo, desce, anda de lado no vão vazio entre duas fileiras e
  desce reta no destino, então a flecha chega sempre por cima. Enquanto era curva
  de Bézier, toda seta que mudava de coluna descia em diagonal e o olho perdia
  qual entrava em qual módulo.
  - **O trecho horizontal mora num canal.** Duas setas que andam de lado no mesmo
    vão viram uma linha só se estiverem na mesma altura; cada uma pega a primeira
    altura livre, e trechos que não se cruzam em x dividem a mesma. O desvio curto
    fica no canal de cima, e é isso que dá menos cruzamento (122 contra 138 se for
    o contrário).
  - **A porta de chegada acompanha a seta.** O topo do módulo tem 156px de borda
    e a seta não precisa entrar pelo meio: se ela vem de uma coluna que cai
    dentro dessa faixa, entra ali e desce reta. Quem tem uma saída só também
    desliza o ponto de partida na base. Isso levou as setas perfeitamente retas
    de 10 pra 39, de 112.
  - **Duas setas que chegam do mesmo lado se juntam.** Vindas de longe, as duas
    batem no mesmo limite da porta, dividem o canal e se sobrepõem no pedaço
    final: o que se vê é uma linha só entrando no módulo. É o tronco da saída,
    do lado de cá. Agrupar numa porta média as que chegam perto uma da outra foi
    testado e é pior — vira duas molinhas convergindo em vez de duas retas
    paralelas.
  - **O canal é escolhido por busca local**, trocando dois trechos de altura
    enquanto isso desfizer cruzamento. Só a ordem gulosa deixava cruzamento que
    some com uma troca: 132 contra 106 no mesmo desenho.
  - **Seta que ia cortar o caminho de uma irmã entra junto com ela.** Se a
    descida cruza o trecho de lado de outra seta que vai pro MESMO módulo, ela
    passa a descer até aquele canal e entrar pela mesma porta, mesmo que o
    desvio dela seja curto (é a única exceção à regra do degrau de 44px). Antes
    ela cortava a irmã pra chegar sozinha, num traço paralelo ao lado.
  - **Junção em T não conta como cruzamento** em `contarCruzamentos`. Depois que
    as setas passaram a se fundir, metade do número era isso: 113 viraram 61.
  - **A corrente longa desce numa coluna só** pelo maior trecho que couber. A
    ponte não precisa ficar no vão onde a ordenação a pôs, e a linha ainda tem
    12px de manobra dentro do corredor, então olho todos os vãos livres de cada
    fileira e só troco de coluna quando o espaço obriga. Sem isso a seta longa
    descia desviando 8px numa camada e voltando 15px na seguinte.
  - **Desvio menor que 44px vira curva, não degrau**: dois cantos separados por
    20px de reta parecem defeito de desenho.
  - **O vão entre fileiras é 96px** (era 80) porque é ele que hospeda os canais.
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
- **A caixa do módulo engorda com a letra do site.** A altura sai de duas linhas
  do título no tamanho da letra escolhida (52px no normal, 57 no grande e 65 no
  enorme), e o mapa inteiro se reacomoda: com 52 fixo, quem lia na letra enorme
  via o título vazando pra fora da caixa. A conta está no `MapaConceitos` e
  depende do `font-size` e da entrelinha do `.mapa-no-titulo`.
- **As setas já vêm reduzidas.** Elo redundante não é desenhado (regra 3 da seção
  3), então o que você vê é só a dependência mais próxima.
- **Passar o mouse acende a cadeia inteira** — sobe pelos pré-requisitos e desce
  pelos dependentes, apagando o resto. É o que torna um mapa de 70 módulos
  legível, e é a mitigação pros cruzamentos que sobram.
- **Rascunho é contorno tracejado**, nunca cor: o amarelo colidiria com a paleta
  das áreas, e verde/vermelho não serve pra daltônico.
- O layout mora em `src/lib/layout-grafo.ts`, separado do desenho, e recebe objeto
  simples em vez do registro do conteúdo — assim dá pra rodar em node puro num
  teste de escala sem subir o app. O arquivo é uma seção por etapa, na ordem em
  que rodam: fileira de cada aula, fila de cada fileira, ordem dentro da fila,
  coluna de cada item, rota das setas.
- **As contas que dizem se o desenho melhorou** estão em `src/lib/metricas-grafo.ts`,
  e nada ali roda quando o site abre. São elas que sustentam os números destas
  notas; sem elas "ficou melhor" vira opinião, e já teve ideia bonita que mediu
  bem numa conta e destruiu o desenho na outra.
- **Se um dia virar novelo**, a volta pra árvore é dentro desse arquivo só:
  escolher um pai primário por nó e desenhar só aquela aresta. Nem o componente,
  nem a home, nem a página de conceito mudam.

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

### O raciocínio antes da conta é o ativo mais valioso do projeto

Todo cursinho tem resolução. Quase nenhum tem o raciocínio **antes** da conta.

Quando ele aparecer numa aula, escreva em primeira pessoa, como o Victor pensando
em voz alta:
- o que olhei primeiro no enunciado
- o que eu descartei, e por quê
- como eu soube que esse era o caminho
- o que eu faria se o aluno errasse *desse* jeito específico

Não é resumo da resolução. Se ele só reconta os passos, está errado.

### `### Onde o pessoal escorrega`

A seção de erros de uma aula. Escreva o erro **do jeito que o aluno comete**, não
do jeito certo: mostre a linha errada, com a conta que ela dá. Depois diga qual
conceito está faltando, não qual regra foi violada. A aula de junção tem o
exemplo calibrado.

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

## 6. Componentes novos

**Um arquivo:** `src/components/viz/Nome.tsx`, com `export interface NomeProps`, e
registre em `src/components/mdx.tsx`. Sem wrapper, sem diretiva, sem barrel duplo.
Existiu um segundo arquivo `.astro` por componente enquanto o projeto era Astro,
só pra dar um lugar analisável estaticamente pro `client:visible`; isso morreu com
o Astro e não deve voltar.

O CSS do componente vai num `<style>` dentro do próprio JSX, como já fazem o
`<Juncao>` e o `<Setas>`. Sem Astro não existe mais escopo de CSS, então o seletor
tem que ser prefixado (`.jc-`, `.rz-`, `.setas-`) pra não vazar. O que é do sistema
visual, e não de um componente, mora em `global.css`.

**Texto com LaTeX só chega montado se vier como children.** `$...$` vira fórmula no
pipeline do MDX, então prop de string **não** passa por ele. Se o componente precisa
receber texto matemático, receba `children`. Quando a string for inevitável, o
componente tem que chamar o KaTeX na mão, o que é chato e vale evitar: o `<Questao>`
fazia isso nas alternativas e era o único lugar do site que precisava.

**Slot nomeado não existe em React.** Se um componente precisar de um segundo bloco
nomeado, o caminho é filtrar `children` por `props.slot === 'nome'`, e o MDX escreve
`<div slot="nome">`. Era assim que o gabarito do `<Questao>` entrava.

### Checklist de todo componente de visualização

- [ ] **Manipulável.** O aluno mexe e a tela responde. Figura estática não conta.
- [ ] **Slider + campo numérico.** Slider pra explorar, número pra travar em valor
      exato quando for resolver uma questão de verdade.
- [ ] **Controle com nome de gente.** O rótulo diz o que o aluno vai fazer
      ("cortar em quantas partes:"), e não o nome do parâmetro ("corta em").
- [ ] **Uma linha de orientação antes dos controles**, dizendo o que está desenhado
      em cima e o que os controles fazem. É a `.xx-como`.
- [ ] **Uma linha de "experimenta" depois**, com o que vale a pena tentar e o que
      olhar enquanto acontece. É a `.xx-nota`, e é onde moram também as teclas.
- [ ] **Isolar parâmetro** — travar os outros e deixar um só livre. Se tudo mexe
      junto, o aluno não separa as causas.
- [ ] **Teclado.** Setas ajustam valores; foco visível.
- [ ] **`chaveUrl`** — estado no hash da URL, pra o Victor achar a configuração
      perfeita no preparo e o link virar parte do material. O copiar link é um
      texto sublinhado no fim da nota, e não mais um botão.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] `aria-label` no `<svg>` descrevendo o estado atual em palavras.
- [ ] Cores **só** via as variáveis CSS de `global.css`. Nunca hex solto.

**Não** ponha fileira de botão embaixo dos controles. Congelar, recomeçar,
embaralhar, simplificar, igualar e os presets nomeados existiram em agosto de 2026
e saíram todos: o botão fazia a conta no lugar do aluno, e ele passava a olhar o
resultado aparecer em vez de mexer no controle até ele aparecer. Cada um deles foi
substituído por uma frase dizendo o que experimentar com as mãos que já estão nos
sliders.

Botão que sobrevive é o que **liga um jeito de mexer** e não tem como virar frase:
trocar a notação, entrar no modo de agrupar, contar por linha, girar a cabeça,
mostrar uma seta de cada vez. Se o botão faz sozinho o que o aluno deveria fazer,
ele é texto.

### Reuso antes de criação

Antes de criar um componente novo, verifique se um existente cobre o caso com
outra `prop`. A meta é ~15 componentes cobrindo o currículo inteiro, não um por
tópico. O `<Funcao>` com quatro sliders (`A + B·f(Cx + D)`) sozinho cobre
quadrática, exponencial, logaritmo, modular e trigonometria — e a mesma estrutura
é a equação da onda.

---

## 7. Exercícios

Voltaram em agosto de 2026, com uma regra de classificação e um workflow de
coleta. Uma aula sem exercício é meia aula: o aluno lê, acha que entendeu, e só
descobre que não entendeu na prova.

### São dois tipos de exercício, e a fonte é que diz qual

O **básico** é autoral, cobra uma aula só e fecha a página dela. Ele é o
exercício mais puro daquele assunto, o que serve pro aluno descobrir se entendeu
o que acabou de ler, e é por isso que ele não pode cobrar uma segunda aula: quem
está ali ainda não viu a segunda.

**Todo o resto vem de vestibular.** Se o exercício não é o básico de uma aula,
ele é uma questão de prova de verdade, com banca, ano e link pro original. Não
existe exercício autoral de dificuldade média inventado pra encher a lista: pra
isso existem provas, e elas são melhores do que eu escrevendo imitação de prova.

**Básico e fácil são coisas diferentes.** Básico é de onde o exercício vem, fácil
é o quanto ele dói. Um básico de junção pode ser um desafio, e uma questão da
FUVEST pode sair na primeira leitura. Por isso o `nivel` tem três valores que não
incluem "básico", e o básico não é campo nenhum: ele é `fonte: Autoral`, e a
página calcula. Mesma regra do `desbloqueia` do grafo e do "multidisciplinar" —
dois campos dizendo a mesma coisa acabam divergindo.

### O arquivo

Um `.mdx` por exercício em `content/exercicios/`. O nome do arquivo é o id:
`juncao-a01` pro básico (aula, `a`, número) e `fuvest-2024-q42` pro de prova.

```yaml
---
resumo: Junta quatro parcelas agrupando os sinais iguais primeiro  # a linha da busca
fonte: FUVEST                    # a banca, ou "Autoral" (que é o básico da aula)
ano: 2024                        # obrigatório quando não é autoral
fonte_url: https://…             # idem — é o que a auditoria abre pra conferir
fonte_questao: 42
nivel: facil                     # facil | medio | desafio — a dificuldade, e só
modulos: [juncao]                # ids de aula, o principal primeiro
resposta: "1"
verificado: false                # ← SEMPRE false ao criar. Ver 8.1
---
```

**Multidisciplinar não é campo.** Quem tem mais de um id em `modulos` já é, e a
página calcula.

**Autoral cai numa aula só**, pelo que está lá em cima, e o `npm run grafo`
recusa autoral com dois módulos.

### A busca filtra por três eixos

Dificuldade é ficha que liga e desliga, porque são três. Aula e vestibular são
campo de busca que vai somando o que você escolhe, porque as duas listas crescem
com o acervo, e 84 fichas de aula é uma parede que ninguém lê. O ano só aparece
depois que tem vestibular escolhido, e ele oferece só os anos daquela banca:
2019 da FUVEST e 2019 da UNICAMP são provas diferentes.

Trocar a banca poda o ano junto, senão sobra um `?ano=2018` na URL filtrando
escondido depois que a fileira de anos some da tela.

### O corpo

Enunciado em prosa solta no topo, as alternativas quando a questão for de prova,
e depois a escada e a resolução:

```mdx
Resolva, usando junção:

$$
9 - 4 - 6 + 2
$$

<Dicas>
  <Dica>o degrau que só aponta pra onde olhar</Dica>
  <Dica>o que nomeia a ferramenta, sem aplicar</Dica>
  <Dica>o que dá o primeiro passo, e para</Dica>
</Dicas>

<Resolucao resposta="1">

As contas, e depois os dois `###` de sempre:

### Raciocínio
### Erros comuns

</Resolucao>
```

`<Dicas>` abre um degrau por vez e `<Resolucao>` nasce fechada. Essas duas caixas
não são a volta das camadas da seção 2: ali a caixa era arquivamento, aqui ela é
função, porque dica que abre tudo de uma vez o aluno copia, e resolução aberta
transforma o exercício em exemplo resolvido.

**A escada sobe de degrau em degrau**, e eu já errei isso: na primeira versão do
`juncao-a01` a dica 1 já mandava reescrever tudo em forma de junção e a dica 3
entregava o procedimento inteiro. O degrau bom aponta pra onde olhar e devolve a
pergunta; se depois de ler a dica não sobrou nada pro aluno descobrir, ela está
alta demais.

**Nem todo exercício merece cerimônia, e enrolação é pior que seção faltando.**
Básico de junção cabe em enunciado, resposta e talvez o erro comum. O
**Raciocínio** é a parte que ninguém publica (o que eu olhei primeiro, o que
descartei e por quê), e ela cabe em duas ou três linhas: se estiver com cinco,
provavelmente duas são recheio. **Erros comuns** mostra a linha errada com a
conta que ela dá, e depois uma frase dizendo qual conceito faltou. Uma frase, não
um parágrafo.

Não use `chaveUrl` em exercício. A busca mostra vários de uma vez e eles brigam
pelo mesmo hash.

### O workflow do vestibular

1. O Victor diz qual prova (`vest_unb 2025`).
2. Eu busco a prova e o gabarito, e **leio a fonte**. Enunciado escrito de
   memória sai *quase* certo, e o *quase* é onde o aluno se perde (8.2).
3. Separo as questões de matemática.
4. Resolvo uma por uma com calma e **confiro no gabarito antes de escrever
   qualquer resolução**. Se a minha resposta não bater com o gabarito, a questão
   não entra: ou eu errei, ou o enunciado que eu li está truncado, e os dois
   casos são motivo pra parar.
5. Monto o arquivo, classifico com as tags e apresento.
6. O Victor lê, corta a dica repetida, ajusta o que ficou didaticamente ruim e
   **só ele troca `verificado` pra true**.

**Questão com figura eu não invento, e "não invento" não quer dizer "desisto".**
Antes de pular, eu abro a figura e olho pra ela: dá pra extrair as imagens do PDF
da prova com o `pdfjs-dist`, e daí decidir. Se ela for reproduzível com um
componente nosso (gráfico de função é o `<Plano>`), eu reproduzo e a questão
entra; se ela for um desenho de uma vez só, como um perfil de terreno, o `<svg>`
escrito à mão dentro do próprio `.mdx` resolve, e não vira componente no sistema.
Fica de fora a figura que eu não consigo ler ou que eu teria que adivinhar, e aí
eu digo qual foi e por quê.

### A auditoria: a página `/revisar`

Exercício com `verificado: false` **não aparece em lugar nenhum do site**, nem no
`npm run dev`, e não fica escondido atrás de um selo. Ele já apareceu na busca
com o selo de "não verificado" e um filtro de "só os não verificados", e aí a
busca virou mesa de auditoria por acidente: quem abre a página de exercícios está
estudando, e rascunho no meio da lista atrapalha as duas coisas.

O único lugar dele é a rota **`/revisar`**: cada exercício aparece renderizado, do
jeito que o aluno vê, com o botão de **aprovar** (que troca o `verificado` no
arquivo) e o texto do `.mdx` aberto ao lado pra corrigir e gravar. O caminho pra
lá é o **menu do ícone de conta**, com o número da fila do lado, e não um link na
página de exercícios.

Ela existe porque procurar um arquivo entre mil na pasta pra trocar um `false`
por `true` custa mais que ler a resolução. Quem escreve em disco é o middleware
de `plugins/revisar.ts`, que é do servidor de desenvolvimento do Vite: ele monta
só no `serve`, some no `npm run build`, e o `id` passa por `^[a-z0-9-]+$` antes
de virar caminho, senão um `../../` do corpo do POST escreveria em qualquer lugar
da máquina. A rota também só é registrada com `import.meta.env.DEV`.

**Isso não é o CMS que a seção 1 proíbe.** O trabalho grande continua no VS Code;
a `/revisar` é a passada de revisão, que é ler, cortar uma dica repetida, trocar
uma palavra e aprovar. Não tem histórico nem trava, porque o histórico é o git.

Quando as contas existirem, isso vira papel de admin (seção 1): o portão de hoje
é o `import.meta.env.DEV`, tanto na rota quanto no item do menu, e ele troca pelo
papel do mesmo jeito que o Modo Aula vai virar coisa de professor.

### Onde as coisas moram

| | |
|---|---|
| `content/exercicios/*.mdx` | os exercícios |
| `src/pages/Exercicios.tsx` | a busca com os filtros |
| `src/components/CartaoExercicio.tsx` | o cartão, usado na busca e no fim da aula |
| `src/components/Dicas.tsx` | `<Dicas>` e `<Dica>` |
| `src/components/Resolucao.tsx` | `<Resolucao>` |
| `src/pages/Revisar.tsx` | a mesa de auditoria, só no dev |
| `plugins/revisar.ts` | o middleware que lê e grava o `.mdx`, só no dev |
| `src/conteudo.ts` | o índice e o `exerciciosDaAula()` |

O bloco do fim da aula é automático, no `Conceito.tsx`: ele pega os básicos
daquela aula (os autorais) e fecha com o link pra busca já filtrada. **Não** existe componente
de exercício pra escrever no `.mdx` da aula.

## 8. Regras invioláveis

### 8.1 `revisado: false` ao criar. Sempre.

Todo conteúdo novo nasce em rascunho.

Isso não é burocracia. **Conteúdo de matemática e física gerado por IA contém
erros** — não grosseiros, sutis: sinal trocado numa passagem, condição de
existência omitida, caso particular tratado como geral. O Victor ensinando com um
erro desses causa dano real e demora pra ser detectado.

**Nunca marque `revisado: true`.** Só o Victor faz isso, depois de ler linha por
linha e refazer a conta.

Até agosto de 2026 o Modo Aula se recusava a exibir as camadas de conteúdo não
revisado, e esse era o portão. Sem camadas, o portão deixou de existir como
mecanismo: hoje o que marca a página é o selo de rascunho. A regra de nunca
marcar `true` sozinho continua valendo igual.

### 8.2 Não invente conteúdo factual

Enunciado de prova real (FUVEST, UNICAMP, ENEM) só entra **com a fonte aberta na
frente**: ou o Victor cola o texto, ou você busca a prova e transcreve lendo, com
`fonte_url` e o número da questão no frontmatter, que é o que a auditoria abre pra
comparar (seção 7). Nunca reconstrua de memória: o enunciado sai quase certo e o
*quase* é justamente onde o aluno se perde.

Se precisar de exercício e não houver fonte, escreva **autoral** e marque
`fonte: Autoral`. Exercício autoral honesto vale mais que FUVEST inventada.

### 8.3 Esqueletos são honestos

Ao criar um conceito só pra fechar o grafo, escreva um esqueleto de verdade:
título, resumo, e um parágrafo dizendo o que a página *vai* cobrir e o que ainda
falta decidir. Termine com uma linha em itálico listando o que falta.

Não escreva meia página plausível pra parecer completo. Página pela metade que
parece inteira é pior que página vazia — ela some do radar.

### 8.4 Uma sessão, uma aula

Não escreva dez aulas de uma vez. O gargalo é a revisão do Victor, não a geração:
dez páginas não revisadas é dívida, não progresso.

Isso vale pra *escrever aula*. Mexer no currículo inteiro (criar esqueleto, ligar
prereq, declarar tópico) é outra coisa e pode ser feito de uma vez, porque
esqueleto honesto não é conteúdo pra revisar.

---

## 9. Pegadinhas conhecidas

| Sintoma | Causa |
|---|---|
| Página em branco e *"Expected component X to be defined"* no console | componente usado no MDX que não está em `src/components/mdx.tsx`. `npm run paginas` acusa sem abrir o navegador |
| Elo `<C>` aparece vermelho | o id não existe. `npm run grafo` lista |
| LaTeX aparece cru | cifrão desbalanceado, ou `\$` escapado sem querer |
| Tabela virou um parágrafo cheio de `\|` | falta o `remark-gfm` no `vite.config.ts`. `npm run paginas` acusa |
| Fórmula de bloco sai pequena, no meio do parágrafo | escreveu `$$x$$` numa linha só. Os `$$` têm que ficar em linhas próprias (seção 5) |
| O texto colou no fechamento do frontmatter | falta a linha em branco depois do `---` |
| `npm run grafo` reclama de "falta topicos" | aula sem índice remissivo. Sem ele, ninguém acha o assunto pela busca |
| Área do mapa saiu cinza | é o 6º bloco da matéria — a paleta só tem 5 (seção 3.2). Funda dois |
| Declarei um prereq e a seta não apareceu | ele é redundante, já vem por outro caminho. `npm run grafo` diz por qual |
| Aula caiu fundo demais no mapa | ou há um prereq exagerado na corrente, ou a fileira dela encheu e o teto de oito a empurrou pra baixo |
| Uma aula virou folha do grafo sem ser fim de currículo | alguém que dependia dela foi fundido ou removido. Já aconteceu com a junção |
| Em Modo Aula sobrou um monte de título sem sentido | os títulos estão ruins: eles precisam contar a história sozinhos |
| Primeira carga ficou lenta depois de muitas aulas | é a transposição do layout, que é quadrática no número de trechos. Há escala de partidas por tamanho em `layout-grafo.ts` — abaixe se precisar (84 aulas levam 0,11 s; 600 levariam 4,5 s) |
| CSS de um componente vazou pra outro | sem Astro não existe mais escopo. Prefixe o seletor (seção 6) |
| Rota direta dá 404 na nuvem | é SPA: o host precisa devolver `index.html` pra qualquer caminho. Em `npm run dev` e `npm run preview` isso já funciona |

Não use `localStorage` dentro de componentes de visualização — o estado deles vai
no hash da URL via `chaveUrl`. `localStorage` é só do `estado.tsx`, pra modo e
tamanho de fonte.

---

## 10. Atalhos do Modo Aula

| | |
|---|---|
| `Alt+1` | Estudo — tudo aberto |
| `Alt+2` | Aula — só títulos e gráficos |
| `Alt+Z` | tamanho da fonte (normal → grande → enorme) |
| `Esc` | fecha o painel do topo da pilha |

O modo escolhido vale também dentro dos painéis.

A ficha do topo também obedece o modo: em Estudo ela mostra o tempo de leitura do
aluno e em Aula mostra o tempo da aula, e quem troca é o CSS, como todo o resto.

**Só existem dois modos.** Existiu um terceiro, o Modo Prova, que escondia tudo
menos o enunciado; foi removido porque na prática o Modo Aula já fazia isso e
manter dois portões quase iguais só espalhava condição pelo CSS. Se pedirem "modo
prova" de volta, pergunte o que ele faria que o Modo Aula não faz.
