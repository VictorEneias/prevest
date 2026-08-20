/**
 * <Linhas /> — o gráfico de linha por categoria, congelado.
 *
 * O terceiro da família estática, depois da <Reta /> e do <Plano />: aqui o eixo
 * de baixo não é numérico, é uma lista de rótulos (ano, mês, faixa), que é como
 * quase todo gráfico de jornal e de prova é montado.
 *
 * Ele nasceu pra reproduzir gráfico de questão de vestibular, e é por isso que
 * tem `rotulos`: prova costuma escrever o valor em cima de cada ponto, e quando
 * ela faz isso o número é parte do enunciado — sem ele o aluno teria que chutar
 * a leitura na régua, e a alternativa que fala em "11,7" vira adivinhação.
 *
 * A linha se distingue por traço além da cor (cheia, tracejada, pontilhada),
 * porque três séries no mesmo desenho é exatamente o caso em que quem não separa
 * verde de vermelho fica sem saber qual é qual.
 */

export interface Serie {
  nome: string;
  /** Um valor por categoria. `null` abre buraco na linha. */
  valores: (number | null)[];
  /** 0 a 5: as cores das áreas do mapa. Sem isto, cada série pega a seguinte. */
  cor?: number;
  traco?: 'cheio' | 'tracejado' | 'pontilhado';
}

export interface LinhasProps {
  categorias: (string | number)[];
  series: Serie[];
  /** O que aparece do eixo vertical. Sem isto, sai dos próprios dados. */
  minimo?: number;
  maximo?: number;
  passo?: number;
  /** Escreve o valor de cada ponto acima dele. */
  rotulos?: boolean;
  titulo?: string;
  legenda?: string;
}

const L = 720;
const A = 400;
const ESQ = 52;
const DIR = 16;
const TOPO = 54;
const BASE = 40;

/* as casas saem dos dados: se a prova escreveu 74,0 e 73,5, o 74 sozinho na
   figura já não é o mesmo número que está lá */
const fmt = (n: number, casas = 0) => n.toFixed(casas).replace('.', ',').replace('-', '−');

const RISCO = { cheio: undefined, tracejado: '9 6', pontilhado: '2 5' } as const;

export default function Linhas({
  categorias,
  series,
  minimo,
  maximo,
  passo = 5,
  rotulos = false,
  titulo,
  legenda,
}: LinhasProps) {
  const todos = series.flatMap((s) => s.valores).filter((v): v is number => v !== null);
  const min = minimo ?? Math.floor(Math.min(...todos) / passo) * passo;
  const max = maximo ?? Math.ceil(Math.max(...todos) / passo) * passo;
  const casas = Math.max(...todos.map((v) => (String(v).split('.')[1] ?? '').length));

  const px = (i: number) =>
    ESQ + (categorias.length === 1 ? 0 : (i * (L - ESQ - DIR)) / (categorias.length - 1));
  const py = (v: number) => A - BASE - ((v - min) / (max - min)) * (A - TOPO - BASE);

  const linhasY: number[] = [];
  for (let v = min; v <= max + 1e-9; v += passo) linhasY.push(v);

  const cor = (s: Serie, i: number) => `var(--bloco-${s.cor ?? (i % 6)})`;

  const aria =
    `Gráfico de linhas de ${categorias[0]} a ${categorias[categorias.length - 1]}, com ` +
    series
      .map(
        (s) =>
          `${s.nome} indo de ${fmt(s.valores.find((v) => v !== null) as number, casas)} a ` +
          `${fmt([...s.valores].reverse().find((v) => v !== null) as number, casas)}`,
      )
      .join('; ') +
    '.';

  return (
    <figure className="ln">
      {titulo && <figcaption className="ln-titulo">{titulo}</figcaption>}
      {legenda && <div className="ln-legenda">{legenda}</div>}

      <svg className="ln-svg" viewBox={`0 0 ${L} ${A}`} role="img" aria-label={aria}>
        {series.map((s, i) => (
          <g key={`leg${i}`} transform={`translate(${ESQ + i * 190}, 22)`}>
            <line
              x1="0" y1="0" x2="34" y2="0"
              stroke={cor(s, i)} strokeWidth="2.5"
              strokeDasharray={RISCO[s.traco ?? 'cheio']}
            />
            <text x="42" y="4" className="ln-leg">{s.nome}</text>
          </g>
        ))}

        {linhasY.map((v) => (
          <g key={`y${v}`}>
            <line x1={ESQ} y1={py(v)} x2={L - DIR} y2={py(v)} className="ln-grade" />
            <text x={ESQ - 8} y={py(v) + 4} textAnchor="end" className="ln-tick">
              {fmt(v, casas)}
            </text>
          </g>
        ))}

        <line x1={ESQ} y1={A - BASE} x2={L - DIR} y2={A - BASE} className="ln-eixo" />

        {categorias.map((c, i) => (
          <text key={`x${i}`} x={px(i)} y={A - BASE + 20} textAnchor="middle" className="ln-tick">
            {c}
          </text>
        ))}

        {series.map((s, i) => {
          const d = s.valores
            .map((v, j) => (v === null ? '' : `${j === 0 || s.valores[j - 1] === null ? 'M' : 'L'}${px(j)} ${py(v)}`))
            .join('');
          return (
            <g key={`s${i}`}>
              <path
                d={d}
                fill="none"
                stroke={cor(s, i)}
                strokeWidth="2.5"
                strokeDasharray={RISCO[s.traco ?? 'cheio']}
              />
              {/* o rótulo das pontas encosta na borda e no eixo, então lá ele
                  ancora pra dentro em vez de ficar centrado no ponto */}
              {rotulos &&
                s.valores.map((v, j) =>
                  v === null ? null : (
                    <text
                      key={j}
                      x={px(j) + (j === 0 ? 3 : j === s.valores.length - 1 ? -3 : 0)}
                      y={py(v) - 9}
                      textAnchor={j === 0 ? 'start' : j === s.valores.length - 1 ? 'end' : 'middle'}
                      className="ln-valor"
                      fill={cor(s, i)}
                    >
                      {fmt(v, casas)}
                    </text>
                  ),
                )}
            </g>
          );
        })}
      </svg>

      <style>{`
        .ln {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .ln-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .ln-legenda {
          font-size: 0.95rem; color: var(--tinta-media);
          margin-bottom: calc(var(--u) * 0.2);
        }
        .ln-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .ln-grade { stroke: var(--grade); stroke-width: 1; }
        .ln-eixo { stroke: var(--tinta-fraca); stroke-width: 1.2; }
        .ln-tick { font-size: 12px; fill: var(--tinta-fraca); }
        .ln-leg { font-size: 13px; fill: var(--tinta-media); }
        .ln-valor { font-size: 11px; font-weight: 700; }
      `}</style>
    </figure>
  );
}
