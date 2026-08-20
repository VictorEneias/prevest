/**
 * <Plano /> — o plano cartesiano com curvas desenhadas, congelado.
 *
 * É a irmã da <Reta /> um andar acima: mesma família de figura estática, sem
 * controle nenhum, pro caso em que o argumento é o desenho e não a exploração.
 * Quem vai deixar o aluno mexer nos coeficientes é o <Funcao />, que ainda não
 * existe.
 *
 * A curva chega como função de x, e não como lista de pontos, porque quem
 * escreve o .mdx pensa em "−x² + 2x + 1" e não em duzentos pares de números. O
 * componente amostra e liga os pontos.
 *
 * O rótulo mora encostado na curva, e não numa legenda ao lado: com seis curvas
 * na mesma figura, legenda lateral obriga o olho a ir e voltar seis vezes pra
 * descobrir quem é quem. É o mesmo motivo pelo qual o mapa escreve o nome dentro
 * do módulo.
 */

export interface Curva {
  /** A função. Vem do .mdx como `(x) => -x*x + 2*x + 1`. */
  f: (x: number) => number;
  /** O pedaço do eixo x em que ela é desenhada. */
  de: number;
  ate: number;
  /** A letra escrita em cima dela. */
  nome?: string;
  /** Em que x o rótulo encosta. Sem isto ele vai pro meio do traço. */
  rotuloEm?: number;
  /** Quanto o rótulo sobe (positivo) ou desce, em unidades do eixo. */
  rotuloAcima?: number;
  /** 0 a 5: as cores das áreas do mapa. Sem isto, cada curva pega a seguinte. */
  cor?: number;
}

export interface PlanoProps {
  curvas: Curva[];
  /** O que aparece do eixo x. Padrão: de −4 a 4. */
  dominio?: [number, number];
  /** O que aparece do eixo y. Padrão: o mesmo do x. */
  imagem?: [number, number];
  /** Distância entre as linhas da grade. */
  passo?: number;
  titulo?: string;
  legenda?: string;
}

const L = 720;
const MARGEM = 30;
const AMOSTRAS = 300;

const fmt = (n: number) => String(n).replace('.', ',').replace('-', '−');

