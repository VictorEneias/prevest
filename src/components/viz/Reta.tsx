/**
 * <Reta /> — a reta numérica sozinha, congelada.
 *
 * É a mesma reta do <Setas />, só que sem conta em cima dela: serve pra mostrar
 * escala, porque a mesma figura com passo grande cabe do 0 ao 100 e com passo
 * pequeno mostra quem mora entre o 1 e o 2. Pro aluno mexer na escala, aí é o
 * <RetaZoom />.
 */

export interface RetaProps {
  dominio: [number, number];
  /** Distância entre as marcas que ganham rótulo. */
  passo: number;
  /** Quantas marcas sem rótulo entre duas rotuladas. 0 desliga. */
  menores?: number;
  /** Marcas mais altas e em negrito. O zero já entra sozinho. */
  destacar?: number[];
  /** Aparece acima da reta. */
  legenda?: string;
  titulo?: string;
}

const L = 720;
const Y = 66;
const A = 108;
const MARGEM = 34;

export default function Reta({
  dominio,
  passo,
  menores = 0,
  destacar = [],
  legenda,
  titulo,
}: RetaProps) {
  const [min, max] = dominio;
  const x = (v: number) => MARGEM + ((v - min) / (max - min)) * (L - 2 * MARGEM);

  /* casas decimais saem do próprio passo, senão 0,30000000000000004 vira rótulo */
  const casas = (String(passo).split('.')[1] ?? '').length;
  const fmt = (n: number) =>
    (Math.abs(n) < 1e-9 ? 0 : n).toFixed(casas).replace('.', ',').replace('-', '−');

  const passoMenor = menores > 0 ? passo / menores : passo;
  const eps = passoMenor * 1e-6;
  const ehMultiplo = (v: number, p: number) => Math.abs(v / p - Math.round(v / p)) < 1e-6;

  const marcas: { v: number; rotulada: boolean; forte: boolean }[] = [];
  for (let i = Math.ceil((min - eps) / passoMenor); i * passoMenor <= max + eps; i++) {
    const v = i * passoMenor;
    marcas.push({
      v,
      rotulada: ehMultiplo(v, passo),
      forte: Math.abs(v) < eps || destacar.some((d) => Math.abs(d - v) < eps),
    });
  }

  const aria = `Reta numérica de ${fmt(min)} a ${fmt(max)}, marcada de ${fmt(passo)} em ${fmt(passo)}.`;

  return (
    <figure className="reta">
      {titulo && <figcaption className="reta-titulo">{titulo}</figcaption>}
      {legenda && <div className="reta-legenda">{legenda}</div>}

      <svg className="reta-svg" viewBox={`0 0 ${L} ${A}`} role="img" aria-label={aria}>
        <line
          x1={MARGEM - 14}
          y1={Y}
          x2={L - MARGEM + 14}
          y2={Y}
          stroke="var(--tinta)"
          strokeWidth="1.5"
        />
        {marcas.map((m) => (
          <g key={m.v}>
            <line
              x1={x(m.v)}
              y1={Y - (m.forte ? 9 : m.rotulada ? 5 : 3)}
              x2={x(m.v)}
              y2={Y + (m.forte ? 9 : m.rotulada ? 5 : 3)}
              stroke={m.forte ? 'var(--tinta)' : 'var(--tinta-fraca)'}
              strokeWidth={m.forte ? 2 : 1}
            />
            {m.rotulada && (
              <text
                x={x(m.v)}
                y={Y + 26}
                textAnchor="middle"
                className={`reta-tick ${m.forte ? 'forte' : ''}`}
              >
                {fmt(m.v)}
              </text>
            )}
          </g>
        ))}
      </svg>

      <style>{`
        .reta {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .reta-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .reta-legenda {
          font-size: 0.95rem; color: var(--tinta-media);
          margin-bottom: calc(var(--u) * 0.2);
        }
        .reta-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .reta-tick { font-family: var(--f-ui); font-size: 12px; fill: var(--tinta-fraca); }
        .reta-tick.forte { fill: var(--tinta); font-weight: 700; }
      `}</style>
    </figure>
  );
}
