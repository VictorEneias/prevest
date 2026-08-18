# Plano de aulas — Matemática

84 aulas, 768 tópicos declarados, 51h10 de aula. Gerado por `npm run plano` a partir do frontmatter de `content/conceitos/`; **não edite este arquivo à mão**, edite a aula e rode o script de novo.

## Como ler uma ficha

- **Nível** é a profundidade no grafo: quantas aulas você atravessa até chegar nesta. Nível 0 não depende de nada.
- **Precisa de** são os pré-requisitos diretos declarados. Só o mais próximo aparece: se A já é pré-requisito de B, a aula que pede B não repete A.
- **Destrava** é o inverso, calculado — quem trava se esta aula não for dada.
- **Tópicos** é o que a aula cobre por dentro, e é promessa: se a aula não cobrir, ou o tópico sai ou a nota de falta diz que aquela parte não foi escrita.
- **Escrita / esqueleto** diz se o `.mdx` já tem a aula ou só o contrato dela.
- **Tempo** não é chute: sai de `npm run tempos`. Aula escrita é medida na própria página, contando prosa, fórmula, tabela, figura e interativo; esqueleto sai de uma régua por tópicos ajustada nas escritas. A aula roda a 65 palavras por minuto e a leitura do aluno em casa a 130, que são as taxas de "muitos conceitos novos" do estimador de carga do Wake Forest (Barre e Esarey), pros objetivos de engajar e de entender. O detalhe está em `scripts/tempo-aula.mjs`.

## Panorama por área

| Área | Aulas | Tópicos | Tempo |
|---|---:|---:|---:|
| Aritmética | 17 | 147 | 9h55 |
| Álgebra | 16 | 135 | 9h15 |
| Funções | 17 | 160 | 10h30 |
| Geometria | 25 | 247 | 16h05 |
| Dados e contagem | 9 | 79 | 5h25 |
| **Total** | **84** | **768** | **51h10** |

Por nível declarado: **41 de base** (revisão de fundamental que trava o resto, 25h05) e **43 de médio** (26h05).

Por estado: **6 escritas** (Conjuntos numéricos, Esticamento, Frações, Junção, O que cada operação faz, A reta numérica) e **78 esqueletos**, que já têm título, resumo, tópicos e prereqs, mas nenhum texto.

## Os gargalos

As aulas que mais destravam outras. Se o aluno chega no meio do ano, é por aqui que se decide o que não dá pra pular.

| Aula | Destrava | Quem |
|---|---:|---|
| Esticamento | 6 | Combinações, Linguagem algébrica, Porcentagem, Potências, Primos e fatoração, Razão e proporção |
| Função afim | 6 | A reta no plano, Função composta e inversa, Função exponencial, Função modular, Função quadrática, Sequências e PA |
| Potências | 5 | Função exponencial, Juros simples e compostos, Monômios e polinômios, Notação científica, Radiciação |
| Radiciação | 4 | Equação do 2º grau, Dispersão, Números reais, Teorema de Pitágoras |
| Circunferência e círculo | 3 | A circunferência no plano, Comprimento e área do círculo, Círculo trigonométrico |
| Equação do 1º grau | 3 | Inequações do 1º grau, O que é uma função, Sistemas do 1º grau |
| Equação do 2º grau | 3 | Função quadrática, Números complexos, Polinômios |
| Função exponencial | 3 | Equações e inequações exponenciais, Logaritmos, Progressão geométrica |
| Plano cartesiano | 3 | O ponto no plano, Círculo trigonométrico, O que é uma função |
| O que cada operação faz | 3 | Frações, Junção, Princípio multiplicativo |
| Triângulos | 3 | Circunferência e círculo, Polígonos, Quadriláteros |
| Áreas de polígonos | 2 | Comprimento e área do círculo, Prismas |

**Fim de linha** (não destravam ninguém, então dá pra deixar por último ou cortar sem estragar o resto): Binômio de Newton, Complexos na forma trigonométrica, Cônicas, Equações e inequações exponenciais, Equações e inequações logarítmicas, Equações polinomiais, Função modular, Identidades e equações trigonométricas, Inequações e estudo do sinal, Juros simples e compostos, Lei dos senos e dos cossenos, Dispersão, Notação científica, Probabilidade condicional, Progressão geométrica, Sistemas lineares, Sólidos inscritos e circunscritos.

## Uma ordem possível

O grafo declara dependência, não fila. Esta é uma ordem que respeita todos os pré-requisitos e sobe camada por camada do mapa, ficando na mesma área enquanto dá; a ordem real é oportunista, guiada pelo que o aluno está vendo na escola.

| # | Aula | Área | Nível | Min | Acum. |
|---:|---|---|---:|---:|---:|
| 1 | A reta numérica | Aritmética | 0 | 25 | 0h25 |
| 2 | Ângulos | Geometria | 0 | 35 | 1h00 |
| 3 | Triângulos | Geometria | 1 | 55 | 1h55 |
| 4 | Conjuntos numéricos | Aritmética | 1 | 45 | 2h40 |
| 5 | O que cada operação faz | Aritmética | 2 | 40 | 3h20 |
| 6 | Circunferência e círculo | Geometria | 2 | 45 | 4h05 |
| 7 | Plano cartesiano | Geometria | 2 | 40 | 4h45 |
| 8 | Polígonos | Geometria | 2 | 35 | 5h20 |
| 9 | Quadriláteros | Geometria | 2 | 40 | 6h00 |
| 10 | Retas e planos no espaço | Geometria | 3 | 40 | 6h40 |
| 11 | Frações | Aritmética | 3 | 50 | 7h30 |
| 12 | Junção | Aritmética | 3 | 30 | 8h00 |
| 13 | Princípio multiplicativo | Dados e contagem | 3 | 35 | 8h35 |
| 14 | Arranjos e permutações | Dados e contagem | 4 | 35 | 9h10 |
| 15 | Esticamento | Aritmética | 4 | 30 | 9h40 |
| 16 | Poliedros | Geometria | 4 | 35 | 10h15 |
| 17 | Potências | Aritmética | 5 | 35 | 10h50 |
| 18 | Porcentagem | Aritmética | 5 | 25 | 11h15 |
| 19 | Razão e proporção | Aritmética | 5 | 40 | 11h55 |
| 20 | Primos e fatoração | Aritmética | 5 | 35 | 12h30 |
| 21 | Linguagem algébrica | Álgebra | 5 | 35 | 13h05 |
| 22 | Combinações | Dados e contagem | 5 | 35 | 13h40 |
| 23 | Leitura de gráficos e tabelas | Dados e contagem | 6 | 45 | 14h25 |
| 24 | Probabilidade | Dados e contagem | 6 | 35 | 15h00 |
| 25 | Radiciação | Aritmética | 6 | 35 | 15h35 |
| 26 | Unidades de medida | Aritmética | 6 | 35 | 16h10 |
| 27 | Aumentos e descontos | Aritmética | 6 | 35 | 16h45 |
| 28 | Notação científica | Aritmética | 6 | 25 | 17h10 |
| 29 | Equação do 1º grau | Álgebra | 6 | 35 | 17h45 |
| 30 | Monômios e polinômios | Álgebra | 6 | 30 | 18h15 |
| 31 | Teorema de Tales | Geometria | 6 | 25 | 18h40 |
| 32 | Áreas de polígonos | Geometria | 7 | 40 | 19h20 |
| 33 | Semelhança de triângulos | Geometria | 7 | 45 | 20h05 |
| 34 | Produtos notáveis | Álgebra | 7 | 30 | 20h35 |
| 35 | Sistemas do 1º grau | Álgebra | 7 | 30 | 21h05 |
| 36 | Números reais | Aritmética | 7 | 35 | 21h40 |
| 37 | Juros simples e compostos | Aritmética | 7 | 35 | 22h15 |
| 38 | O que é uma função | Funções | 7 | 50 | 23h05 |
| 39 | Média, moda e mediana | Dados e contagem | 7 | 35 | 23h40 |
| 40 | Probabilidade condicional | Dados e contagem | 7 | 35 | 24h15 |
| 41 | Binômio de Newton | Dados e contagem | 8 | 30 | 24h45 |
| 42 | Dispersão | Dados e contagem | 8 | 40 | 25h25 |
| 43 | Função afim | Funções | 8 | 40 | 26h05 |
| 44 | Fatoração | Álgebra | 8 | 35 | 26h40 |
| 45 | Matrizes | Álgebra | 8 | 35 | 27h15 |
| 46 | Prismas | Geometria | 8 | 50 | 28h05 |
| 47 | Teorema de Pitágoras | Geometria | 8 | 35 | 28h40 |
| 48 | Comprimento e área do círculo | Geometria | 8 | 35 | 29h15 |
| 49 | Conjuntos e intervalos | Aritmética | 8 | 40 | 29h55 |
| 50 | Equação do 2º grau | Álgebra | 9 | 40 | 30h35 |
| 51 | Determinantes | Álgebra | 9 | 35 | 31h10 |
| 52 | Frações algébricas | Álgebra | 9 | 35 | 31h45 |
| 53 | Inequações do 1º grau | Álgebra | 9 | 30 | 32h15 |
| 54 | Função exponencial | Funções | 9 | 35 | 32h50 |
| 55 | Função composta e inversa | Funções | 9 | 35 | 33h25 |
| 56 | Sequências e PA | Funções | 9 | 35 | 34h00 |
| 57 | Função modular | Funções | 9 | 30 | 34h30 |
| 58 | O ponto no plano | Geometria | 9 | 30 | 35h00 |
| 59 | Cilindro e cone | Geometria | 9 | 50 | 35h50 |
| 60 | Pirâmides | Geometria | 9 | 40 | 36h30 |
| 61 | Relações métricas no triângulo retângulo | Geometria | 9 | 30 | 37h00 |
| 62 | Trigonometria no triângulo retângulo | Geometria | 10 | 40 | 37h40 |
| 63 | A reta no plano | Geometria | 10 | 50 | 38h30 |
| 64 | Esfera | Geometria | 10 | 35 | 39h05 |
| 65 | Função quadrática | Funções | 10 | 40 | 39h45 |
| 66 | Logaritmos | Funções | 10 | 40 | 40h25 |
| 67 | Equações e inequações exponenciais | Funções | 10 | 30 | 40h55 |
| 68 | Progressão geométrica | Funções | 10 | 35 | 41h30 |
| 69 | Números complexos | Álgebra | 10 | 40 | 42h10 |
| 70 | Polinômios | Álgebra | 10 | 40 | 42h50 |
| 71 | Sistemas lineares | Álgebra | 10 | 35 | 43h25 |
| 72 | Equações polinomiais | Álgebra | 11 | 35 | 44h00 |
| 73 | Círculo trigonométrico | Funções | 11 | 45 | 44h45 |
| 74 | Função logarítmica | Funções | 11 | 30 | 45h15 |
| 75 | Transformações de gráfico | Funções | 11 | 40 | 45h55 |
| 76 | Inequações e estudo do sinal | Funções | 11 | 30 | 46h25 |
| 77 | A circunferência no plano | Geometria | 11 | 35 | 47h00 |
| 78 | Lei dos senos e dos cossenos | Geometria | 11 | 25 | 47h25 |
| 79 | Sólidos inscritos e circunscritos | Geometria | 11 | 35 | 48h00 |
| 80 | Cônicas | Geometria | 12 | 40 | 48h40 |
| 81 | Funções trigonométricas | Funções | 12 | 40 | 49h20 |
| 82 | Equações e inequações logarítmicas | Funções | 12 | 30 | 49h50 |
| 83 | Complexos na forma trigonométrica | Álgebra | 12 | 35 | 50h25 |
| 84 | Identidades e equações trigonométricas | Funções | 13 | 45 | 51h10 |

## As fichas

### Aritmética

17 aulas, 9h55.

#### 1. A reta numérica

*Onde os números moram*

Todo número é um ponto numa reta. Dessa imagem saem a escala, o negativo, o módulo, o oposto e a comparação.

`reta-numerica` · nível 0 · base · **25 min de aula** e 14 min de leitura em casa (medido na página) · 8 tópicos

**Precisa de:** nada, é porta de entrada  
**Destrava:** Conjuntos numéricos

**O que a aula cobre:**

- reta numérica
- escala
- número negativo
- módulo de um número
- valor absoluto
- oposto de um número
- comparação de números
- densidade dos números

**Seções já escritas:** Todo número tem um endereço · Escala · Do outro lado do zero · Duas informações num número só · O oposto · Quem é maior · Um jeito de conferir quando bater a dúvida

#### 4. Conjuntos numéricos

*Dando nome aos moradores da reta*

A sintaxe dos conjuntos, e depois os moradores: naturais, inteiros e racionais, com a regra de entrada de cada um e o encaixe entre eles.

`conjuntos-numericos` · nível 1 · base · **45 min de aula** e 23 min de leitura em casa (medido na página) · 13 tópicos

**Precisa de:** A reta numérica  
**Destrava:** Plano cartesiano, O que cada operação faz

**O que a aula cobre:**

- sintaxe matemática
- elemento de um conjunto
- símbolo de pertence
- está contido e contém
- subconjunto
- símbolo de união
- símbolo de interseção
- conjunto vazio
- para todo e existe
- números naturais
- números inteiros
- números racionais
- N Z Q

**Seções já escritas:** O que é um conjunto · A sintaxe: os símbolos que você vai ler pelo resto da vida · Os três conjuntos que eu vou usar em tudo · $\in$ e $\notin$: pertence e não pertence · $\subset$ e $\supset$: está contido e contém · $\not\subset$ e $\not\supset$: não está contido e não contém · $\cup$ e $\cap$: união e interseção · Três que aparecem sem aviso: para todo, existe e portanto · Os naturais: os números de contar · Os inteiros: os naturais mais os opostos deles · Os racionais: quem dá pra escrever como fração · Um dentro do outro · E será que sobrou alguém de fora?

#### 5. O que cada operação faz

*O significado por trás da conta que você já sabe fazer*

As quatro operações vistas pelo significado, a ordem em que uma expressão se resolve, e os dois pares em que uma operação desfaz a outra.

`quatro-operacoes` · nível 2 · base · **40 min de aula** e 19 min de leitura em casa (medido na página) · 9 tópicos

**Precisa de:** Conjuntos numéricos  
**Destrava:** Frações, Junção, Princípio multiplicativo

**O que a aula cobre:**

- significado da adição
- subtração como distância
- multiplicação como repetição
- quantos cabem
- repartir em partes iguais
- divisão por zero
- operação inversa
- ordem das operações
- expressões numéricas

**Seções já escritas:** Somar é andar mais um tanto · Subtrair é andar pra trás, e também é medir distância · Multiplicar é repetir a mesma seta · Por que 3 × 4 dá o mesmo que 4 × 3 · Dividir tem duas leituras, e as duas importam · Por que não dá pra dividir por zero · Em que ordem você resolve, e por quê · Uma expressão numérica é isso repetido · Dois pares em que uma desfaz a outra · Onde o pessoal escorrega

#### 11. Frações

*O número que mora entre as marcas*

A fração como divisão que ficou pendente, e tudo que você precisa pra operar com ela.

`fracoes` · nível 3 · base · **50 min de aula** e 24 min de leitura em casa (medido na página) · 12 tópicos

