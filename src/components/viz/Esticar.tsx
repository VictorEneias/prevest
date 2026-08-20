import { useEffect, useState } from 'react';

/* <Esticar /> — multiplicar como esticar, encolher e virar a seta.
 *
 * A leitura de "repetir" morre quando o fator é 1/2 ou −3, porque repetir meia
 * vez não quer dizer nada. Aqui o aluno pega uma seta e multiplica ela por um
 * fator: acima de 1 estica, entre 0 e 1 encolhe, e negativo vira pro outro lado
 * do zero, que é o "menos com menos dá mais" acontecendo em vez de ser regra.
 *
 * O preset do inverso é o que fecha a aula: com fator 1/a a ponta cai exatamente
 * no 1, e é isso que a divisão sempre foi. */

export interface EsticarProps {
  /** A seta de partida. */
  valor?: number;
  /** Por quanto ela é multiplicada. */
  fator?: number;
  /** Trava a escala da reta. Sem isso ela se ajusta sozinha. */
  dominio?: [number, number];
  titulo?: string;
  /** Guarda o estado no hash da URL, pra eu salvar a configuração da aula. */
  chaveUrl?: string;
}

const L = 720;
const Y = 128;
const MARGEM = 34;
const A = Y + 46;

const FATOR_MIN = -3;
const FATOR_MAX = 3;

const menos = (s: string | number) => String(s).replace(/-/g, '−');
const num = (n: number) => menos(String(Number(n.toFixed(4)))).replace('.', ',');

/** Escreve o fator como fração quando ele é uma fração de denominador pequeno,
 *  porque a aula toda fala de multiplicar por 1/b, e 0,3333 não lembra 1/3. */
const comoFracao = (f: number) => {
  if (Number.isInteger(f)) return menos(f);
  for (let d = 2; d <= 12; d++) {
    const n = f * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) {
      const sinal = n < 0 ? '−' : '';
      return `${sinal}${Math.abs(Math.round(n))}/${d}`;
    }
  }
  return num(f);
};

const frase = (f: number) => {
  if (f === 0) return 'o fator zero apaga a seta: sobrou o ponto no zero';
  if (f === 1) return 'fator 1 não mexe em nada, e é por isso que ele é o elemento neutro';
  if (f === -1) return 'fator −1 só vira a seta pro outro lado: o resultado é o oposto';
  if (f > 1) return `esticou ${comoFracao(f)} vezes o tamanho original`;
  if (f > 0) return `encolheu: sobrou ${comoFracao(f)} do tamanho original`;
  if (f > -1) return `virou pro outro lado e encolheu pra ${comoFracao(Math.abs(f))} do tamanho`;
  return `virou pro outro lado e esticou ${comoFracao(Math.abs(f))} vezes`;
};

