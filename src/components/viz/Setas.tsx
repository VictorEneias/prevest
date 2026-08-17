/**
 * <Setas /> — a figura estática de junção.
 *
 * Mesma linguagem do <Juncao /> (setas encadeadas sobre a reta, azul positivo,
 * vermelho negativo), só que congelada: sem controle nenhum. Serve pros exemplos
 * em que a conta é fixa e o aluno só precisa ver as setas caírem nos números
 * certos. Pra mexer, embaralhar ou agrupar, use o <Juncao />.
 */

export interface SetasProps {
  /** Parcelas da junção, com sinal. Ex.: [3, -5] */
  parcelas: number[];
  /** Legenda mostrada acima da reta. Ex.: "3 - 5 -> (+3) + (-5) = -2" */
  legenda?: string;
  titulo?: string;
  /** Trava a escala da reta. Sem isso, ajusta sozinho. */
  dominio?: [number, number];
}

const L = 720;
const Y = 178;
const MARGEM = 34;

const menos = (s: string | number) => String(s).replace(/-/g, '−');
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));
const sinal = (n: number) => (n < 0 ? '−' : '+');
/** Onde o arco de Bézier realmente estoura: B(0.5) = (P0 + 3C1 + 3C2 + P3)/8. */
const picoDoArco = (topo: number) => (2 * (Y - 3) + 6 * topo) / 8;

export default function Setas({ parcelas, legenda, titulo, dominio }: SetasProps) {
  /* somas acumuladas: onde cada seta começa e termina */
  const acum = [0];
  parcelas.forEach((p) => acum.push(acum[acum.length - 1] + p));
  const total = acum[acum.length - 1];

  const [min, max] = ((): [number, number] => {
    if (dominio) return dominio;
    const vals = [...acum, 0];
    let lo = Math.floor(Math.min(...vals)) - 1;
    let hi = Math.ceil(Math.max(...vals)) + 1;
    if (hi - lo < 6) {
      const meio = (hi + lo) / 2;
      lo = Math.floor(meio - 3);
      hi = Math.ceil(meio + 3);
    }
    return [lo, hi];
  })();

  const x = (v: number) => MARGEM + ((v - min) / (max - min)) * (L - 2 * MARGEM);

  /* marcações inteiras, ralas o bastante pra caber */
  const span = max - min;
  const passoTick = span <= 14 ? 1 : span <= 30 ? 2 : span <= 70 ? 5 : 10;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / passoTick) * passoTick; v <= max; v += passoTick) ticks.push(v);

  const setas = parcelas.map((p, i) => {
    const x0 = x(acum[i]);
    const x1 = x(acum[i + 1]);
    const topo = Y - (30 + Math.min(i, 5) * 21);
    return {
      p,
      x0,
      x1,
      topo,
      yRotulo: picoDoArco(topo) - 7,
      xRotulo: (x0 + x1) / 2,
      neg: p < 0,
      visivel: Math.abs(x1 - x0) >= 0.5,
    };
  });

  const topoMin = Y - (30 + Math.min(parcelas.length - 1, 5) * 21);
  const viewTop = Math.min(topoMin - 12, 0);
  const A = Y + 42;

  const aria =
    `Reta numérica de ${min} a ${max}. Setas encadeadas: ` +
    parcelas.map((p) => `${p < 0 ? 'menos' : 'mais'} ${Math.abs(p)}`).join(', ') +
    `. Resultado ${total}.`;

  return (
    <figure className="setas">
      {titulo && <figcaption className="setas-titulo">{titulo}</figcaption>}
      {legenda && <div className="setas-legenda">{menos(legenda)}</div>}

      <svg
        className="setas-svg"
        viewBox={`0 ${viewTop} ${L} ${A - viewTop}`}
        role="img"
        aria-label={aria}
      >
        <defs>
          <marker id="s-pta-pos" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="var(--azul)" />
          </marker>
          <marker id="s-pta-neg" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="var(--vermelho)" />
          </marker>
        </defs>

        <line
          x1={MARGEM - 14}
          y1={Y}
          x2={L - MARGEM + 14}
          y2={Y}
          stroke="var(--tinta)"
          strokeWidth="1.5"
        />
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={x(v)}
              y1={Y - (v === 0 ? 9 : 5)}
              x2={x(v)}
              y2={Y + (v === 0 ? 9 : 5)}
              stroke={v === 0 ? 'var(--tinta)' : 'var(--tinta-fraca)'}
              strokeWidth={v === 0 ? 2 : 1}
            />
            <text
              x={x(v)}
              y={Y + 26}
              textAnchor="middle"
              className={`setas-tick ${v === 0 ? 'zero' : ''}`}
            >
              {menos(v)}
            </text>
          </g>
        ))}

        {setas
          .filter((s) => s.visivel)
          .map((s, i) => (
            <g key={i}>
              <path
                d={`M ${s.x0} ${Y - 3} C ${s.x0} ${s.topo}, ${s.x1} ${s.topo}, ${s.x1} ${Y - 3}`}
                fill="none"
                stroke={s.neg ? 'var(--vermelho)' : 'var(--azul)'}
                strokeWidth="2.2"
                markerEnd={`url(#${s.neg ? 's-pta-neg' : 's-pta-pos'})`}
                opacity="0.92"
              />
              <text
                x={s.xRotulo}
                y={s.yRotulo}
                textAnchor="middle"
                className={`setas-rot ${s.neg ? 'neg' : 'pos'}`}
              >
                {sinal(s.p)}
                {fmt(Math.abs(s.p))}
              </text>
              <circle cx={s.x0} cy={Y} r="3" fill={s.neg ? 'var(--vermelho)' : 'var(--azul)'} />
            </g>
          ))}

        <g>
          <line
            x1={x(total)}
            y1={Y - 6}
            x2={x(total)}
            y2={Y + 14}
            stroke="var(--tinta)"
            strokeWidth="3"
          />
          <circle cx={x(total)} cy={Y} r="6" fill="var(--tinta)" />
          <text x={x(total)} y={Y - 14} textAnchor="middle" className="setas-fim">
            {menos(fmt(total))}
          </text>
        </g>
      </svg>

      <style>{`
        .setas {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .setas-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .setas-legenda {
          font-size: 1.15rem; font-variant-numeric: tabular-nums;
          color: var(--tinta); letter-spacing: 0.01em;
          margin-bottom: calc(var(--u) * 0.3);
        }
        .setas-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .setas-tick { font-family: var(--f-ui); font-size: 12px; fill: var(--tinta-fraca); }
        .setas-tick.zero { fill: var(--tinta); font-weight: 700; }
        .setas-rot { font-family: var(--f-ui); font-size: 13px; font-weight: 600; }
        .setas-rot.pos { fill: var(--azul); }
        .setas-rot.neg { fill: var(--vermelho); }
        .setas-fim { font-family: var(--f-ui); font-size: 14px; font-weight: 700; fill: var(--tinta); }
      `}</style>
    </figure>
  );
}