**Precisa de:** O que cada operação faz  
**Destrava:** Esticamento

**O que a aula cobre:**

- numerador e denominador
- frações equivalentes
- simplificação
- fração irredutível
- critérios de divisibilidade
- MMC
- MDC
- comparação de frações
- soma de frações
- multiplicação de frações
- divisão de frações
- fração de fração

**Seções já escritas:** Uma fração é uma divisão que ficou pendente · O mesmo ponto com vários nomes · Divisibilidade: descobrir se corta sem fazer a conta · Simplificar: cortar até não dar mais · Quem é maior · Somar e subtrair: só junta pedaço do mesmo tamanho · Multiplicar é o mais fácil de todos · Dividir por uma fração: quantos cabem · Por que somar os algarismos funciona no 3 e no 9 · Onde o pessoal escorrega

**Falta:** esta é a aula mais longa do curso, com 70 minutos, e ela cobre o que a escola divide em três. Se em aula ela não couber num encontro, o corte é tirar divisibilidade e MDC pra junto de primos e fatoração, que já existe e já cobre o método pelos primos. A divisão por fração é ensinada aqui pela contagem de "quantos cabem", de propósito, e a explicação pelo inverso fica com o esticamento: quem mexer nas duas, mexa nas duas juntas.

#### 12. Junção

*O óculos que muda o seu jeito de ver os números*

Parar de ver o sinal como parte da operação e passar a ver como característica do número. Soma e subtração viram uma coisa só.

`juncao` · nível 3 · base · **30 min de aula** e 16 min de leitura em casa (medido na página) · 7 tópicos

**Precisa de:** O que cada operação faz  
**Destrava:** Esticamento

**O que a aula cobre:**

- soma algébrica
- sinal do número
- regra de sinais na adição
- comutatividade
- associatividade
- oposto
- sinal na frente de parênteses

**Seções já escritas:** Mas afinal, o que é junção? · Alguns exemplos · Exemplo 1 · Exemplo 2 · Exemplo 3 · Agora mexe você · O sinal na frente do parêntese · Não é pra complicar · Onde o pessoal escorrega

#### 15. Esticamento

*Por que a divisão não existe*

Dividir por um número é multiplicar pelo inverso dele, então multiplicação e divisão são a mesma operação escrita de dois jeitos, e a regra de sinais sai junto.

`esticamento` · nível 4 · base · **30 min de aula** e 15 min de leitura em casa (medido na página) · 6 tópicos

**Precisa de:** Frações, Junção  
**Destrava:** Combinações, Linguagem algébrica, Porcentagem, Potências, Primos e fatoração, Razão e proporção

**O que a aula cobre:**

- inverso de um número
- divisão como multiplicação
- regra de sinais na multiplicação
- menos com menos dá mais
- cancelamento
- elemento neutro

**Seções já escritas:** Cada número tem um inverso · O zero é o único que fica de fora · Dividir é multiplicar pelo inverso · Multiplicar por negativo é virar a seta · Cortar em cima e embaixo é multiplicar por 1 · O ganho: a ordem parou de importar · Onde isso vai te salvar · O paralelo inteiro entre as duas aulas · Onde o pessoal escorrega

**Falta:** decidir o nome. "Esticamento" continua provisório, é o meu jeito de espelhar a junção, e agora que a figura mostra a seta esticando, encolhendo e virando, o nome ficou mais defensável do que era. A divisão por fração é ensinada em frações pela contagem de "quantos cabem", e a explicação pelo inverso é desta aula: quem mexer numa das duas, mexa nas duas juntas.

#### 17. Potências

*Multiplicação repetida, e o que isso obriga*

As propriedades das potências saindo da definição, incluindo o que significa expoente zero e expoente negativo.

`potencias` · nível 5 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Esticamento  
**Destrava:** Função exponencial, Juros simples e compostos, Monômios e polinômios, Notação científica, Radiciação

**O que a aula cobre:**

- potência de expoente natural
- produto de mesma base
- quociente de mesma base
- potência de potência
- expoente zero
- expoente negativo
- potência de fração
- potência de base negativa

**Recorte previsto:** a definição, as propriedades operatórias deduzidas dela, e a extensão pra expoente zero e negativo.

**Falta:** o expoente zero precisa ser deduzido pela regra do quociente, nunca apresentado como convenção. O expoente fracionário fica na aula de radiciação, porque depende de raiz.

#### 18. Porcentagem

*Fração de denominador cem, e nada além disso*

Toda porcentagem é uma fração disfarçada. Quem enxerga isso para de decorar fórmula.

`porcentagem` · nível 5 · base · **25 min de aula** e 13 min de leitura em casa (planejado pelos tópicos) · 6 tópicos

**Precisa de:** Esticamento  
**Destrava:** Leitura de gráficos e tabelas, Aumentos e descontos

**O que a aula cobre:**

- porcentagem
- porcentagem como fração
- porcentagem como decimal
- calcular porcentagem de um valor
- qual porcentagem um valor representa
- valor cheio a partir da parte

**Recorte previsto:** a porcentagem como fração de cem, os três tipos de pergunta que ela gera, e o cálculo mental por decomposição.

**Falta:** aumento e desconto ficam na aula de variação percentual, porque lá o objeto é o fator e não a porcentagem em si.

#### 19. Razão e proporção

*Comparar por divisão em vez de por diferença*

Razão, proporção e as grandezas que andam juntas, com a regra de três como consequência e não como truque.

`proporcionalidade` · nível 5 · base · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 11 tópicos

**Precisa de:** Esticamento  
**Destrava:** Teorema de Tales, Unidades de medida

**O que a aula cobre:**

- razão
- proporção
- propriedade fundamental
- grandezas diretamente proporcionais
- grandezas inversamente proporcionais
- regra de três simples
- regra de três composta
- escala de mapa
- divisão em partes proporcionais
- velocidade média como razão
- densidade

**Recorte previsto:** a razão como comparação, a proporção e sua propriedade fundamental, os dois tipos de proporcionalidade, e a regra de três simples e composta saindo daí.

**Falta:** o passo que todo mundo erra é decidir se é direta ou inversa antes de montar. Isso precisa de um procedimento explícito, não de intuição.

#### 20. Primos e fatoração

*As peças de que todo número é feito*

Todo número composto se desmonta em primos de um jeito só, e é daí que sai o método rápido de MMC e MDC.

`primos-e-fatoracao` · nível 5 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Esticamento  
**Destrava:** Radiciação

**O que a aula cobre:**

- número primo
- número composto
- fatoração em primos
- teorema fundamental da aritmética
- quantidade de divisores
- MMC por fatoração
- MDC por fatoração
- crivo de Eratóstenes

**Recorte previsto:** a decomposição em primos, o teorema fundamental da aritmética, a contagem de divisores a partir dos expoentes, e o método de MMC e MDC pela fatoração.

**Falta:** a contagem de divisores é o item que mais aparece em prova e o que menos é ensinado. Falta decidir se ela entra por aqui ou se ganha espaço na aula de contagem.

#### 25. Radiciação

*A pergunta invertida da potência*

Raiz como operação inversa, com as propriedades dos radicais vindo das propriedades das potências.

`radiciacao` · nível 6 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Potências, Primos e fatoração  
**Destrava:** Equação do 2º grau, Dispersão, Números reais, Teorema de Pitágoras

**O que a aula cobre:**

- raiz quadrada
- raiz n-ésima
- índice e radicando
- propriedades dos radicais
- simplificação de radical
- racionalização de denominador
- expoente fracionário
- raiz de número negativo

**Recorte previsto:** a raiz como inversa da potência, as propriedades, a simplificação usando fatoração, a racionalização, e a passagem pra expoente fracionário.

**Falta:** deixar claro por que $\sqrt{a^2} = |a|$ e não $a$, que depende do módulo visto na reta numérica.

#### 26. Unidades de medida

*Converter sem decorar escadinha*

Comprimento, área, volume, massa e tempo, e por que área multiplica por cem e não por dez.

`unidades-de-medida` · nível 6 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Razão e proporção  
**Destrava:** Áreas de polígonos

**O que a aula cobre:**

- sistema métrico
- conversão de unidades
- unidades de área
- unidades de volume
- capacidade e litro
- massa
- tempo
- prefixos quilo mili centi

**Recorte previsto:** a conversão como multiplicação por um fator, e por que o fator de área é o quadrado do fator de comprimento.

**Falta:** a relação entre litro e decímetro cúbico é o ponto que mais confunde, e ela pede figura.

#### 27. Aumentos e descontos

*Por que 10% pra cima e 10% pra baixo não volta ao mesmo lugar*

A variação percentual tratada como fator multiplicativo, que é o que faz aumentos e descontos sucessivos pararem de assustar.

`variacao-percentual` · nível 6 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Porcentagem  
**Destrava:** Juros simples e compostos

**O que a aula cobre:**

- variação percentual
- fator de aumento
- fator de desconto
- aumentos sucessivos
- descontos sucessivos
- variação percentual total
- aumento seguido de desconto
- desconto equivalente
- ponto percentual

**Recorte previsto:** a variação como multiplicação por um fator, o encadeamento de fatores em variações sucessivas, e a variação total.

**Falta:** o exemplo que fixa isso é o do preço que sobe 10% e desce 10%, e a conta precisa aparecer nos dois sentidos pra ficar claro que a ordem não muda o resultado.

#### 28. Notação científica

*Escrever o muito grande e o muito pequeno*

Potência de dez como ferramenta de escala, e a ponte pra ordem de grandeza na Física.

`notacao-cientifica` · nível 6 · base · **25 min de aula** e 13 min de leitura em casa (planejado pelos tópicos) · 6 tópicos

**Precisa de:** Potências  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- potência de dez
- notação científica
- ordem de grandeza
- operações em notação científica
- algarismos significativos
- arredondamento

**Recorte previsto:** a escrita em notação científica, as operações, e a ordem de grandeza como estimativa.

**Falta:** a ponte com a Física é o motivo principal desta aula existir, e a Física ainda não tem nenhuma aula no site.

#### 36. Números reais

*O que sobra quando a fração não dá conta*

Dízima, fração geratriz e irracionais, até a reta ficar completa.

`numeros-reais` · nível 7 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Radiciação  
**Destrava:** Conjuntos e intervalos

**O que a aula cobre:**

- dízima periódica
- fração geratriz
- decimal exato
- números irracionais
- número pi
- conjunto dos reais
- aproximação
- arredondamento
- 0,999... é igual a 1

**Recorte previsto:** a dízima e o método da fração geratriz, a existência dos irracionais, e o fechamento da reta com os reais.

**Falta:** a demonstração de que $\sqrt{2}$ é irracional é a primeira prova por absurdo do curso e precisa ser bem conduzida. Falta decidir se ela fica aqui ou vira um aparte.

#### 37. Juros simples e compostos

*Porcentagem com o tempo dentro*

Juros simples somam sempre sobre o mesmo capital, juros compostos multiplicam sobre o anterior, e a diferença explode com o tempo.

`juros` · nível 7 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Aumentos e descontos, Potências  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- capital
- taxa de juros
- montante
- juros simples
- juros compostos
- taxa equivalente
- taxa proporcional
- financiamento
- desconto

**Recorte previsto:** as duas leis de formação, a fórmula do montante em cada uma, a comparação entre elas e as taxas equivalentes.

**Falta:** juros compostos é uma PG e vale amarrar as duas aulas, mas isso obriga a decidir qual vem antes no currículo.

#### 49. Conjuntos e intervalos

*A notação que o ensino médio inteiro usa*

União, interseção e diferença, e a notação de intervalo que aparece em toda inequação daqui pra frente.

`conjuntos-e-intervalos` · nível 8 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Números reais  
**Destrava:** Inequações do 1º grau

**O que a aula cobre:**

- união
- interseção
- diferença de conjuntos
- complementar
- diagrama de Venn
- problema com dois conjuntos
- problema com três conjuntos
- intervalo aberto
- intervalo fechado
- notação de intervalo

**Recorte previsto:** as operações entre conjuntos, o diagrama de Venn como ferramenta de contagem, e a notação de intervalo na reta.

**Falta:** o problema de três conjuntos é onde o aluno se perde, e ele pede um método de preenchimento de dentro pra fora. O diagrama de Venn desta aula pode reusar o `<Conjunto>`, que já existe e já desenha dois conjuntos cruzados com os elementos dentro.

### Álgebra

16 aulas, 9h15.

#### 21. Linguagem algébrica

*A letra é um número que você ainda não sabe qual é*

O que uma letra representa, a diferença entre incógnita, variável e parâmetro, e o que autoriza juntar dois termos.

`linguagem-algebrica` · nível 5 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Esticamento  
**Destrava:** Equação do 1º grau, Monômios e polinômios

**O que a aula cobre:**

- incógnita
- variável
- parâmetro
- tradução de enunciado
- valor numérico
- termos semelhantes
- redução de termos semelhantes
- coeficiente

**Recorte previsto:** os três papéis que uma letra faz, a tradução de enunciado pra expressão, o valor numérico, e a redução de termos semelhantes.

**Falta:** a tradução de enunciado é o gargalo real e merece muito mais exemplo que a parte de operar. Falta uma coleção de frases típicas com a expressão ao lado.

#### 29. Equação do 1º grau

*O que "passa pro outro lado" está escondendo*

Desmontar o macete e mostrar que é só juntar o oposto dos dois lados.

`equacao-primeiro-grau` · nível 6 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Linguagem algébrica  
**Destrava:** Inequações do 1º grau, O que é uma função, Sistemas do 1º grau

**O que a aula cobre:**

- equação
- raiz da equação
- princípio aditivo
- princípio multiplicativo
- passar pro outro lado
- equação fracionária
- verificação da raiz
- problema do primeiro grau
- equação literal

**Recorte previsto:** a igualdade como balança, os dois princípios, a resolução passo a passo e a tradução de problema.

**Falta:** a equação literal (resolver pra uma letra no meio de outras) é o que a Física usa o tempo todo e quase não aparece na escola.

#### 30. Monômios e polinômios

*Contas com letras, sem nada de novo*

Somar, multiplicar e dividir expressões com as mesmas regras dos números, agora com letra junto.

`monomios-e-polinomios` · nível 6 · base · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Linguagem algébrica, Potências  
**Destrava:** Produtos notáveis

**O que a aula cobre:**

- monômio
- polinômio
- grau de um polinômio
- adição de polinômios
- multiplicação de polinômios
- divisão por monômio
- distributiva

**Recorte previsto:** a definição e o grau, as quatro operações com polinômios, e a distributiva como a regra que sustenta tudo.

**Falta:** a divisão de polinômio por polinômio fica na aula de polinômios, junto com Briot-Ruffini.

#### 34. Produtos notáveis

*Contas que aparecem tanto que vale reconhecer de cara*

Quadrado da soma, quadrado da diferença e diferença de quadrados, deduzidos e com figura.

`produtos-notaveis` · nível 7 · base · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Monômios e polinômios  
**Destrava:** Binômio de Newton, Fatoração

**O que a aula cobre:**

- quadrado da soma
- quadrado da diferença
- produto da soma pela diferença
- diferença de quadrados
- cubo da soma
- cubo da diferença
- interpretação geométrica