export default function Plano({
  curvas,
  dominio = [-4, 4],
  imagem,
  passo = 1,
  titulo,
  legenda,
}: PlanoProps) {
  const [xmin, xmax] = dominio;
  const [ymin, ymax] = imagem ?? dominio;

  /* a escala é a mesma nos dois eixos, senão a parábola sai achatada e o aluno
     lê uma inclinação que não existe; quem se ajusta é a altura da figura */
  const esc = (L - 2 * MARGEM) / (xmax - xmin);
  const A = (ymax - ymin) * esc + 2 * MARGEM;

  const px = (v: number) => MARGEM + (v - xmin) * esc;
  const py = (v: number) => A - MARGEM - (v - ymin) * esc;

  const marcas = (min: number, max: number) => {
    const out: number[] = [];
    for (let i = Math.ceil(min / passo); i * passo <= max + 1e-9; i++) out.push(i * passo);
    return out;
  };

  /* corto a curva onde ela sai pela borda de cima ou de baixo, e recomeço o
     traço quando ela volta: sem isso o SVG desenha a volta por fora do quadro */
  const traco = (c: Curva) => {
    const partes: string[] = [];
    let atual = '';
    for (let i = 0; i <= AMOSTRAS; i++) {
      const x = c.de + ((c.ate - c.de) * i) / AMOSTRAS;
      const y = c.f(x);
      if (!Number.isFinite(y) || y < ymin || y > ymax || x < xmin || x > xmax) {
        if (atual) partes.push(atual);
        atual = '';
        continue;
      }
      atual += `${atual ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`;
    }
    if (atual) partes.push(atual);
    return partes.join(' ');
  };

  const cor = (c: Curva, i: number) => `var(--bloco-${c.cor ?? (i % 6)})`;

  const nomes = curvas.map((c) => c.nome).filter(Boolean).join(', ');
  const aria =
    `Plano cartesiano de ${fmt(xmin)} a ${fmt(xmax)} no eixo x e de ${fmt(ymin)} a ` +
    `${fmt(ymax)} no eixo y, com ${curvas.length} ${curvas.length === 1 ? 'curva' : 'curvas'}` +
    (nomes ? `: ${nomes}.` : '.');

  return (
    <figure className="pl">
      {titulo && <figcaption className="pl-titulo">{titulo}</figcaption>}
      {legenda && <div className="pl-legenda">{legenda}</div>}

      {/* o quadrado de −4 a 4 nos dois eixos dá uma figura de 720 por 720, e em
          largura cheia isso é uma tela inteira de rolagem pra ver um gráfico. O
          teto é a altura, e a largura máxima sai dela pela proporção, senão a
          figura encolhe e sobra faixa branca dos dois lados. */}
      <svg
        className="pl-svg"
        viewBox={`0 0 ${L} ${A}`}
        style={{ maxWidth: `calc(58vh * ${(L / A).toFixed(3)})` }}
        role="img"
        aria-label={aria}
      >
        {marcas(xmin, xmax).map((v) => (
          <line key={`gx${v}`} x1={px(v)} y1={MARGEM} x2={px(v)} y2={A - MARGEM} className="pl-grade" />
        ))}
        {marcas(ymin, ymax).map((v) => (
          <line key={`gy${v}`} x1={MARGEM} y1={py(v)} x2={L - MARGEM} y2={py(v)} className="pl-grade" />
        ))}

        <line x1={MARGEM} y1={py(0)} x2={L - MARGEM + 12} y2={py(0)} className="pl-eixo" />
        <line x1={px(0)} y1={A - MARGEM} x2={px(0)} y2={MARGEM - 12} className="pl-eixo" />
        <path d={`M${L - MARGEM + 12} ${py(0)}l-9 -5v10z`} className="pl-ponta" />
        <path d={`M${px(0)} ${MARGEM - 12}l-5 9h10z`} className="pl-ponta" />
        <text x={L - MARGEM + 6} y={py(0) - 14} className="pl-eixo-nome">x</text>
        <text x={px(0) + 12} y={MARGEM - 6} className="pl-eixo-nome">y</text>

        {marcas(xmin, xmax).map((v) =>
          v === 0 ? null : (
            <text key={`rx${v}`} x={px(v)} y={py(0) + 18} textAnchor="middle" className="pl-tick">
              {fmt(v)}
            </text>
          ),
        )}
        {marcas(ymin, ymax).map((v) =>
          v === 0 ? null : (
            <text key={`ry${v}`} x={px(0) - 8} y={py(v) + 4} textAnchor="end" className="pl-tick">
              {fmt(v)}
            </text>
          ),
        )}
        <text x={px(0) - 8} y={py(0) + 18} textAnchor="end" className="pl-tick">0</text>

        {curvas.map((c, i) => {
          const xr = c.rotuloEm ?? c.de + (c.ate - c.de) * 0.6;
          const yr = c.f(xr) + (c.rotuloAcima ?? 0.45);
          return (
            <g key={i}>
              <path d={traco(c)} fill="none" stroke={cor(c, i)} strokeWidth="2.5" />
              {c.nome && (
                <>
                  <circle cx={px(xr)} cy={py(yr)} r="12" fill="var(--papel)" stroke={cor(c, i)} />
                  <text x={px(xr)} y={py(yr) + 5} textAnchor="middle" className="pl-nome" fill={cor(c, i)}>
                    {c.nome}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      <style>{`
        .pl {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .pl-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .pl-legenda {
          font-size: 0.95rem; color: var(--tinta-media);
          margin-bottom: calc(var(--u) * 0.2);
        }
        .pl-svg { width: 100%; height: auto; display: block; margin: 0 auto; overflow: visible; }
        .pl-grade { stroke: var(--grade-forte); stroke-width: 1; }
        .pl-eixo { stroke: var(--tinta); stroke-width: 1.5; }
        .pl-ponta { fill: var(--tinta); }
        .pl-eixo-nome { font-size: 15px; font-style: italic; fill: var(--tinta); }
        .pl-tick { font-size: 12px; fill: var(--tinta-fraca); }
        .pl-nome { font-size: 13px; font-weight: 700; font-style: italic; }
      `}</style>
    </figure>
  );
}
