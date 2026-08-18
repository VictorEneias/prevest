/**
 * Quanto tempo uma aula leva, calculado da página em vez de chutado.
 *
 * Os dois primeiros números vêm de fora e são os que sustentam o resto:
 *
 * - Brysbaert (2019), meta-análise de 190 estudos com 18.573 pessoas: adulto lê
 *   não-ficção em silêncio a 238 palavras por minuto, e em voz alta a 183.
 * - Course Workload Estimator (Barre e Esarey, Wake Forest), que separa a taxa
 *   por dificuldade do texto e por objetivo da leitura. Material com muitos
 *   conceitos novos: 130 palavras por minuto pra ENTENDER e 65 pra ENGAJAR, que
 *   é ler discutindo, anotando e respondendo. Uma aula 1-a-1 é engajar.
 *
 * Daí saem os dois tempos: a aula roda a 65 e a leitura do aluno em casa roda a
 * 130. O terceiro número é medido aqui: o Victor lê a junção inteira em 6
 * minutos, o que dá uns 290 palavras por minuto, coerente com a faixa de quem
 * não tem nenhum conceito novo pela frente (ele escreveu o texto).
 *
 * Fórmula, tabela e figura não são palavra, então cada uma entra como um tanto de
 * palavra equivalente. Esses quatro pesos são escolha minha, e não medida: eu
 * estimei quanto tempo cada coisa toma em aula (uma fórmula em bloco uns 11
 * segundos, uma figura estática uns 28, um interativo uns três minutos) e
 * converti pra palavra na taxa da aula.
 *
 * O que dá pra conferir é a ordem de grandeza. Com esses pesos a junção dá 30
 * minutos de aula e 16 de leitura do aluno, e o Victor leu ela em 6: bate, porque
 * ele lê o que escreveu na faixa de quem não tem conceito novo pela frente. E a
 * aula sempre dá o dobro da leitura, porque as duas taxas da tabela do Wake Forest
 * são 65 e 130. Se um dia der pra cronometrar aula de verdade, é aqui que o número
 * muda, e o resto do projeto acompanha sozinho.
 */

/* palavras por minuto */
export const TAXA_AULA = 65;
export const TAXA_LEITURA = 130;

/* palavras equivalentes de cada coisa que não é prosa */
export const PESO = {
  formula: 12,
  linhaDeTabela: 8,
  figura: 30,
  interativo: 200,
};

const INTERATIVOS = ['Juncao', 'RetaZoom', 'Caixas', 'Retangulo', 'Barra', 'Esticar'];
const FIGURAS = ['Setas', 'Reta', 'Conjunto'];

/** Conta o que existe na página. O que está dentro de <Alem> não entra: aquilo é
 *  declaradamente fora do escopo, e a aula não fica mais longa por causa dele. */
export function medirPagina(corpo) {
  const semAlem = corpo.replace(/<Alem[\s\S]*?<\/Alem>/g, '');

  const formulas = (semAlem.match(/^\$\$\s*$/gm) || []).length / 2;
  const linhasTabela = (semAlem.match(/^\|.*\|\s*$/gm) || []).length;

  const conta = (nomes) =>
    nomes.reduce((s, n) => s + (semAlem.match(new RegExp(`<${n}[\\s/>]`, 'g')) || []).length, 0);
  const figuras = conta(FIGURAS);
  const interativos = conta(INTERATIVOS);

  /* prosa é o que sobra depois de tirar tudo que já foi contado de outro jeito */
  const prosa = semAlem
    .replace(/<[A-Z][\s\S]*?\/>/g, '')
    .replace(/<\/?[A-Z][^>]*>/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/^\|.*$/gm, '')
    .replace(/^#{1,4} /gm, '')
    .split(/\s+/)
    .filter(Boolean).length;

  return { prosa, formulas, linhasTabela, figuras, interativos };
}

export function equivalente(m) {
  return (
    m.prosa +
    m.formulas * PESO.formula +
    m.linhasTabela * PESO.linhaDeTabela +
    m.figuras * PESO.figura +
    m.interativos * PESO.interativo
  );
}

const arredonda5 = (min) => Math.max(5, Math.round(min / 5) * 5);

export const tempoDeAula = (m) => arredonda5(equivalente(m) / TAXA_AULA);
export const tempoDeLeitura = (m) => Math.max(1, Math.round(equivalente(m) / TAXA_LEITURA));

export const ehEsqueleto = (corpo) => /Esqueleto: esta aula ainda não foi escrita/.test(corpo);

/**
 * Aula que ainda não foi escrita não tem página pra medir, então o tempo dela sai
 * dos tópicos declarados, com a régua ajustada por mínimos quadrados nas aulas
 * que já existem. É estimativa de estimativa, e por isso o plano marca qual é
 * qual: as escritas dizem "medido", as outras dizem "planejado".
 */
export function reguaPorTopicos(amostra) {
  const n = amostra.length;
  if (n < 2) return () => 40;
  const mx = amostra.reduce((s, p) => s + p.topicos, 0) / n;
  const my = amostra.reduce((s, p) => s + p.minutos, 0) / n;
  const num = amostra.reduce((s, p) => s + (p.topicos - mx) * (p.minutos - my), 0);
  const den = amostra.reduce((s, p) => s + (p.topicos - mx) ** 2, 0);
  const b = den ? num / den : 0;
  const a = my - b * mx;
  return (topicos) => Math.min(55, Math.max(25, arredonda5(a + b * topicos)));
}