**Recorte previsto:** cada produto notável deduzido pela distributiva, a figura que mostra o quadrado da soma como área, e o reconhecimento no sentido inverso.

**Falta:** o erro de escrever $(a+b)^2 = a^2 + b^2$ é o mais comum da álgebra inteira e precisa de um contraexemplo numérico logo no começo.

#### 35. Sistemas do 1º grau

*Duas informações, duas incógnitas*

Substituição e adição, e o que significa um sistema não ter solução ou ter infinitas.

`sistemas-primeiro-grau` · nível 7 · base · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Equação do 1º grau  
**Destrava:** Matrizes

**O que a aula cobre:**

- sistema de equações
- método da substituição
- método da adição
- interpretação gráfica
- sistema impossível
- sistema indeterminado
- problema com duas incógnitas

**Recorte previsto:** os dois métodos, a leitura gráfica como duas retas, e a classificação pelo que acontece com as retas.

**Falta:** a interpretação gráfica depende de função afim, que vem depois. Falta decidir se ela entra aqui de leve ou se volta na aula de função afim.

#### 44. Fatoração

*O caminho de volta dos produtos notáveis*

Transformar soma em produto, que é o que permite simplificar e resolver depois.

`fatoracao-algebrica` · nível 8 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Produtos notáveis  
**Destrava:** Equação do 2º grau, Frações algébricas

**O que a aula cobre:**

- fator comum
- agrupamento
- diferença de quadrados
- trinômio quadrado perfeito
- trinômio do segundo grau
- soma de cubos
- diferença de cubos
- fatoração completa

**Recorte previsto:** os casos de fatoração em ordem de uso, com o critério de reconhecimento de cada um.

**Falta:** falta um fluxograma de decisão: olhar quantos termos tem, procurar fator comum primeiro, e só então testar os padrões.

#### 45. Matrizes

*Tabela de números que vira objeto de conta*

Organizar dados em linhas e colunas, e operar com a tabela inteira de uma vez.

`matrizes` · nível 8 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Sistemas do 1º grau  
**Destrava:** Determinantes

**O que a aula cobre:**

- matriz
- ordem de uma matriz
- lei de formação
- matriz identidade
- matriz transposta
- adição de matrizes
- multiplicação por escalar
- multiplicação de matrizes
- matriz inversa

**Recorte previsto:** os tipos, a lei de formação, as operações e a multiplicação linha por coluna.

**Falta:** a multiplicação de matrizes não é comutativa e isso precisa de um contraexemplo logo de cara, senão o aluno aplica as regras dos números.

#### 50. Equação do 2º grau

*De onde Bhaskara realmente vem*

A fórmula deduzida por completamento de quadrado, e o discriminante contando quantas raízes existem.

`equacao-segundo-grau` · nível 9 · base · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Fatoração, Radiciação  
**Destrava:** Função quadrática, Números complexos, Polinômios

**O que a aula cobre:**

- equação do segundo grau
- completar quadrado
- fórmula de Bhaskara
- discriminante
- delta
- soma e produto das raízes
- equação incompleta
- equação biquadrada
- equação irracional
- problema do segundo grau

**Recorte previsto:** a dedução por completamento de quadrado, o papel do discriminante, soma e produto, e as equações que viram do segundo grau por substituição.

**Falta:** o completamento de quadrado volta na função quadrática pra achar o vértice e na geometria analítica pra achar o centro da circunferência. Vale marcar isso aqui.

#### 51. Determinantes

*Um número que resume a matriz inteira*

Cálculo de determinante e o que ele significa geometricamente.

`determinantes` · nível 9 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Matrizes  
**Destrava:** Sistemas lineares

**O que a aula cobre:**

- determinante de ordem 2
- determinante de ordem 3
- regra de Sarrus
- teorema de Laplace
- cofator
- propriedades dos determinantes
- matriz singular
- determinante e área

**Recorte previsto:** o cálculo em ordem 2 e 3, Laplace pra ordem maior, as propriedades que abreviam a conta, e o significado de área.

**Falta:** o determinante como área do paralelogramo amarra esta aula com a geometria analítica, e é o que faz ele parar de ser uma regra sem sentido.

#### 52. Frações algébricas

*Fração com letra embaixo, e o cuidado que isso exige*

Simplificar e operar frações com polinômio, sem esquecer que o denominador não pode zerar.

`fracoes-algebricas` · nível 9 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Fatoração  
**Destrava:** Inequações e estudo do sinal

**O que a aula cobre:**

- fração algébrica
- condição de existência
- simplificação de fração algébrica
- soma de frações algébricas
- MMC de polinômios
- multiplicação e divisão
- fração composta
- equação fracionária

**Recorte previsto:** a simplificação por fatoração, a condição de existência, as quatro operações e a equação fracionária.

**Falta:** cortar termo de soma em vez de fator é o erro clássico e precisa aparecer escrito errado, com o contraexemplo numérico do lado.

#### 53. Inequações do 1º grau

*Quando a resposta é um pedaço da reta*

Quase tudo igual à equação, menos um detalhe que inverte tudo: multiplicar por negativo.

`inequacoes-primeiro-grau` · nível 9 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Equação do 1º grau, Conjuntos e intervalos  
**Destrava:** Inequações e estudo do sinal

**O que a aula cobre:**

- desigualdade
- inequação
- inversão do sinal
- conjunto solução
- representação na reta
- sistema de inequações
- inequação fracionária

**Recorte previsto:** a desigualdade como comparação de posição na reta, a inversão ao multiplicar por negativo, e o conjunto solução em notação de intervalo.

**Falta:** por que multiplicar por negativo inverte precisa sair da reta numérica, não de uma regra decorada.

#### 69. Números complexos

*O que acontece quando a raiz de um negativo faz falta*

Inventar um número novo pra fechar o que faltava, e descobrir que ele tem geometria.

`numeros-complexos` · nível 10 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Equação do 2º grau  
**Destrava:** Complexos na forma trigonométrica

**O que a aula cobre:**

- unidade imaginária
- número complexo
- forma algébrica
- parte real
- parte imaginária
- conjugado
- operações com complexos
- potências de i
- módulo de um complexo
- plano de Argand-Gauss

**Recorte previsto:** a criação do i, as operações na forma algébrica, o conjugado e a representação no plano.

**Falta:** o motivo histórico não foi resolver equação do segundo grau, e sim a fórmula da cúbica. Falta decidir se isso entra como aparte.

#### 70. Polinômios

*Dividir expressão por expressão*

Grau, valor numérico e a divisão de polinômios, com o dispositivo que abrevia a conta.

`polinomios` · nível 10 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Equação do 2º grau  
**Destrava:** Equações polinomiais

**O que a aula cobre:**

- polinômio
- grau do polinômio
- valor numérico
- divisão de polinômios
- método da chave
- dispositivo de Briot-Ruffini
- teorema do resto
- teorema de D'Alembert
- raiz de polinômio
- identidade de polinômios

**Recorte previsto:** a divisão pelo método da chave, o Briot-Ruffini como atalho, e os teoremas que ligam resto e raiz.

**Falta:** Briot-Ruffini costuma ser ensinado como receita. Ele precisa aparecer como a divisão da chave escrita de forma abreviada, com as duas contas lado a lado uma vez.

#### 71. Sistemas lineares

*Muitas equações de uma vez*

Escalonamento e Cramer, e a classificação em possível, impossível ou indeterminado.

`sistemas-lineares` · nível 10 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Determinantes  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- sistema linear
- matriz dos coeficientes
- escalonamento
- regra de Cramer
- sistema possível determinado
- sistema possível indeterminado
- sistema impossível
- discussão de sistema
- sistema homogêneo

**Recorte previsto:** o escalonamento como método geral, Cramer como atalho, e a discussão de sistema com parâmetro.

**Falta:** a discussão com parâmetro é o item difícil e depende de olhar o determinante antes de resolver.

#### 72. Equações polinomiais

*Além do segundo grau*

Raízes de polinômios de grau maior, com o teorema fundamental da álgebra e as relações de Girard.

`equacoes-polinomiais` · nível 11 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Polinômios  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- equação polinomial
- raiz
- multiplicidade
- teorema fundamental da álgebra
- decomposição em fatores
- relações de Girard
- soma e produto das raízes
- raízes racionais
- raízes complexas conjugadas

**Recorte previsto:** a fatoração de um polinômio pelas raízes, a multiplicidade, as relações de Girard e a busca de raiz racional.

**Falta:** decidir quanto de Girard entra. A FUVEST cobra pouco, mas soma e produto das raízes aparece com frequência.

#### 83. Complexos na forma trigonométrica

*O complexo como giro*

Escrito com módulo e argumento, multiplicar complexo vira girar e esticar.

`complexos-forma-trigonometrica` · nível 12 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Números complexos, Círculo trigonométrico  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- forma trigonométrica
- forma polar
- argumento
- módulo
- multiplicação na forma polar
- divisão na forma polar
- fórmula de De Moivre
- potência de complexo
- raízes de um complexo

**Recorte previsto:** a passagem entre as duas formas, a multiplicação como giro, De Moivre e as raízes n-ésimas no círculo.

**Falta:** as raízes n-ésimas caindo em vértices de polígono regular é a imagem que fecha a aula, e ela precisa de figura interativa.

### Funções

17 aulas, 10h30.

#### 38. O que é uma função

*Uma máquina que aceita um número e devolve outro*

Domínio, imagem e gráfico, e a regra de que cada entrada tem uma saída só.

`introducao-a-funcoes` · nível 7 · base · **50 min de aula** e 25 min de leitura em casa (planejado pelos tópicos) · 13 tópicos

**Precisa de:** Plano cartesiano, Equação do 1º grau  
**Destrava:** Função afim

**O que a aula cobre:**

- função
- domínio
- contradomínio
- imagem
- lei de formação
- gráfico de função
- teste da reta vertical
- função crescente
- função decrescente
- função definida por partes
- zero da função
- função par
- função ímpar

**Recorte previsto:** a função como relação entre grandezas, os três conjuntos, a leitura de gráfico e a função definida por partes.

**Falta:** o domínio de uma função dada por fórmula (o que zera denominador, o que deixa raiz negativa) é o item mais cobrado e precisa de lista própria.

#### 43. Função afim

*A que cresce sempre no mesmo ritmo*

Reta no gráfico, taxa constante, e o significado real de cada coeficiente.

`funcao-afim` · nível 8 · base · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** O que é uma função  
**Destrava:** A reta no plano, Função composta e inversa, Função exponencial, Função modular, Função quadrática, Sequências e PA

**O que a aula cobre:**

- função afim
- função linear
- função constante
- coeficiente angular
- coeficiente linear
- taxa de variação
- zero da função afim
- gráfico da reta
- estudo do sinal
- proporcionalidade e função linear

**Recorte previsto:** os dois coeficientes e o que cada um faz no gráfico, o zero, o estudo do sinal e a taxa de variação como leitura de problema.

**Falta:** a taxa de variação é o conceito que reaparece em derivada e em Física. Vale escrever a aula já apontando pra isso.

#### 54. Função exponencial

*Quando a variável sobe pro expoente*

Crescimento que multiplica em vez de somar, e por que ele sempre ganha do polinomial.

`funcao-exponencial` · nível 9 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Função afim, Potências  
**Destrava:** Equações e inequações exponenciais, Logaritmos, Progressão geométrica

**O que a aula cobre:**

- função exponencial
- base maior que um
- base entre zero e um
- crescimento exponencial
- decaimento exponencial
- gráfico da exponencial
- assíntota horizontal
- número e
- meia-vida

**Recorte previsto:** a diferença entre somar e multiplicar a cada passo, o gráfico nas duas bases, e as aplicações de crescimento e decaimento.

**Falta:** a comparação com o crescimento linear precisa de um exemplo numérico longo, senão o aluno não sente a diferença de escala.

#### 55. Função composta e inversa

*Encaixar uma função na outra, e desfazer*

Compor é aplicar em sequência, inverter é desfazer, e a inversa só existe sob uma condição.

`funcao-composta-e-inversa` · nível 9 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Função afim  
**Destrava:** Função logarítmica

**O que a aula cobre:**

- função composta
- domínio da composta
- função injetora
- função sobrejetora
- função bijetora
- função inversa
- gráfico da inversa
- simetria pela bissetriz

**Recorte previsto:** a composição e seu domínio, as três classificações, a inversa e a simetria dos gráficos.

**Falta:** a condição pra existir inversa é onde a aula trava. Falta um exemplo concreto de função que não tem inversa e do conserto pela restrição de domínio.

#### 56. Sequências e PA

*Quando cada termo soma a mesma coisa*

A progressão aritmética como função afim de domínio natural, com o termo geral e a soma deduzidos.

`sequencias-e-pa` · nível 9 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Função afim  
**Destrava:** Progressão geométrica

**O que a aula cobre:**

- sequência
- lei de recorrência
- termo geral
- progressão aritmética
- razão da PA
- soma dos termos da PA
- interpolação aritmética
- PA e função afim
- termo médio

**Recorte previsto:** a sequência e suas duas formas de definição, a PA, o termo geral, a soma pela história de Gauss, e a ligação com a função afim.

**Falta:** a soma da PA precisa sair do argumento de dobrar a sequência e somar aos pares, não de uma fórmula caída do céu.

#### 57. Função modular

*O gráfico que dobra no zero*

Módulo aplicado a função, com equações e inequações modulares.

`funcao-modular` · nível 9 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Função afim  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- módulo
- função modular
- gráfico da modular
- equação modular
- inequação modular
- função definida por partes
- distância na reta

**Recorte previsto:** o módulo como distância, a construção do gráfico dobrando o que está abaixo do eixo, e as equações e inequações com módulo.

**Falta:** a inequação modular tem dois casos e o aluno costuma resolver só um. Falta um método que force a escrever os dois.

#### 65. Função quadrática

*A parábola e tudo que ela esconde*

Concavidade, vértice, raízes e o problema de máximo e mínimo.

`funcao-quadratica` · nível 10 · base · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 11 tópicos

**Precisa de:** Função afim, Equação do 2º grau  
**Destrava:** Inequações e estudo do sinal, Transformações de gráfico

**O que a aula cobre:**

- função quadrática
- parábola
- concavidade
- vértice
- eixo de simetria
- raízes da parábola
- imagem da função quadrática
- valor máximo
- valor mínimo
- forma canônica
- problema de otimização

**Recorte previsto:** o efeito de cada coeficiente, o vértice por completamento de quadrado, o estudo do sinal e os problemas de máximo e mínimo.

**Falta:** o vértice costuma ser entregue como fórmula. Ele precisa sair do completamento de quadrado, que é a mesma conta da dedução de Bhaskara.

#### 66. Logaritmos

*A pergunta invertida da potência*

\"Dois elevado a quanto dá oito?\" O logaritmo é só o nome dessa pergunta.

`logaritmos` · nível 10 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 11 tópicos

**Precisa de:** Função exponencial  
**Destrava:** Função logarítmica

**O que a aula cobre:**

- logaritmo
- base do logaritmo
- logaritmando
- condição de existência
- logaritmo de produto
- logaritmo de quociente
- logaritmo de potência
- mudança de base
- logaritmo decimal
- logaritmo natural
- cologaritmo

**Recorte previsto:** a definição como expoente, as consequências imediatas, as propriedades operatórias deduzidas das potências, e a mudança de base.