export default function Esticar({
  valor: valorInicial = 3,
  fator: fatorInicial = 2,
  dominio,
  titulo,
  chaveUrl,
}: EsticarProps) {
  const [valor, setValor] = useState(valorInicial);
  const [fator, setFator] = useState(fatorInicial);
  const [travado, setTravado] = useState(false);

  useEffect(() => {
    if (!chaveUrl) return;
    const bruto = new URLSearchParams(location.hash.slice(1)).get(chaveUrl);
    if (!bruto) return;
    const [v, f] = bruto.split(',').map(Number);
    if (Number.isFinite(v)) setValor(v);
    if (Number.isFinite(f)) setFator(Math.min(FATOR_MAX, Math.max(FATOR_MIN, f)));
  }, [chaveUrl]);

  const resultado = valor * fator;

  const [min, max] = ((): [number, number] => {
    if (dominio) return dominio;
    const vals = [0, valor, resultado];
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const folga = Math.max(1, (hi - lo) * 0.12);
    return [Math.floor(lo - folga), Math.ceil(hi + folga)];
  })();

  const x = (v: number) => MARGEM + ((v - min) / (max - min || 1)) * (L - 2 * MARGEM);

  const span = max - min;
  const passo = span <= 14 ? 1 : span <= 30 ? 2 : span <= 70 ? 5 : 10;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / passo) * passo; v <= max; v += passo) ticks.push(v);

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setFator((f) => Math.min(FATOR_MAX, f + 0.25));
    else if (e.key === 'ArrowLeft') setFator((f) => Math.max(FATOR_MIN, f - 0.25));
    else if (e.key === 'ArrowUp' && !travado) setValor((v) => v + 1);
    else if (e.key === 'ArrowDown' && !travado) setValor((v) => v - 1);
    else return;
    e.preventDefault();
  };

  const copiarLink = () => {
    if (!chaveUrl) return;
    const p = new URLSearchParams(location.hash.slice(1));
    p.set(chaveUrl, `${valor},${Number(fator.toFixed(4))}`);
    navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${p.toString()}`);
  };

  const aria =
    `Reta numérica de ${menos(min)} a ${menos(max)}. A seta de ${num(valor)} multiplicada por ` +
    `${comoFracao(fator)} virou uma seta que termina em ${num(resultado)}. ${frase(fator)}.`;

  const seta = (
    de: number,
    ate: number,
    y: number,
    cor: string,
    marcador: string,
    tracejada = false,
  ) => (
    <>
      <line
        x1={x(de)}
        y1={y}
        x2={x(ate)}
        y2={y}
        stroke={cor}
        strokeWidth={tracejada ? 2 : 3}
        strokeDasharray={tracejada ? '6 4' : undefined}
        markerEnd={Math.abs(ate - de) > 0.001 ? `url(#${marcador})` : undefined}
        opacity="0.95"
      />
      <circle cx={x(de)} cy={y} r="3.5" fill={cor} />
    </>
  );

  return (
    <figure className="es">
      {titulo && <figcaption className="es-titulo">{titulo}</figcaption>}

      <div className="es-leitura">
        <span className="es-conta">
          {num(valor)} × {comoFracao(fator)} = <b>{num(resultado)}</b>
        </span>
        <span className="es-frase">{frase(fator)}</span>
      </div>

      <svg
        className="es-svg"
        viewBox={`0 0 ${L} ${A}`}
        role="img"
        tabIndex={0}
        aria-label={aria}
        onKeyDown={aoTeclar}
      >
        <defs>
          <marker id="es-pos" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="var(--azul)" />
          </marker>
          <marker id="es-neg" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="var(--vermelho)" />
          </marker>
          <marker id="es-base" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="var(--grafite)" />
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
            <text x={x(v)} y={Y + 26} className={`es-tick ${v === 0 ? 'zero' : ''}`}>
              {menos(v)}
            </text>
          </g>
        ))}

        {/* a seta de partida, sempre no lugar, pra a comparação existir */}
        {seta(0, valor, Y - 22, 'var(--grafite)', 'es-base')}
        <text x={x(valor)} y={Y - 30} className="es-rot base">
          a seta de {num(valor)}
        </text>

        {seta(
          0,
          resultado,
          Y - 58,
          resultado < 0 ? 'var(--vermelho)' : 'var(--azul)',
          resultado < 0 ? 'es-neg' : 'es-pos',
        )}
        <text
          x={x(resultado)}
          y={Y - 66}
          className={`es-rot ${resultado < 0 ? 'neg' : 'pos'}`}
        >
          {num(resultado)}
        </text>
        <line
          x1={x(resultado)}
          y1={Y - 54}
          x2={x(resultado)}
          y2={Y + 12}
          stroke={resultado < 0 ? 'var(--vermelho)' : 'var(--azul)'}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </svg>

      <div className="es-ctrl">
        <p className="es-como">
          Acima está uma seta que sai do zero, e o resultado dela multiplicada pelo fator. Aí
          embaixo você escolhe <b>por quanto multiplicar</b> e <b>de que número a seta parte</b>.
        </p>
        <div className="es-linha">
          <span className="es-etiq">multiplicar por:</span>
          <input
            className="es-slider"
            type="range"
            min={FATOR_MIN}
            max={FATOR_MAX}
            step={0.25}
            value={fator}
            onChange={(e) => setFator(+e.target.value)}
            aria-label="Fator que multiplica a seta"
          />
          <label className="es-campo">
            <input
              type="number"
              step={0.25}
              value={Number(fator.toFixed(4))}
              onChange={(e) =>
                Number.isFinite(+e.target.value) &&
                setFator(Math.min(FATOR_MAX, Math.max(FATOR_MIN, +e.target.value)))
              }
            />
          </label>
        </div>

        <div className="es-linha">
          <label className="es-campo">
            a seta parte do:
            <input
              type="number"
              value={Number(valor.toFixed(4))}
              onChange={(e) => Number.isFinite(+e.target.value) && setValor(+e.target.value)}
              readOnly={travado}
            />
          </label>
          <button className="es-btn" onClick={() => setTravado((t) => !t)} aria-pressed={travado}>
            Travar a seta de partida
          </button>
        </div>

        <p className="es-nota">
          <b>Experimenta:</b> trava a seta de partida e desce o fator devagar. Acima de 1 a seta
          estica, entre 0 e 1 ela encolhe, no 0 ela some, e do 0 pro −0,25 ela reaparece do outro
          lado, já virada. Com o desenho em foco, ← → mudam o fator e ↑ ↓ mudam a seta de partida.
          {chaveUrl && (
            <button className="es-link" onClick={copiarLink}>
              copiar link deste estado
            </button>
          )}
        </p>
      </div>

      <style>{`
        .es {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .es-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .es-leitura {
          display: flex; gap: 14px; flex-wrap: wrap; align-items: baseline;
          margin-bottom: calc(var(--u) * 0.3);
        }
        .es-conta {
          font-size: 1.15rem; color: var(--tinta); font-variant-numeric: tabular-nums;
        }
        .es-frase { font-size: 0.9rem; color: var(--tinta-media); }

        .es-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .es-svg:focus-visible { outline: 2px solid var(--azul); outline-offset: 4px; }
        .es-tick {
          font-family: var(--f-ui); font-size: 12px; fill: var(--tinta-fraca);
          text-anchor: middle;
        }
        .es-tick.zero { fill: var(--tinta); font-weight: 700; }
        .es-rot {
          font-family: var(--f-ui); font-size: 12.5px; font-weight: 700;
          text-anchor: middle;
        }
        .es-rot.pos { fill: var(--azul); }
        .es-rot.neg { fill: var(--vermelho); }
        .es-rot.base { fill: var(--grafite); font-weight: 600; font-size: 11.5px; }

        .es-ctrl {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: calc(var(--u) * 0.5); padding-top: calc(var(--u) * 0.5);
          border-top: 1px solid var(--linha);
        }
        .es-linha { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .es-etiq { font-size: 0.74rem; color: var(--tinta-fraca); }
        .es-slider { flex: 1; min-width: 140px; accent-color: var(--azul); }
        .es-campo {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.74rem; color: var(--tinta-fraca);
        }
        .es-campo input {
          width: 6ch; font: inherit; font-size: 0.82rem; color: var(--tinta);
          border: 1px solid var(--linha); border-radius: var(--raio);
          padding: 4px 5px; background: var(--papel); text-align: center;
        }
        .es-campo input:read-only { color: var(--tinta-fraca); background: var(--grafite-fraco); }
        .es-btn {
          font-family: var(--f-ui); font-size: 0.74rem;
          border: 1px solid var(--linha); background: var(--papel);
          color: var(--tinta-media); padding: 5px 11px;
          border-radius: var(--raio); cursor: pointer;
        }
        .es-btn:hover { border-color: var(--tinta); color: var(--tinta); }
        .es-btn[aria-pressed="true"] {
          background: var(--tinta); border-color: var(--tinta); color: var(--papel);
        }
        .es-btn.sutil { color: var(--tinta-fraca); }
        .es-como {
          font-size: 0.8rem; color: var(--tinta-media); margin: 0 0 2px;
        }
        .es-como b { color: var(--tinta); }
        .es-link {
          font: inherit; color: var(--tinta-fraca); background: none;
          border: 0; padding: 0 0 0 8px; text-decoration: underline; cursor: pointer;
        }
        .es-link:hover { color: var(--tinta); }
        .es-nota b { color: var(--tinta-media); }
        .es-nota {
          font-family: var(--f-ui); font-size: 0.74rem; color: var(--tinta-fraca);
          margin: calc(var(--u) * 0.4) 0 0;
        }
      `}</style>
    </figure>
  );
}