**Falta:** as propriedades precisam ser deduzidas das propriedades das potências, senão viram cinco regras soltas.

#### 67. Equações e inequações exponenciais

*Igualar as bases e olhar os expoentes*

Quando as bases ficam iguais, os expoentes também ficam, e a inequação inverte quando a base é menor que um.

`equacoes-exponenciais` · nível 10 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Função exponencial  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- equação exponencial
- igualdade de bases
- mudança de variável
- inequação exponencial
- base entre zero e um
- inversão do sinal
- equação exponencial que vira do segundo grau

**Recorte previsto:** o método de igualar bases, a substituição que transforma em equação do segundo grau, e a inequação com o cuidado da base.

**Falta:** o caso em que as bases não se igualam por fatoração é o que exige logaritmo, e vale deixar isso explícito como ponte.

#### 68. Progressão geométrica

*Quando cada termo multiplica pela mesma coisa*

A PG como função exponencial de domínio natural, incluindo a soma infinita que converge.

`progressao-geometrica` · nível 10 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Sequências e PA, Função exponencial  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- progressão geométrica
- razão da PG
- termo geral da PG
- soma dos termos da PG
- soma infinita
- PG convergente
- PG e função exponencial
- dízima periódica como PG
- juros compostos como PG

**Recorte previsto:** o termo geral, a soma finita, a soma infinita quando a razão é menor que um, e as duas aplicações que fecham com aulas anteriores.

**Falta:** a soma infinita é o único lugar do ensino médio em que aparece um limite. Falta decidir quanto de rigor entra aí.

#### 73. Círculo trigonométrico

*Trigonometria além dos 90 graus*

Estender seno e cosseno pra qualquer ângulo, colocando o triângulo dentro de um círculo de raio 1.

`circulo-trigonometrico` · nível 11 · medio · **45 min de aula** e 23 min de leitura em casa (planejado pelos tópicos) · 12 tópicos

**Precisa de:** Trigonometria no triângulo retângulo, Plano cartesiano, Circunferência e círculo  
**Destrava:** Complexos na forma trigonométrica, Funções trigonométricas

**O que a aula cobre:**

- círculo trigonométrico
- radiano
- conversão grau e radiano
- arco
- quadrantes
- seno de qualquer ângulo
- cosseno de qualquer ângulo
- tangente no círculo
- redução ao primeiro quadrante
- arcos côngruos
- sinal por quadrante
- arcos notáveis

**Recorte previsto:** o radiano, a extensão de seno e cosseno pra qualquer arco, os sinais por quadrante, os arcos côngruos e a redução ao primeiro quadrante.

**Falta:** o radiano precisa ser apresentado como medida de comprimento de arco, senão vira só um fator de conversão decorado.

#### 74. Função logarítmica

*O espelho da exponencial*

Gráfico, domínio e a simetria com a exponencial em relação à bissetriz.

`funcao-logaritmica` · nível 11 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Logaritmos, Função composta e inversa  
**Destrava:** Equações e inequações logarítmicas

**O que a aula cobre:**

- função logarítmica
- gráfico do logaritmo
- domínio da logarítmica
- assíntota vertical
- simetria com a exponencial
- função crescente e decrescente
- escala logarítmica

**Recorte previsto:** o gráfico como reflexão do da exponencial, o domínio, e as escalas logarítmicas que aparecem em Física e Química.

**Falta:** a escala logarítmica (decibel, pH, Richter) é o que dá sentido prático à aula e costuma ficar de fora.

#### 75. Transformações de gráfico

*Uma função só, quatro botões*

Somar, multiplicar e trocar o sinal de x e de f(x) move, estica e vira o gráfico, e a regra é a mesma pra qualquer função.

`transformacoes-de-graficos` · nível 11 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 11 tópicos

**Precisa de:** Função quadrática  
**Destrava:** Funções trigonométricas

**O que a aula cobre:**

- translação vertical
- translação horizontal
- reflexão no eixo x
- reflexão no eixo y
- dilatação
- compressão
- f(x)+k
- f(x+k)
- a·f(x)
- f(ax)
- gráfico da função composta com reta

**Recorte previsto:** as quatro transformações básicas, o efeito de cada uma no gráfico, e por que a horizontal parece invertida.

**Falta:** esta aula é a que mais pede componente interativo, com os quatro parâmetros em slider. Ela consolida o que o aluno já viu na parábola e no módulo, e é pré-requisito direto da senoide. Falta decidir se ela é dada antes da exponencial, o que o grafo não obriga mas a aula agradece.

#### 76. Inequações e estudo do sinal

*Onde a função é positiva, e onde é negativa*

Inequação produto e quociente resolvidas pelo quadro de sinais.

`inequacoes-e-estudo-do-sinal` · nível 11 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Função quadrática, Inequações do 1º grau, Frações algébricas  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- estudo do sinal
- quadro de sinais
- inequação produto
- inequação quociente
- inequação do segundo grau
- sistema de inequações
- condição de existência

**Recorte previsto:** o quadro de sinais como método, a inequação produto e quociente, e o cuidado com o denominador.

**Falta:** multiplicar cruzado numa inequação fracionária é o erro que mais custa ponto, porque o sinal do denominador é desconhecido.

#### 81. Funções trigonométricas

*O que se repete para sempre*

Seno, cosseno e tangente como funções: período, amplitude e as transformações.

`funcoes-trigonometricas` · nível 12 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Círculo trigonométrico, Transformações de gráfico  
**Destrava:** Identidades e equações trigonométricas

**O que a aula cobre:**

- função seno
- função cosseno
- função tangente
- período
- amplitude
- imagem das trigonométricas
- gráfico da senoide
- fase
- função periódica
- transformações da senoide

**Recorte previsto:** o gráfico das três funções saindo do círculo, o período e a amplitude, e o efeito dos parâmetros na senoide.

**Falta:** a senoide com os quatro parâmetros é a mesma estrutura da equação da onda, e é o exemplo mais forte de reuso de componente do site.

#### 82. Equações e inequações logarítmicas

*Resolver sem esquecer o que existe*

A condição de existência decide quais das raízes encontradas realmente servem.

`equacoes-logaritmicas` · nível 12 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Função logarítmica  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- equação logarítmica
- condição de existência
- igualdade de logaritmos
- mudança de variável
- inequação logarítmica
- base entre zero e um
- raiz que não serve

**Recorte previsto:** a resolução por igualdade de logaritmos, a substituição, e a verificação obrigatória contra a condição de existência.

**Falta:** achar a raiz e não testar na condição de existência é o erro que define esta aula. A verificação precisa ser parte do método, não um lembrete no fim.

#### 84. Identidades e equações trigonométricas

*As contas que o círculo autoriza*

Relação fundamental, soma de arcos e arco duplo, e as equações que saem daí.

`identidades-trigonometricas` · nível 13 · medio · **45 min de aula** e 23 min de leitura em casa (planejado pelos tópicos) · 12 tópicos

**Precisa de:** Funções trigonométricas  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- relação fundamental
- secante
- cossecante
- cotangente
- identidade trigonométrica
- seno da soma
- cosseno da soma
- arco duplo
- arco metade
- transformação em produto
- equação trigonométrica
- inequação trigonométrica

**Recorte previsto:** a relação fundamental e as derivadas dela, as fórmulas de soma e arco duplo, e a resolução de equação trigonométrica no círculo.

**Falta:** a equação trigonométrica tem infinitas soluções e o aluno responde só uma. A resposta em forma geral, com k inteiro, precisa aparecer desde o primeiro exemplo.

### Geometria

25 aulas, 16h05.

#### 2. Ângulos

*Medir giro em vez de medir comprimento*

O que um ângulo mede, e as relações que aparecem quando retas se cruzam.

`angulos` · nível 0 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** nada, é porta de entrada  
**Destrava:** Triângulos

**O que a aula cobre:**

- ângulo
- medida em graus
- ângulos complementares
- ângulos suplementares
- ângulos opostos pelo vértice
- retas paralelas cortadas por transversal
- ângulos alternos internos
- ângulos correspondentes
- bissetriz

**Recorte previsto:** o ângulo como medida de giro, os pares de ângulos e as relações no feixe de paralelas.

**Falta:** o feixe de paralelas cortado por transversal é o que sustenta Tales e semelhança, e merece mais espaço que o resto da aula.

#### 3. Triângulos

*A figura de que todas as outras são feitas*

Classificação, condição de existência, congruência e os pontos notáveis.

`triangulos` · nível 1 · base · **55 min de aula** e 28 min de leitura em casa (planejado pelos tópicos) · 17 tópicos

**Precisa de:** Ângulos  
**Destrava:** Circunferência e círculo, Polígonos, Quadriláteros

**O que a aula cobre:**

- triângulo
- classificação por lados
- classificação por ângulos
- soma dos ângulos internos
- ângulo externo
- desigualdade triangular
- condição de existência do triângulo
- congruência de triângulos
- casos LAL ALA LLL
- mediana do triângulo
- altura
- bissetriz
- mediatriz
- baricentro
- incentro
- circuncentro
- ortocentro

**Recorte previsto:** a classificação, a soma dos ângulos com a demonstração pelas paralelas, a condição de existência, a congruência e os quatro pontos notáveis.

**Falta:** congruência é confundida com semelhança o tempo todo. Falta deixar explícito que congruente é semelhante com razão 1.

#### 6. Circunferência e círculo

*O lugar dos pontos que ficam à mesma distância*

Elementos, posições relativas e os ângulos que aparecem quando você desenha dentro dela.

`circunferencia` · nível 2 · base · **45 min de aula** e 23 min de leitura em casa (planejado pelos tópicos) · 12 tópicos

**Precisa de:** Triângulos  
**Destrava:** A circunferência no plano, Comprimento e área do círculo, Círculo trigonométrico

**O que a aula cobre:**

- circunferência
- círculo
- raio
- corda
- diâmetro
- arco
- posições relativas entre reta e circunferência
- reta tangente
- reta secante
- ângulo central
- ângulo inscrito
- quadrilátero inscritível

**Recorte previsto:** os elementos, as posições relativas, e o ângulo inscrito valendo metade do central.

**Falta:** o ângulo inscrito é o teorema mais útil da geometria plana e precisa da demonstração, que é curta.

#### 7. Plano cartesiano

*Duas retas numéricas, e todo ponto ganha endereço*

A ideia que casou álgebra com geometria: par ordenado, quadrantes e localização.

`plano-cartesiano` · nível 2 · base · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Conjuntos numéricos  
**Destrava:** O ponto no plano, Círculo trigonométrico, O que é uma função

**O que a aula cobre:**

- par ordenado
- eixo das abscissas
- eixo das ordenadas
- quadrantes
- localização de ponto
- produto cartesiano
- simetria em relação aos eixos
- simetria em relação à origem
- reflexão de figura
- translação de figura

**Recorte previsto:** o par ordenado, os quadrantes com os sinais, e as simetrias simples.

**Falta:** o produto cartesiano como conjunto de pares é o que liga esta aula com função, e costuma ser pulado.

#### 8. Polígonos

*Figuras fechadas por segmentos*

Classificação, diagonais, e a soma dos ângulos internos saindo de um corte em triângulos.

`poligonos` · nível 2 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Triângulos  
**Destrava:** Retas e planos no espaço, Teorema de Tales

**O que a aula cobre:**

- polígono
- polígono convexo
- número de diagonais
- soma dos ângulos internos
- soma dos ângulos externos
- polígono regular
- ângulo central
- ângulo interno do polígono regular
- apótema

**Recorte previsto:** a contagem de diagonais, a soma dos ângulos internos pela decomposição em triângulos, e o polígono regular.

**Falta:** a fórmula das diagonais precisa sair da contagem (cada vértice liga a n−3 outros, dividido por dois), não de memorização.

#### 9. Quadriláteros

*Quatro lados, e as propriedades que vêm com eles*

Paralelogramo, retângulo, losango, quadrado e trapézio, com as propriedades saindo da definição de cada um.

`quadrilateros` · nível 2 · base · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 11 tópicos

**Precisa de:** Triângulos  
**Destrava:** Áreas de polígonos

**O que a aula cobre:**

- quadrilátero
- paralelogramo
- retângulo
- losango
- quadrado
- trapézio
- trapézio isósceles
- propriedades das diagonais
- base média do triângulo
- base média do trapézio
- soma dos ângulos internos

**Recorte previsto:** a hierarquia entre os quadriláteros, as propriedades das diagonais de cada um, e as bases médias.

**Falta:** a hierarquia (todo quadrado é losango e retângulo) é o que decide as questões de verdadeiro ou falso, e costuma ser ensinada como lista solta em vez de encaixe.

#### 10. Retas e planos no espaço

*Sair do papel antes de calcular volume*

As posições relativas entre retas e planos, que é o vocabulário que a geometria espacial inteira usa.

`geometria-de-posicao` · nível 3 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 11 tópicos

**Precisa de:** Polígonos  
**Destrava:** Poliedros

**O que a aula cobre:**

- ponto reta e plano
- postulados
- retas paralelas
- retas concorrentes
- retas reversas
- reta e plano paralelos
- reta perpendicular ao plano
- planos paralelos
- planos perpendiculares
- projeção ortogonal
- distância entre ponto e plano

**Recorte previsto:** as posições relativas entre duas retas, entre reta e plano e entre dois planos, mais a projeção ortogonal.

**Falta:** retas reversas é o conceito que não existe no plano e por isso trava todo mundo. Precisa de figura em perspectiva, não de definição.

#### 16. Poliedros

*Contar face, aresta e vértice*

A relação de Euler e os cinco poliedros regulares, antes de entrar nas fórmulas de volume.

`poliedros` · nível 4 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Retas e planos no espaço  
**Destrava:** Prismas

**O que a aula cobre:**

- poliedro
- poliedro convexo
- face
- aresta
- vértice
- relação de Euler
- poliedros de Platão
- soma dos ângulos das faces
- planificação

**Recorte previsto:** a nomenclatura, a relação de Euler com verificação em vários sólidos, e os cinco poliedros regulares.

**Falta:** contar arestas pelas faces (cada aresta é dividida por duas faces) é o truque que resolve quase toda questão dessa aula.

#### 31. Teorema de Tales

*Feixe de paralelas corta proporcional*

Retas paralelas dividem transversais em segmentos proporcionais. É a base da semelhança.

`teorema-de-tales` · nível 6 · base · **25 min de aula** e 13 min de leitura em casa (planejado pelos tópicos) · 5 tópicos

**Precisa de:** Polígonos, Razão e proporção  
**Destrava:** Semelhança de triângulos

**O que a aula cobre:**

- teorema de Tales
- feixe de paralelas
- segmentos proporcionais
- teorema da bissetriz interna
- divisão de segmento

**Recorte previsto:** o teorema, a montagem correta da proporção, e o teorema da bissetriz interna como consequência.

**Falta:** montar a proporção errada (trocar a ordem dos segmentos) é o erro principal, e o método de escrever os dois lados na mesma ordem resolve.

#### 32. Áreas de polígonos

*As fórmulas deduzidas umas das outras*

Toda fórmula de área sai do retângulo, e nenhuma precisa ser decorada isolada.

`areas-de-poligonos` · nível 7 · base · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Quadriláteros, Unidades de medida  
**Destrava:** Comprimento e área do círculo, Prismas

**O que a aula cobre:**

- área do retângulo
- área do quadrado
- área do paralelogramo
- área do triângulo
- área do trapézio
- área do losango
- área do polígono regular
- apótema
- fórmula de Heron
- área por decomposição

**Recorte previsto:** a área do retângulo como definição, e cada fórmula seguinte deduzida por recorte e colagem a partir dela.

**Falta:** a área do triângulo por decomposição do paralelogramo é o passo que faz todas as outras funcionarem, e ela precisa de figura.

#### 33. Semelhança de triângulos

*Mesma forma, tamanho diferente*

Os casos de semelhança e a razão de semelhança, que é o que faz medir a altura de um prédio pela sombra.

`semelhanca-de-triangulos` · nível 7 · base · **45 min de aula** e 23 min de leitura em casa (planejado pelos tópicos) · 12 tópicos

**Precisa de:** Teorema de Tales  
**Destrava:** Teorema de Pitágoras

**O que a aula cobre:**

- figuras semelhantes
- razão de semelhança
- caso AA
- caso LAL
- caso LLL
- razão entre perímetros
- razão entre áreas
- razão entre volumes
- aplicação da sombra
- relações métricas na circunferência
- potência de ponto
- cordas que se cruzam

**Recorte previsto:** os casos de semelhança, a razão entre perímetros, áreas e volumes, e as aplicações de medida indireta.

**Falta:** a razão entre áreas ser o quadrado da razão de semelhança é cobrada direto e quase nunca é ensinada com demonstração.

#### 46. Prismas

*A área e o volume que saem da planificação*

Cubo, paralelepípedo e prisma qualquer, com área total pela planificação e volume como base vezes altura.

`prismas` · nível 8 · medio · **50 min de aula** e 25 min de leitura em casa (planejado pelos tópicos) · 13 tópicos

**Precisa de:** Poliedros, Áreas de polígonos  
**Destrava:** Cilindro e cone, Pirâmides

**O que a aula cobre:**

- prisma
- prisma reto
- prisma oblíquo
- cubo
- paralelepípedo
- área lateral
- área total
- volume do prisma
- diagonal do paralelepípedo
- diagonal do cubo
- secção transversal
- planificação
- princípio de Cavalieri

**Recorte previsto:** a área total pela planificação, o volume como base vezes altura, e as diagonais do cubo e do paralelepípedo.

**Falta:** a diagonal do paralelepípedo é Pitágoras aplicado duas vezes e fica muito melhor com a figura do que com a fórmula.

#### 47. Teorema de Pitágoras

*A relação mais usada da matemática inteira*

Um fato sobre áreas antes de ser uma fórmula, e dá pra ver acontecendo.

`teorema-de-pitagoras` · nível 8 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Semelhança de triângulos, Radiciação  
**Destrava:** O ponto no plano, Relações métricas no triângulo retângulo

**O que a aula cobre:**

- teorema de Pitágoras
- hipotenusa
- cateto
- demonstração por áreas
- terno pitagórico
- diagonal do quadrado
- altura do triângulo equilátero
- recíproca do teorema

**Recorte previsto:** o enunciado, a demonstração visual por áreas, os ternos pitagóricos e os dois casos particulares que aparecem em toda prova.

**Falta:** a demonstração visual pede componente animado, que é o tipo de coisa que fica pra sempre na cabeça do aluno.

#### 48. Comprimento e área do círculo

*De onde sai o pi*

Comprimento e área do círculo, mais as partes dele que a prova cobra: setor, coroa e segmento.

`circulo-comprimento-e-area` · nível 8 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Circunferência e círculo, Áreas de polígonos  
**Destrava:** Cilindro e cone

**O que a aula cobre:**

- número pi
- comprimento da circunferência
- área do círculo
- setor circular
- coroa circular
- segmento circular
- comprimento de arco
- área do setor

**Recorte previsto:** o pi como razão entre comprimento e diâmetro, as duas fórmulas, e as partes do círculo calculadas por proporção com o total.

**Falta:** setor e arco saem de regra de três com o ângulo, e o aluno decora duas fórmulas em vez de fazer a proporção. Vale ensinar só a proporção.

#### 58. O ponto no plano

*Distância e posição viram conta*

Distância entre dois pontos, ponto médio e alinhamento, com Pitágoras trabalhando por baixo.

`analitica-ponto` · nível 9 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Plano cartesiano, Teorema de Pitágoras  
**Destrava:** A reta no plano

**O que a aula cobre:**

- distância entre dois pontos
- ponto médio
- baricentro do triângulo
- alinhamento de três pontos
- condição de alinhamento
- área do triângulo por determinante
- simetria de ponto

**Recorte previsto:** a distância como Pitágoras aplicado, o ponto médio, a condição de alinhamento por determinante e a área do triângulo.

**Falta:** a fórmula da distância precisa aparecer com o triângulo retângulo desenhado por baixo, senão vira mais uma fórmula pra decorar.

#### 59. Cilindro e cone

*O prisma e a pirâmide com base redonda*

As mesmas ideias dos sólidos de face plana, agora com o círculo na base.

`cilindro-e-cone` · nível 9 · medio · **50 min de aula** e 25 min de leitura em casa (planejado pelos tópicos) · 13 tópicos

**Precisa de:** Prismas, Comprimento e área do círculo  
**Destrava:** Esfera

**O que a aula cobre:**

- cilindro
- cilindro equilátero
- secção meridiana
- área lateral do cilindro
- volume do cilindro
- cone
- geratriz
- cone equilátero
- área lateral do cone
- volume do cone
- tronco de cone
- planificação do cone
- sólido de revolução

**Recorte previsto:** os dois sólidos como versões redondas do prisma e da pirâmide, a planificação do cone virando setor circular, e os troncos.

**Falta:** a área lateral do cone é um setor circular, e essa é a única forma de a fórmula fazer sentido. A planificação precisa ser mostrada.

#### 60. Pirâmides

*Um terço do prisma, e o porquê disso*

Área e volume da pirâmide, mais o tronco, com o apótema fazendo o trabalho pesado.

`piramides` · nível 9 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Prismas  
**Destrava:** Sólidos inscritos e circunscritos

**O que a aula cobre:**

- pirâmide
- apótema da base
- apótema da pirâmide
- aresta lateral
- área lateral da pirâmide
- área total
- volume da pirâmide
- tronco de pirâmide
- tetraedro regular
- secção paralela à base

**Recorte previsto:** os elementos e onde cada triângulo retângulo se esconde, a área lateral, o volume com o fator um terço, e o tronco.

**Falta:** o fator um terço não tem demonstração acessível no ensino médio. Falta decidir entre a justificativa por três pirâmides que montam um prisma e uma verificação experimental.

#### 61. Relações métricas no triângulo retângulo

*Tudo que a altura revela*

Traçar a altura cria três triângulos semelhantes, e daí saem todas as relações de uma vez.

`relacoes-metricas-triangulo-retangulo` · nível 9 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Teorema de Pitágoras  
**Destrava:** Trigonometria no triângulo retângulo

**O que a aula cobre:**

- relações métricas
- projeção dos catetos
- altura relativa à hipotenusa
- a·h = b·c
- h² = m·n
- b² = a·m
- semelhança dos três triângulos

**Recorte previsto:** a decomposição pela altura, as três semelhanças e cada relação métrica saindo de uma delas.

**Falta:** decorar as quatro relações é inútil se o aluno não sabe redesenhar os três triângulos separados. O desenho é a aula.

#### 62. Trigonometria no triângulo retângulo

*Ângulo virando razão entre lados*

Seno, cosseno e tangente como razões que só dependem do ângulo, e por que isso é verdade.

`trigonometria-triangulo-retangulo` · nível 10 · base · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Relações métricas no triângulo retângulo  
**Destrava:** Círculo trigonométrico, Lei dos senos e dos cossenos

**O que a aula cobre:**

- seno
- cosseno
- tangente
- cateto oposto
- cateto adjacente
- ângulos notáveis
- 30 45 60 graus
- resolução de triângulo retângulo
- ângulo de elevação
- ângulo de depressão

**Recorte previsto:** as três razões, por que elas só dependem do ângulo (que é semelhança), a tabela dos notáveis deduzida, e os problemas de medida indireta.

**Falta:** o 'só depende do ângulo' é a ideia central e vem direto de semelhança. Precisa ser explicitado, não assumido.

#### 63. A reta no plano

*Toda reta cabe numa equação*

Coeficiente angular, as três formas de escrever a equação, e as posições entre duas retas.

`analitica-reta` · nível 10 · medio · **50 min de aula** e 25 min de leitura em casa (planejado pelos tópicos) · 13 tópicos

**Precisa de:** O ponto no plano, Função afim  
**Destrava:** A circunferência no plano

**O que a aula cobre:**

- coeficiente angular
- declividade
- equação fundamental da reta
- equação reduzida
- equação geral
- equação segmentária
- retas paralelas
- retas perpendiculares
- ângulo entre retas
- distância de ponto a reta
- posição relativa entre retas
- interseção de retas
- mediatriz

**Recorte previsto:** o coeficiente angular como tangente do ângulo, as formas da equação, as condições de paralelismo e perpendicularismo, e a distância de ponto a reta.

**Falta:** a distância de ponto a reta é uma fórmula feia que ninguém deduz em aula. Falta decidir se ela entra com dedução ou com uma justificativa geométrica curta.

#### 64. Esfera

*O sólido sem planificação*

Área e volume da esfera, mais as partes dela que aparecem em prova.

`esfera` · nível 10 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Cilindro e cone  
**Destrava:** Sólidos inscritos e circunscritos

**O que a aula cobre:**

- esfera
- superfície esférica
- volume da esfera
- área da superfície esférica
- secção da esfera
- calota esférica
- fuso esférico
- cunha esférica
- distância do centro à secção

**Recorte previsto:** as duas fórmulas, a secção como círculo cujo raio sai de Pitágoras, e as partes da esfera calculadas por proporção.

**Falta:** a secção da esfera é onde aparece o triângulo retângulo com raio da esfera, raio da secção e distância do centro. É o desenho mais útil da aula.

#### 77. A circunferência no plano

*Centro e raio escondidos numa equação*

Equação reduzida e geral, e as posições entre reta e circunferência resolvidas na conta.

`analitica-circunferencia` · nível 11 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** A reta no plano, Circunferência e círculo  
**Destrava:** Cônicas

**O que a aula cobre:**

- equação reduzida da circunferência
- equação geral da circunferência
- centro e raio
- completar quadrado
- posição de um ponto
- posição de uma reta
- reta tangente à circunferência
- posição entre duas circunferências
- interseção

**Recorte previsto:** a equação saindo da definição de distância, a passagem da geral pra reduzida por completamento de quadrado, e as posições relativas decididas por distância.

**Falta:** a posição de reta e circunferência dá pra resolver por sistema ou por distância do centro à reta. As duas precisam aparecer, porque a segunda é muito mais rápida.

#### 78. Lei dos senos e dos cossenos

*Trigonometria em triângulo qualquer*

Sair do triângulo retângulo, e ver Pitágoras aparecer como caso particular.

`lei-dos-senos-e-cossenos` · nível 11 · medio · **25 min de aula** e 13 min de leitura em casa (planejado pelos tópicos) · 6 tópicos

**Precisa de:** Trigonometria no triângulo retângulo  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- lei dos senos
- lei dos cossenos
- área do triângulo com seno
- resolução de triângulo qualquer
- raio da circunferência circunscrita
- Pitágoras como caso particular

**Recorte previsto:** as duas leis com demonstração, a área pelo seno, e o critério de qual lei usar em cada situação.

**Falta:** a lei dos cossenos virando Pitágoras quando o ângulo é reto é a melhor forma de o aluno confiar na fórmula.

#### 79. Sólidos inscritos e circunscritos

*Um sólido dentro do outro*

Quando um sólido está encaixado no outro, a conta toda sai de achar a relação certa entre as medidas.

`solidos-inscritos-e-circunscritos` · nível 11 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Esfera, Pirâmides  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- esfera inscrita
- esfera circunscrita
- cubo e esfera
- cilindro e esfera
- cone e esfera
- prisma inscrito
- razão entre volumes
- secção que resolve

**Recorte previsto:** os encaixes clássicos e o método geral: cortar o sólido por um plano que contenha o centro e resolver no plano.

**Falta:** esta aula é quase toda 'ache a secção certa'. Vale montá-la como coleção de casos, com o desenho da secção em cada um.

#### 80. Cônicas

*O que aparece quando você corta um cone*

Elipse, hipérbole e parábola definidas por distância, com as equações saindo dessa definição.

`conicas` · nível 12 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 11 tópicos

**Precisa de:** A circunferência no plano  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- elipse
- hipérbole
- parábola
- foco
- diretriz
- excentricidade
- eixo maior
- eixo menor
- assíntotas da hipérbole
- equação reduzida das cônicas
- seções cônicas

**Recorte previsto:** as três cônicas como lugares geométricos, os elementos de cada uma e as equações reduzidas.

**Falta:** cônicas cai pouco na FUVEST e mais na UNICAMP e no ITA. Falta decidir a profundidade, e se a definição por seção de cone entra ou só a por distância.

### Dados e contagem

9 aulas, 5h25.

#### 13. Princípio multiplicativo

*Contar sem listar*

Se uma escolha tem m saídas e a seguinte tem n, o par tem m vezes n. Toda a contagem sai daí.

`principio-multiplicativo` · nível 3 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** O que cada operação faz  
**Destrava:** Arranjos e permutações

**O que a aula cobre:**

- princípio fundamental da contagem
- princípio multiplicativo
- princípio aditivo
- diagrama de árvore
- contagem com restrição
- contagem de senhas
- contagem de placas
- casos que se excluem

**Recorte previsto:** o princípio multiplicativo com a árvore desenhada, o princípio aditivo, e os problemas com restrição, que são resolvidos começando pela posição mais restrita.

**Falta:** começar pela escolha mais restrita é o método que resolve quase tudo, e ele quase nunca é ensinado como método.

#### 14. Arranjos e permutações

*Quando a ordem muda o resultado*

Permutação e arranjo são o princípio multiplicativo com nome, para quando a ordem importa.

`arranjos-e-permutacoes` · nível 4 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Princípio multiplicativo  
**Destrava:** Combinações

**O que a aula cobre:**

- fatorial
- permutação simples
- arranjo simples
- permutação com repetição
- permutação circular
- anagrama
- elementos juntos
- elementos separados

**Recorte previsto:** o fatorial, a permutação como caso do princípio multiplicativo, o arranjo, e os casos de repetição e de círculo.

**Falta:** anagrama com letra repetida é a questão mais cobrada da aula, e a divisão pelo fatorial das repetições precisa de justificativa, não de fórmula.

#### 22. Combinações

*Quando a ordem não muda nada*

Escolher três pessoas de dez não depende da ordem, e é dividir o arranjo pelas ordens repetidas.

`combinacoes` · nível 5 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Arranjos e permutações, Esticamento  
**Destrava:** Binômio de Newton, Probabilidade

**O que a aula cobre:**

- combinação simples
- número binomial
- escolha sem ordem
- arranjo dividido pelo fatorial
- quando usar combinação
- combinação com repetição
- problemas de comissão
- problemas de baralho

**Recorte previsto:** a combinação deduzida do arranjo, o critério de decidir entre arranjo e combinação, e os problemas clássicos.

**Falta:** o critério de decisão (a troca de ordem gera um caso novo ou o mesmo?) é a única coisa que o aluno precisa levar da aula.

#### 23. Leitura de gráficos e tabelas

*Onde a estatística engana*

Ler barras, linhas e setores, e reconhecer o gráfico que mente sem falar mentira.

`leitura-de-graficos-e-tabelas` · nível 6 · base · **45 min de aula** e 23 min de leitura em casa (planejado pelos tópicos) · 12 tópicos

**Precisa de:** Porcentagem  
**Destrava:** Média, moda e mediana

**O que a aula cobre:**

- gráfico de barras
- gráfico de linhas
- gráfico de setores
- histograma
- frequência absoluta
- frequência relativa
- frequência acumulada
- população e amostra
- variável qualitativa
- variável quantitativa
- eixo truncado
- gráfico enganoso

**Recorte previsto:** os tipos de gráfico e quando cada um serve, a tabela de frequências, e os truques visuais que distorcem a leitura.

**Falta:** o eixo truncado e a escala não linear são os dois enganos mais comuns em jornal, e valem exemplo real (montado por mim, não copiado).

#### 24. Probabilidade

*Contar os casos que interessam e dividir pelo total*

Probabilidade é contagem virada fração, e a contagem é a parte difícil.

`probabilidade` · nível 6 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Combinações  
**Destrava:** Probabilidade condicional

**O que a aula cobre:**

- espaço amostral
- evento
- probabilidade clássica
- evento complementar
- união de eventos
- probabilidade da soma
- eventos mutuamente exclusivos
- pelo menos um
- probabilidade geométrica

**Recorte previsto:** o espaço amostral, a definição clássica, o complementar como atalho e a probabilidade da união.

**Falta:** o 'pelo menos um' quase sempre se resolve pelo complementar, e isso precisa virar reflexo.

#### 39. Média, moda e mediana

*Três jeitos de resumir um monte de números num só*

Cada uma responde uma pergunta diferente, e escolher errado distorce a conclusão.

`medidas-de-tendencia-central` · nível 7 · base · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 8 tópicos

**Precisa de:** Leitura de gráficos e tabelas  
**Destrava:** Dispersão

**O que a aula cobre:**

- média aritmética
- média ponderada
- moda
- mediana
- dados agrupados
- efeito do valor extremo
- qual medida usar
- média de médias

**Recorte previsto:** as três medidas, o cálculo com dados agrupados, e o critério de escolha em função da distribuição.

**Falta:** média de médias não é média do total, e esse é um erro que aparece direto em questão de nota escolar.

#### 40. Probabilidade condicional

*O que muda quando você já sabe de alguma coisa*

Saber que um evento aconteceu encolhe o espaço amostral, e é só isso que a fórmula diz.

`probabilidade-condicional` · nível 7 · medio · **35 min de aula** e 18 min de leitura em casa (planejado pelos tópicos) · 9 tópicos

**Precisa de:** Probabilidade  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- probabilidade condicional
- espaço amostral reduzido
- eventos independentes
- probabilidade do produto
- árvore de probabilidade
- com reposição
- sem reposição
- distribuição binomial
- teorema de Bayes

**Recorte previsto:** a condicional como redução do espaço amostral, a independência, a árvore, e os experimentos com e sem reposição.

**Falta:** independente e mutuamente exclusivo são confundidos o tempo todo, e são quase opostos. Precisa de um contraste explícito.

#### 41. Binômio de Newton

*Produtos notáveis levados ao extremo*

Elevar um binômio a qualquer potência, e descobrir que os coeficientes são combinações.

`binomio-de-newton` · nível 8 · medio · **30 min de aula** e 15 min de leitura em casa (planejado pelos tópicos) · 7 tópicos

**Precisa de:** Combinações, Produtos notáveis  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- binômio de Newton
- triângulo de Pascal
- coeficiente binomial
- termo geral do binômio
- termo independente
- soma dos coeficientes
- relação de Stifel

**Recorte previsto:** o triângulo de Pascal, o coeficiente binomial como combinação, o termo geral e o termo independente.

**Falta:** por que o coeficiente é uma combinação (escolher de quais parênteses sai o a) é a parte bonita e costuma ser omitida.

#### 42. Dispersão

*A média não conta a história toda*

Dois conjuntos com a mesma média podem ser completamente diferentes, e variância e desvio padrão medem isso.

`medidas-de-dispersao` · nível 8 · medio · **40 min de aula** e 20 min de leitura em casa (planejado pelos tópicos) · 10 tópicos

**Precisa de:** Média, moda e mediana, Radiciação  
**Destrava:** ninguém, é fim de linha

**O que a aula cobre:**

- amplitude
- desvio
- variância
- desvio padrão
- quartil
- mediana
- box-plot
- outlier
- comparação de conjuntos
- coeficiente de variação

**Recorte previsto:** por que a média sozinha não basta, a construção da variância passo a passo, o desvio padrão e a leitura de box-plot.

**Falta:** a variância eleva ao quadrado pra não deixar desvio positivo cancelar negativo. Sem isso explicado, a fórmula parece arbitrária.

## Índice remissivo

Todo tópico de toda aula, em ordem alfabética. É o mesmo conteúdo da página `/indice` do site.


**0**

- 0,999... é igual a 1 → Números reais (#36)

**3**

- 30 45 60 graus → Trigonometria no triângulo retângulo (#62)

**A**

- a·f(x) → Transformações de gráfico (#75)
- a·h = b·c → Relações métricas no triângulo retângulo (#61)
- adição de matrizes → Matrizes (#45)
- adição de polinômios → Monômios e polinômios (#30)
- agrupamento → Fatoração (#44)
- algarismos significativos → Notação científica (#28)
- alinhamento de três pontos → O ponto no plano (#58)
- altura → Triângulos (#3)
- altura do triângulo equilátero → Teorema de Pitágoras (#47)
- altura relativa à hipotenusa → Relações métricas no triângulo retângulo (#61)
- amplitude → Funções trigonométricas (#81)
- amplitude → Dispersão (#42)
- anagrama → Arranjos e permutações (#14)
- ângulo → Ângulos (#2)
- ângulo central → Circunferência e círculo (#6)
- ângulo central → Polígonos (#8)
- ângulo de depressão → Trigonometria no triângulo retângulo (#62)
- ângulo de elevação → Trigonometria no triângulo retângulo (#62)
- ângulo entre retas → A reta no plano (#63)
- ângulo externo → Triângulos (#3)
- ângulo inscrito → Circunferência e círculo (#6)
- ângulo interno do polígono regular → Polígonos (#8)
- ângulos alternos internos → Ângulos (#2)
- ângulos complementares → Ângulos (#2)
- ângulos correspondentes → Ângulos (#2)
- ângulos notáveis → Trigonometria no triângulo retângulo (#62)
- ângulos opostos pelo vértice → Ângulos (#2)
- ângulos suplementares → Ângulos (#2)
- aplicação da sombra → Semelhança de triângulos (#33)
- apótema → Áreas de polígonos (#32)
- apótema → Polígonos (#8)
- apótema da base → Pirâmides (#60)
- apótema da pirâmide → Pirâmides (#60)
- aproximação → Números reais (#36)
- arco → Círculo trigonométrico (#73)
- arco → Circunferência e círculo (#6)
- arco duplo → Identidades e equações trigonométricas (#84)
- arco metade → Identidades e equações trigonométricas (#84)
- arcos côngruos → Círculo trigonométrico (#73)
- arcos notáveis → Círculo trigonométrico (#73)
- área da superfície esférica → Esfera (#64)
- área do círculo → Comprimento e área do círculo (#48)
- área do losango → Áreas de polígonos (#32)
- área do paralelogramo → Áreas de polígonos (#32)
- área do polígono regular → Áreas de polígonos (#32)
- área do quadrado → Áreas de polígonos (#32)
- área do retângulo → Áreas de polígonos (#32)
- área do setor → Comprimento e área do círculo (#48)
- área do trapézio → Áreas de polígonos (#32)
- área do triângulo → Áreas de polígonos (#32)
- área do triângulo com seno → Lei dos senos e dos cossenos (#78)
- área do triângulo por determinante → O ponto no plano (#58)
- área lateral → Prismas (#46)
- área lateral da pirâmide → Pirâmides (#60)
- área lateral do cilindro → Cilindro e cone (#59)
- área lateral do cone → Cilindro e cone (#59)
- área por decomposição → Áreas de polígonos (#32)
- área total → Pirâmides (#60)
- área total → Prismas (#46)
- aresta → Poliedros (#16)
- aresta lateral → Pirâmides (#60)
- argumento → Complexos na forma trigonométrica (#83)
- arranjo dividido pelo fatorial → Combinações (#22)
- arranjo simples → Arranjos e permutações (#14)
- arredondamento → Notação científica (#28)
- arredondamento → Números reais (#36)
- árvore de probabilidade → Probabilidade condicional (#40)
- assíntota horizontal → Função exponencial (#54)
- assíntota vertical → Função logarítmica (#74)
- assíntotas da hipérbole → Cônicas (#80)
- associatividade → Junção (#12)
- aumento seguido de desconto → Aumentos e descontos (#27)
- aumentos sucessivos → Aumentos e descontos (#27)

**B**

- b² = a·m → Relações métricas no triângulo retângulo (#61)
- baricentro → Triângulos (#3)
- baricentro do triângulo → O ponto no plano (#58)
- base do logaritmo → Logaritmos (#66)
- base entre zero e um → Equações e inequações exponenciais (#67)
- base entre zero e um → Equações e inequações logarítmicas (#82)
- base entre zero e um → Função exponencial (#54)
- base maior que um → Função exponencial (#54)
- base média do trapézio → Quadriláteros (#9)
- base média do triângulo → Quadriláteros (#9)
- binômio de Newton → Binômio de Newton (#41)
- bissetriz → Ângulos (#2)
- bissetriz → Triângulos (#3)
- box-plot → Dispersão (#42)

**C**

- calcular porcentagem de um valor → Porcentagem (#18)
- calota esférica → Esfera (#64)
- cancelamento → Esticamento (#15)
- capacidade e litro → Unidades de medida (#26)
- capital → Juros simples e compostos (#37)
- caso AA → Semelhança de triângulos (#33)
- caso LAL → Semelhança de triângulos (#33)
- caso LLL → Semelhança de triângulos (#33)
- casos LAL ALA LLL → Triângulos (#3)
- casos que se excluem → Princípio multiplicativo (#13)
- cateto → Teorema de Pitágoras (#47)
- cateto adjacente → Trigonometria no triângulo retângulo (#62)
- cateto oposto → Trigonometria no triângulo retângulo (#62)
- centro e raio → A circunferência no plano (#77)
- cilindro → Cilindro e cone (#59)
- cilindro e esfera → Sólidos inscritos e circunscritos (#79)
- cilindro equilátero → Cilindro e cone (#59)
- círculo → Circunferência e círculo (#6)
- círculo trigonométrico → Círculo trigonométrico (#73)
- circuncentro → Triângulos (#3)
- circunferência → Circunferência e círculo (#6)
- classificação por ângulos → Triângulos (#3)
- classificação por lados → Triângulos (#3)
- coeficiente → Linguagem algébrica (#21)
- coeficiente angular → A reta no plano (#63)
- coeficiente angular → Função afim (#43)
- coeficiente binomial → Binômio de Newton (#41)
- coeficiente de variação → Dispersão (#42)
- coeficiente linear → Função afim (#43)
- cofator → Determinantes (#51)
- cologaritmo → Logaritmos (#66)
- com reposição → Probabilidade condicional (#40)
- combinação com repetição → Combinações (#22)
- combinação simples → Combinações (#22)
- comparação de conjuntos → Dispersão (#42)
- comparação de frações → Frações (#11)
- comparação de números → A reta numérica (#1)
- complementar → Conjuntos e intervalos (#49)
- completar quadrado → A circunferência no plano (#77)
- completar quadrado → Equação do 2º grau (#50)
- compressão → Transformações de gráfico (#75)
- comprimento da circunferência → Comprimento e área do círculo (#48)
- comprimento de arco → Comprimento e área do círculo (#48)
- comutatividade → Junção (#12)
- concavidade → Função quadrática (#65)
- condição de alinhamento → O ponto no plano (#58)
- condição de existência → Equações e inequações logarítmicas (#82)
- condição de existência → Frações algébricas (#52)
- condição de existência → Inequações e estudo do sinal (#76)
- condição de existência → Logaritmos (#66)
- condição de existência do triângulo → Triângulos (#3)
- cone → Cilindro e cone (#59)
- cone e esfera → Sólidos inscritos e circunscritos (#79)
- cone equilátero → Cilindro e cone (#59)
- congruência de triângulos → Triângulos (#3)
- conjugado → Números complexos (#69)
- conjunto dos reais → Números reais (#36)
- conjunto solução → Inequações do 1º grau (#53)
- conjunto vazio → Conjuntos numéricos (#4)
- contagem com restrição → Princípio multiplicativo (#13)
- contagem de placas → Princípio multiplicativo (#13)
- contagem de senhas → Princípio multiplicativo (#13)
- contradomínio → O que é uma função (#38)
- conversão de unidades → Unidades de medida (#26)
- conversão grau e radiano → Círculo trigonométrico (#73)
- corda → Circunferência e círculo (#6)
- cordas que se cruzam → Semelhança de triângulos (#33)
- coroa circular → Comprimento e área do círculo (#48)
- cossecante → Identidades e equações trigonométricas (#84)
- cosseno → Trigonometria no triângulo retângulo (#62)
- cosseno da soma → Identidades e equações trigonométricas (#84)
- cosseno de qualquer ângulo → Círculo trigonométrico (#73)
- cotangente → Identidades e equações trigonométricas (#84)
- crescimento exponencial → Função exponencial (#54)
- critérios de divisibilidade → Frações (#11)
- crivo de Eratóstenes → Primos e fatoração (#20)
- cubo → Prismas (#46)
- cubo da diferença → Produtos notáveis (#34)
- cubo da soma → Produtos notáveis (#34)
- cubo e esfera → Sólidos inscritos e circunscritos (#79)
- cunha esférica → Esfera (#64)

**D**

- dados agrupados → Média, moda e mediana (#39)
- decaimento exponencial → Função exponencial (#54)
- decimal exato → Números reais (#36)
- declividade → A reta no plano (#63)
- decomposição em fatores → Equações polinomiais (#72)
- delta → Equação do 2º grau (#50)
- demonstração por áreas → Teorema de Pitágoras (#47)
- densidade → Razão e proporção (#19)
- densidade dos números → A reta numérica (#1)
- desconto → Juros simples e compostos (#37)
- desconto equivalente → Aumentos e descontos (#27)
- descontos sucessivos → Aumentos e descontos (#27)
- desigualdade → Inequações do 1º grau (#53)
- desigualdade triangular → Triângulos (#3)
- desvio → Dispersão (#42)
- desvio padrão → Dispersão (#42)
- determinante de ordem 2 → Determinantes (#51)
- determinante de ordem 3 → Determinantes (#51)
- determinante e área → Determinantes (#51)
- diagonal do cubo → Prismas (#46)
- diagonal do paralelepípedo → Prismas (#46)
- diagonal do quadrado → Teorema de Pitágoras (#47)
- diagrama de árvore → Princípio multiplicativo (#13)
- diagrama de Venn → Conjuntos e intervalos (#49)
- diâmetro → Circunferência e círculo (#6)
- diferença de conjuntos → Conjuntos e intervalos (#49)
- diferença de cubos → Fatoração (#44)
- diferença de quadrados → Fatoração (#44)
- diferença de quadrados → Produtos notáveis (#34)
- dilatação → Transformações de gráfico (#75)
- diretriz → Cônicas (#80)
- discriminante → Equação do 2º grau (#50)
- discussão de sistema → Sistemas lineares (#71)
- dispositivo de Briot-Ruffini → Polinômios (#70)
- distância de ponto a reta → A reta no plano (#63)
- distância do centro à secção → Esfera (#64)
- distância entre dois pontos → O ponto no plano (#58)
- distância entre ponto e plano → Retas e planos no espaço (#10)
- distância na reta → Função modular (#57)
- distribuição binomial → Probabilidade condicional (#40)
- distributiva → Monômios e polinômios (#30)
- divisão como multiplicação → Esticamento (#15)
- divisão de frações → Frações (#11)
- divisão de polinômios → Polinômios (#70)
- divisão de segmento → Teorema de Tales (#31)
- divisão em partes proporcionais → Razão e proporção (#19)
- divisão na forma polar → Complexos na forma trigonométrica (#83)
- divisão por monômio → Monômios e polinômios (#30)
- divisão por zero → O que cada operação faz (#5)
- dízima periódica → Números reais (#36)
- dízima periódica como PG → Progressão geométrica (#68)
- domínio → O que é uma função (#38)
- domínio da composta → Função composta e inversa (#55)
- domínio da logarítmica → Função logarítmica (#74)

**E**

- efeito do valor extremo → Média, moda e mediana (#39)
- eixo das abscissas → Plano cartesiano (#7)
- eixo das ordenadas → Plano cartesiano (#7)
- eixo de simetria → Função quadrática (#65)
- eixo maior → Cônicas (#80)
- eixo menor → Cônicas (#80)
- eixo truncado → Leitura de gráficos e tabelas (#23)
- elemento de um conjunto → Conjuntos numéricos (#4)
- elemento neutro → Esticamento (#15)
- elementos juntos → Arranjos e permutações (#14)
- elementos separados → Arranjos e permutações (#14)
- elipse → Cônicas (#80)
- equação → Equação do 1º grau (#29)
- equação biquadrada → Equação do 2º grau (#50)
- equação do segundo grau → Equação do 2º grau (#50)
- equação exponencial → Equações e inequações exponenciais (#67)
- equação exponencial que vira do segundo grau → Equações e inequações exponenciais (#67)
- equação fracionária → Equação do 1º grau (#29)
- equação fracionária → Frações algébricas (#52)
- equação fundamental da reta → A reta no plano (#63)
- equação geral → A reta no plano (#63)
- equação geral da circunferência → A circunferência no plano (#77)
- equação incompleta → Equação do 2º grau (#50)
- equação irracional → Equação do 2º grau (#50)
- equação literal → Equação do 1º grau (#29)
- equação logarítmica → Equações e inequações logarítmicas (#82)
- equação modular → Função modular (#57)
- equação polinomial → Equações polinomiais (#72)
- equação reduzida → A reta no plano (#63)
- equação reduzida da circunferência → A circunferência no plano (#77)
- equação reduzida das cônicas → Cônicas (#80)
- equação segmentária → A reta no plano (#63)
- equação trigonométrica → Identidades e equações trigonométricas (#84)
- escala → A reta numérica (#1)
- escala de mapa → Razão e proporção (#19)
- escala logarítmica → Função logarítmica (#74)
- escalonamento → Sistemas lineares (#71)
- escolha sem ordem → Combinações (#22)
- esfera → Esfera (#64)
- esfera circunscrita → Sólidos inscritos e circunscritos (#79)
- esfera inscrita → Sólidos inscritos e circunscritos (#79)
- espaço amostral → Probabilidade (#24)
- espaço amostral reduzido → Probabilidade condicional (#40)
- está contido e contém → Conjuntos numéricos (#4)
- estudo do sinal → Função afim (#43)
- estudo do sinal → Inequações e estudo do sinal (#76)
- evento → Probabilidade (#24)
- evento complementar → Probabilidade (#24)
- eventos independentes → Probabilidade condicional (#40)
- eventos mutuamente exclusivos → Probabilidade (#24)
- excentricidade → Cônicas (#80)
- expoente fracionário → Radiciação (#25)
- expoente negativo → Potências (#17)
- expoente zero → Potências (#17)
- expressões numéricas → O que cada operação faz (#5)

**F**

- f(ax) → Transformações de gráfico (#75)
- f(x)+k → Transformações de gráfico (#75)
- f(x+k) → Transformações de gráfico (#75)
- face → Poliedros (#16)
- fase → Funções trigonométricas (#81)
- fator comum → Fatoração (#44)
- fator de aumento → Aumentos e descontos (#27)
- fator de desconto → Aumentos e descontos (#27)
- fatoração completa → Fatoração (#44)
- fatoração em primos → Primos e fatoração (#20)
- fatorial → Arranjos e permutações (#14)
- feixe de paralelas → Teorema de Tales (#31)
- figuras semelhantes → Semelhança de triângulos (#33)
- financiamento → Juros simples e compostos (#37)
- foco → Cônicas (#80)
- forma algébrica → Números complexos (#69)
- forma canônica → Função quadrática (#65)
- forma polar → Complexos na forma trigonométrica (#83)
- forma trigonométrica → Complexos na forma trigonométrica (#83)
- fórmula de Bhaskara → Equação do 2º grau (#50)
- fórmula de De Moivre → Complexos na forma trigonométrica (#83)
- fórmula de Heron → Áreas de polígonos (#32)
- fração algébrica → Frações algébricas (#52)
- fração composta → Frações algébricas (#52)
- fração de fração → Frações (#11)
- fração geratriz → Números reais (#36)
- fração irredutível → Frações (#11)
- frações equivalentes → Frações (#11)
- frequência absoluta → Leitura de gráficos e tabelas (#23)
- frequência acumulada → Leitura de gráficos e tabelas (#23)
- frequência relativa → Leitura de gráficos e tabelas (#23)
- função → O que é uma função (#38)
- função afim → Função afim (#43)
- função bijetora → Função composta e inversa (#55)
- função composta → Função composta e inversa (#55)
- função constante → Função afim (#43)
- função cosseno → Funções trigonométricas (#81)
- função crescente → O que é uma função (#38)
- função crescente e decrescente → Função logarítmica (#74)
- função decrescente → O que é uma função (#38)
- função definida por partes → Função modular (#57)
- função definida por partes → O que é uma função (#38)
- função exponencial → Função exponencial (#54)
- função ímpar → O que é uma função (#38)
- função injetora → Função composta e inversa (#55)
- função inversa → Função composta e inversa (#55)
- função linear → Função afim (#43)
- função logarítmica → Função logarítmica (#74)
- função modular → Função modular (#57)
- função par → O que é uma função (#38)
- função periódica → Funções trigonométricas (#81)
- função quadrática → Função quadrática (#65)
- função seno → Funções trigonométricas (#81)
- função sobrejetora → Função composta e inversa (#55)
- função tangente → Funções trigonométricas (#81)
- fuso esférico → Esfera (#64)

**G**

- geratriz → Cilindro e cone (#59)
- gráfico da exponencial → Função exponencial (#54)
- gráfico da função composta com reta → Transformações de gráfico (#75)
- gráfico da inversa → Função composta e inversa (#55)
- gráfico da modular → Função modular (#57)
- gráfico da reta → Função afim (#43)
- gráfico da senoide → Funções trigonométricas (#81)
- gráfico de barras → Leitura de gráficos e tabelas (#23)
- gráfico de função → O que é uma função (#38)
- gráfico de linhas → Leitura de gráficos e tabelas (#23)
- gráfico de setores → Leitura de gráficos e tabelas (#23)
- gráfico do logaritmo → Função logarítmica (#74)
- gráfico enganoso → Leitura de gráficos e tabelas (#23)
- grandezas diretamente proporcionais → Razão e proporção (#19)
- grandezas inversamente proporcionais → Razão e proporção (#19)
- grau de um polinômio → Monômios e polinômios (#30)
- grau do polinômio → Polinômios (#70)

**H**

- h² = m·n → Relações métricas no triângulo retângulo (#61)
- hipérbole → Cônicas (#80)
- hipotenusa → Teorema de Pitágoras (#47)
- histograma → Leitura de gráficos e tabelas (#23)

**I**

- identidade de polinômios → Polinômios (#70)
- identidade trigonométrica → Identidades e equações trigonométricas (#84)
- igualdade de bases → Equações e inequações exponenciais (#67)
- igualdade de logaritmos → Equações e inequações logarítmicas (#82)
- imagem → O que é uma função (#38)
- imagem da função quadrática → Função quadrática (#65)
- imagem das trigonométricas → Funções trigonométricas (#81)
- incentro → Triângulos (#3)
- incógnita → Linguagem algébrica (#21)
- índice e radicando → Radiciação (#25)
- inequação → Inequações do 1º grau (#53)
- inequação do segundo grau → Inequações e estudo do sinal (#76)
- inequação exponencial → Equações e inequações exponenciais (#67)
- inequação fracionária → Inequações do 1º grau (#53)
- inequação logarítmica → Equações e inequações logarítmicas (#82)
- inequação modular → Função modular (#57)
- inequação produto → Inequações e estudo do sinal (#76)
- inequação quociente → Inequações e estudo do sinal (#76)
- inequação trigonométrica → Identidades e equações trigonométricas (#84)
- interpolação aritmética → Sequências e PA (#56)
- interpretação geométrica → Produtos notáveis (#34)
- interpretação gráfica → Sistemas do 1º grau (#35)
- interseção → A circunferência no plano (#77)
- interseção → Conjuntos e intervalos (#49)
- interseção de retas → A reta no plano (#63)
- intervalo aberto → Conjuntos e intervalos (#49)
- intervalo fechado → Conjuntos e intervalos (#49)
- inversão do sinal → Equações e inequações exponenciais (#67)
- inversão do sinal → Inequações do 1º grau (#53)
- inverso de um número → Esticamento (#15)

**J**

- juros compostos → Juros simples e compostos (#37)
- juros compostos como PG → Progressão geométrica (#68)
- juros simples → Juros simples e compostos (#37)

**L**

- lei de formação → O que é uma função (#38)
- lei de formação → Matrizes (#45)
- lei de recorrência → Sequências e PA (#56)
- lei dos cossenos → Lei dos senos e dos cossenos (#78)
- lei dos senos → Lei dos senos e dos cossenos (#78)
- localização de ponto → Plano cartesiano (#7)
- logaritmando → Logaritmos (#66)
- logaritmo → Logaritmos (#66)
- logaritmo de potência → Logaritmos (#66)
- logaritmo de produto → Logaritmos (#66)
- logaritmo de quociente → Logaritmos (#66)
- logaritmo decimal → Logaritmos (#66)
- logaritmo natural → Logaritmos (#66)
- losango → Quadriláteros (#9)

**M**

- massa → Unidades de medida (#26)
- matriz → Matrizes (#45)
- matriz dos coeficientes → Sistemas lineares (#71)
- matriz identidade → Matrizes (#45)
- matriz inversa → Matrizes (#45)
- matriz singular → Determinantes (#51)
- matriz transposta → Matrizes (#45)
- MDC → Frações (#11)
- MDC por fatoração → Primos e fatoração (#20)
- média aritmética → Média, moda e mediana (#39)
- média de médias → Média, moda e mediana (#39)
- média ponderada → Média, moda e mediana (#39)
- mediana → Dispersão (#42)
- mediana → Média, moda e mediana (#39)
- mediana do triângulo → Triângulos (#3)
- mediatriz → A reta no plano (#63)
- mediatriz → Triângulos (#3)
- medida em graus → Ângulos (#2)
- meia-vida → Função exponencial (#54)
- menos com menos dá mais → Esticamento (#15)
- método da adição → Sistemas do 1º grau (#35)
- método da chave → Polinômios (#70)
- método da substituição → Sistemas do 1º grau (#35)
- MMC → Frações (#11)
- MMC de polinômios → Frações algébricas (#52)
- MMC por fatoração → Primos e fatoração (#20)
- moda → Média, moda e mediana (#39)
- módulo → Complexos na forma trigonométrica (#83)
- módulo → Função modular (#57)
- módulo de um complexo → Números complexos (#69)
- módulo de um número → A reta numérica (#1)
- monômio → Monômios e polinômios (#30)
- montante → Juros simples e compostos (#37)
- mudança de base → Logaritmos (#66)
- mudança de variável → Equações e inequações exponenciais (#67)
- mudança de variável → Equações e inequações logarítmicas (#82)
- multiplicação como repetição → O que cada operação faz (#5)
- multiplicação de frações → Frações (#11)
- multiplicação de matrizes → Matrizes (#45)
- multiplicação de polinômios → Monômios e polinômios (#30)
- multiplicação e divisão → Frações algébricas (#52)
- multiplicação na forma polar → Complexos na forma trigonométrica (#83)
- multiplicação por escalar → Matrizes (#45)
- multiplicidade → Equações polinomiais (#72)

**N**

- N Z Q → Conjuntos numéricos (#4)
- notação científica → Notação científica (#28)
- notação de intervalo → Conjuntos e intervalos (#49)
- numerador e denominador → Frações (#11)
- número binomial → Combinações (#22)
- número complexo → Números complexos (#69)
- número composto → Primos e fatoração (#20)
- número de diagonais → Polígonos (#8)
- número e → Função exponencial (#54)
- número negativo → A reta numérica (#1)
- número pi → Comprimento e área do círculo (#48)
- número pi → Números reais (#36)
- número primo → Primos e fatoração (#20)
- números inteiros → Conjuntos numéricos (#4)
- números irracionais → Números reais (#36)
- números naturais → Conjuntos numéricos (#4)
- números racionais → Conjuntos numéricos (#4)

**O**

- operação inversa → O que cada operação faz (#5)
- operações com complexos → Números complexos (#69)
- operações em notação científica → Notação científica (#28)
- oposto → Junção (#12)
- oposto de um número → A reta numérica (#1)
- ordem das operações → O que cada operação faz (#5)
- ordem de grandeza → Notação científica (#28)
- ordem de uma matriz → Matrizes (#45)
- ortocentro → Triângulos (#3)
- outlier → Dispersão (#42)

**P**

- PA e função afim → Sequências e PA (#56)
- par ordenado → Plano cartesiano (#7)
- para todo e existe → Conjuntos numéricos (#4)
- parábola → Cônicas (#80)
- parábola → Função quadrática (#65)
- paralelepípedo → Prismas (#46)
- paralelogramo → Quadriláteros (#9)
- parâmetro → Linguagem algébrica (#21)
- parte imaginária → Números complexos (#69)
- parte real → Números complexos (#69)
- passar pro outro lado → Equação do 1º grau (#29)
- pelo menos um → Probabilidade (#24)
- período → Funções trigonométricas (#81)
- permutação circular → Arranjos e permutações (#14)
- permutação com repetição → Arranjos e permutações (#14)
- permutação simples → Arranjos e permutações (#14)
- PG convergente → Progressão geométrica (#68)
- PG e função exponencial → Progressão geométrica (#68)
- pirâmide → Pirâmides (#60)
- Pitágoras como caso particular → Lei dos senos e dos cossenos (#78)
- planificação → Poliedros (#16)
- planificação → Prismas (#46)
- planificação do cone → Cilindro e cone (#59)
- plano de Argand-Gauss → Números complexos (#69)
- planos paralelos → Retas e planos no espaço (#10)
- planos perpendiculares → Retas e planos no espaço (#10)
- poliedro → Poliedros (#16)
- poliedro convexo → Poliedros (#16)
- poliedros de Platão → Poliedros (#16)
- polígono → Polígonos (#8)
- polígono convexo → Polígonos (#8)
- polígono regular → Polígonos (#8)
- polinômio → Monômios e polinômios (#30)
- polinômio → Polinômios (#70)
- ponto médio → O ponto no plano (#58)
- ponto percentual → Aumentos e descontos (#27)
- ponto reta e plano → Retas e planos no espaço (#10)
- população e amostra → Leitura de gráficos e tabelas (#23)
- porcentagem → Porcentagem (#18)
- porcentagem como decimal → Porcentagem (#18)
- porcentagem como fração → Porcentagem (#18)
- posição de um ponto → A circunferência no plano (#77)
- posição de uma reta → A circunferência no plano (#77)
- posição entre duas circunferências → A circunferência no plano (#77)
- posição relativa entre retas → A reta no plano (#63)
- posições relativas entre reta e circunferência → Circunferência e círculo (#6)
- postulados → Retas e planos no espaço (#10)
- potência de base negativa → Potências (#17)
- potência de complexo → Complexos na forma trigonométrica (#83)
- potência de dez → Notação científica (#28)
- potência de expoente natural → Potências (#17)
- potência de fração → Potências (#17)
- potência de ponto → Semelhança de triângulos (#33)
- potência de potência → Potências (#17)
- potências de i → Números complexos (#69)
- prefixos quilo mili centi → Unidades de medida (#26)
- princípio aditivo → Equação do 1º grau (#29)
- princípio aditivo → Princípio multiplicativo (#13)
- princípio de Cavalieri → Prismas (#46)
- princípio fundamental da contagem → Princípio multiplicativo (#13)
- princípio multiplicativo → Equação do 1º grau (#29)
- princípio multiplicativo → Princípio multiplicativo (#13)
- prisma → Prismas (#46)
- prisma inscrito → Sólidos inscritos e circunscritos (#79)
- prisma oblíquo → Prismas (#46)
- prisma reto → Prismas (#46)
- probabilidade clássica → Probabilidade (#24)
- probabilidade condicional → Probabilidade condicional (#40)
- probabilidade da soma → Probabilidade (#24)
- probabilidade do produto → Probabilidade condicional (#40)
- probabilidade geométrica → Probabilidade (#24)
- problema com dois conjuntos → Conjuntos e intervalos (#49)
- problema com duas incógnitas → Sistemas do 1º grau (#35)
- problema com três conjuntos → Conjuntos e intervalos (#49)
- problema de otimização → Função quadrática (#65)
- problema do primeiro grau → Equação do 1º grau (#29)
- problema do segundo grau → Equação do 2º grau (#50)
- problemas de baralho → Combinações (#22)
- problemas de comissão → Combinações (#22)
- produto cartesiano → Plano cartesiano (#7)
- produto da soma pela diferença → Produtos notáveis (#34)
- produto de mesma base → Potências (#17)
- progressão aritmética → Sequências e PA (#56)
- progressão geométrica → Progressão geométrica (#68)
- projeção dos catetos → Relações métricas no triângulo retângulo (#61)
- projeção ortogonal → Retas e planos no espaço (#10)
- proporção → Razão e proporção (#19)
- proporcionalidade e função linear → Função afim (#43)
- propriedade fundamental → Razão e proporção (#19)
- propriedades das diagonais → Quadriláteros (#9)
- propriedades dos determinantes → Determinantes (#51)
- propriedades dos radicais → Radiciação (#25)

**Q**

- quadrado → Quadriláteros (#9)
- quadrado da diferença → Produtos notáveis (#34)
- quadrado da soma → Produtos notáveis (#34)
- quadrantes → Círculo trigonométrico (#73)
- quadrantes → Plano cartesiano (#7)
- quadrilátero → Quadriláteros (#9)
- quadrilátero inscritível → Circunferência e círculo (#6)
- quadro de sinais → Inequações e estudo do sinal (#76)
- qual medida usar → Média, moda e mediana (#39)
- qual porcentagem um valor representa → Porcentagem (#18)
- quando usar combinação → Combinações (#22)
- quantidade de divisores → Primos e fatoração (#20)
- quantos cabem → O que cada operação faz (#5)
- quartil → Dispersão (#42)
- quociente de mesma base → Potências (#17)

**R**

- racionalização de denominador → Radiciação (#25)
- radiano → Círculo trigonométrico (#73)
- raio → Circunferência e círculo (#6)
- raio da circunferência circunscrita → Lei dos senos e dos cossenos (#78)
- raiz → Equações polinomiais (#72)
- raiz da equação → Equação do 1º grau (#29)
- raiz de número negativo → Radiciação (#25)
- raiz de polinômio → Polinômios (#70)
- raiz n-ésima → Radiciação (#25)
- raiz quadrada → Radiciação (#25)
- raiz que não serve → Equações e inequações logarítmicas (#82)
- raízes complexas conjugadas → Equações polinomiais (#72)
- raízes da parábola → Função quadrática (#65)
- raízes de um complexo → Complexos na forma trigonométrica (#83)
- raízes racionais → Equações polinomiais (#72)
- razão → Razão e proporção (#19)
- razão da PA → Sequências e PA (#56)
- razão da PG → Progressão geométrica (#68)
- razão de semelhança → Semelhança de triângulos (#33)
- razão entre áreas → Semelhança de triângulos (#33)
- razão entre perímetros → Semelhança de triângulos (#33)
- razão entre volumes → Semelhança de triângulos (#33)
- razão entre volumes → Sólidos inscritos e circunscritos (#79)
- recíproca do teorema → Teorema de Pitágoras (#47)
- redução ao primeiro quadrante → Círculo trigonométrico (#73)
- redução de termos semelhantes → Linguagem algébrica (#21)
- reflexão de figura → Plano cartesiano (#7)
- reflexão no eixo x → Transformações de gráfico (#75)
- reflexão no eixo y → Transformações de gráfico (#75)
- regra de Cramer → Sistemas lineares (#71)
- regra de Sarrus → Determinantes (#51)
- regra de sinais na adição → Junção (#12)
- regra de sinais na multiplicação → Esticamento (#15)
- regra de três composta → Razão e proporção (#19)
- regra de três simples → Razão e proporção (#19)
- relação de Euler → Poliedros (#16)
- relação de Stifel → Binômio de Newton (#41)
- relação fundamental → Identidades e equações trigonométricas (#84)
- relações de Girard → Equações polinomiais (#72)
- relações métricas → Relações métricas no triângulo retângulo (#61)
- relações métricas na circunferência → Semelhança de triângulos (#33)
- repartir em partes iguais → O que cada operação faz (#5)
- representação na reta → Inequações do 1º grau (#53)
- resolução de triângulo qualquer → Lei dos senos e dos cossenos (#78)
- resolução de triângulo retângulo → Trigonometria no triângulo retângulo (#62)
- reta e plano paralelos → Retas e planos no espaço (#10)
- reta numérica → A reta numérica (#1)
- reta perpendicular ao plano → Retas e planos no espaço (#10)
- reta secante → Circunferência e círculo (#6)
- reta tangente → Circunferência e círculo (#6)
- reta tangente à circunferência → A circunferência no plano (#77)
- retângulo → Quadriláteros (#9)
- retas concorrentes → Retas e planos no espaço (#10)
- retas paralelas → A reta no plano (#63)
- retas paralelas → Retas e planos no espaço (#10)
- retas paralelas cortadas por transversal → Ângulos (#2)
- retas perpendiculares → A reta no plano (#63)
- retas reversas → Retas e planos no espaço (#10)

**S**

- secante → Identidades e equações trigonométricas (#84)
- secção da esfera → Esfera (#64)
- secção meridiana → Cilindro e cone (#59)
- secção paralela à base → Pirâmides (#60)
- secção que resolve → Sólidos inscritos e circunscritos (#79)
- secção transversal → Prismas (#46)
- seções cônicas → Cônicas (#80)
- segmento circular → Comprimento e área do círculo (#48)
- segmentos proporcionais → Teorema de Tales (#31)
- sem reposição → Probabilidade condicional (#40)
- semelhança dos três triângulos → Relações métricas no triângulo retângulo (#61)
- seno → Trigonometria no triângulo retângulo (#62)
- seno da soma → Identidades e equações trigonométricas (#84)
- seno de qualquer ângulo → Círculo trigonométrico (#73)
- sequência → Sequências e PA (#56)
- setor circular → Comprimento e área do círculo (#48)
- significado da adição → O que cada operação faz (#5)
- símbolo de interseção → Conjuntos numéricos (#4)
- símbolo de pertence → Conjuntos numéricos (#4)
- símbolo de união → Conjuntos numéricos (#4)
- simetria com a exponencial → Função logarítmica (#74)
- simetria de ponto → O ponto no plano (#58)
- simetria em relação à origem → Plano cartesiano (#7)
- simetria em relação aos eixos → Plano cartesiano (#7)
- simetria pela bissetriz → Função composta e inversa (#55)
- simplificação → Frações (#11)
- simplificação de fração algébrica → Frações algébricas (#52)
- simplificação de radical → Radiciação (#25)
- sinal do número → Junção (#12)
- sinal na frente de parênteses → Junção (#12)
- sinal por quadrante → Círculo trigonométrico (#73)
- sintaxe matemática → Conjuntos numéricos (#4)
- sistema de equações → Sistemas do 1º grau (#35)
- sistema de inequações → Inequações e estudo do sinal (#76)
- sistema de inequações → Inequações do 1º grau (#53)
- sistema homogêneo → Sistemas lineares (#71)
- sistema impossível → Sistemas lineares (#71)
- sistema impossível → Sistemas do 1º grau (#35)
- sistema indeterminado → Sistemas do 1º grau (#35)
- sistema linear → Sistemas lineares (#71)
- sistema métrico → Unidades de medida (#26)
- sistema possível determinado → Sistemas lineares (#71)
- sistema possível indeterminado → Sistemas lineares (#71)
- sólido de revolução → Cilindro e cone (#59)
- soma algébrica → Junção (#12)
- soma de cubos → Fatoração (#44)
- soma de frações → Frações (#11)
- soma de frações algébricas → Frações algébricas (#52)
- soma dos ângulos das faces → Poliedros (#16)
- soma dos ângulos externos → Polígonos (#8)
- soma dos ângulos internos → Polígonos (#8)
- soma dos ângulos internos → Quadriláteros (#9)
- soma dos ângulos internos → Triângulos (#3)
- soma dos coeficientes → Binômio de Newton (#41)
- soma dos termos da PA → Sequências e PA (#56)
- soma dos termos da PG → Progressão geométrica (#68)
- soma e produto das raízes → Equação do 2º grau (#50)
- soma e produto das raízes → Equações polinomiais (#72)
- soma infinita → Progressão geométrica (#68)
- subconjunto → Conjuntos numéricos (#4)
- subtração como distância → O que cada operação faz (#5)
- superfície esférica → Esfera (#64)

**T**

- tangente → Trigonometria no triângulo retângulo (#62)
- tangente no círculo → Círculo trigonométrico (#73)
- taxa de juros → Juros simples e compostos (#37)
- taxa de variação → Função afim (#43)
- taxa equivalente → Juros simples e compostos (#37)
- taxa proporcional → Juros simples e compostos (#37)
- tempo → Unidades de medida (#26)
- teorema da bissetriz interna → Teorema de Tales (#31)
- teorema de Bayes → Probabilidade condicional (#40)
- teorema de D'Alembert → Polinômios (#70)
- teorema de Laplace → Determinantes (#51)
- teorema de Pitágoras → Teorema de Pitágoras (#47)
- teorema de Tales → Teorema de Tales (#31)
- teorema do resto → Polinômios (#70)
- teorema fundamental da álgebra → Equações polinomiais (#72)
- teorema fundamental da aritmética → Primos e fatoração (#20)
- termo geral → Sequências e PA (#56)
- termo geral da PG → Progressão geométrica (#68)
- termo geral do binômio → Binômio de Newton (#41)
- termo independente → Binômio de Newton (#41)
- termo médio → Sequências e PA (#56)
- termos semelhantes → Linguagem algébrica (#21)
- terno pitagórico → Teorema de Pitágoras (#47)
- teste da reta vertical → O que é uma função (#38)
- tetraedro regular → Pirâmides (#60)
- tradução de enunciado → Linguagem algébrica (#21)
- transformação em produto → Identidades e equações trigonométricas (#84)
- transformações da senoide → Funções trigonométricas (#81)
- translação de figura → Plano cartesiano (#7)
- translação horizontal → Transformações de gráfico (#75)
- translação vertical → Transformações de gráfico (#75)
- trapézio → Quadriláteros (#9)
- trapézio isósceles → Quadriláteros (#9)
- triângulo → Triângulos (#3)
- triângulo de Pascal → Binômio de Newton (#41)
- trinômio do segundo grau → Fatoração (#44)
- trinômio quadrado perfeito → Fatoração (#44)
- tronco de cone → Cilindro e cone (#59)
- tronco de pirâmide → Pirâmides (#60)

**U**

- união → Conjuntos e intervalos (#49)
- união de eventos → Probabilidade (#24)
- unidade imaginária → Números complexos (#69)
- unidades de área → Unidades de medida (#26)
- unidades de volume → Unidades de medida (#26)

**V**

- valor absoluto → A reta numérica (#1)
- valor cheio a partir da parte → Porcentagem (#18)
- valor máximo → Função quadrática (#65)
- valor mínimo → Função quadrática (#65)
- valor numérico → Linguagem algébrica (#21)
- valor numérico → Polinômios (#70)
- variação percentual → Aumentos e descontos (#27)
- variação percentual total → Aumentos e descontos (#27)
- variância → Dispersão (#42)
- variável → Linguagem algébrica (#21)
- variável qualitativa → Leitura de gráficos e tabelas (#23)
- variável quantitativa → Leitura de gráficos e tabelas (#23)
- velocidade média como razão → Razão e proporção (#19)
- verificação da raiz → Equação do 1º grau (#29)
- vértice → Função quadrática (#65)
- vértice → Poliedros (#16)
- volume da esfera → Esfera (#64)
- volume da pirâmide → Pirâmides (#60)
- volume do cilindro → Cilindro e cone (#59)
- volume do cone → Cilindro e cone (#59)
- volume do prisma → Prismas (#46)

**Z**

- zero da função → O que é uma função (#38)
- zero da função afim → Função afim (#43)
