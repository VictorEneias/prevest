import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* <RetaZoom /> — a reta com a escala na mão do aluno.
 *
 * O ponto da figura é que a escala é escolha nossa e não propriedade do número:
 * afastando cabe do 0 ao 100, aproximando aparece quem mora entre o 1 e o 2, e
 * a reta é a mesma nos dois casos. Por isso o passo entre as marcas fica escrito
 * embaixo, senão o aluno olha só o desenho e não percebe que ele mudou.
 *
 * Arrastar anda pelos números e o slider muda o zoom. Dá pra travar o centro
 * pra mexer numa coisa de cada vez, que é o caso em que o aluno separa "andei"
 * de "aproximei". */

export interface RetaZoomProps {
  /** Número no meio da tela. */
  centro?: number;
  /** Quantos números cabem na tela de uma vez. */
  janela?: number;
  titulo?: string;
  /** Guarda o estado no hash da URL, pra eu salvar a configuração da aula. */
  chaveUrl?: string;
}

const L = 720;
const A = 150;
const Y = 80;
const MARGEM = 34;

const JANELA_MIN = 0.4;
const JANELA_MAX = 400;
const POSTOS = 1000; // resolução do slider

const lnMin = Math.log(JANELA_MIN);
const lnMax = Math.log(JANELA_MAX);
const posDeJanela = (j: number) => POSTOS * (1 - (Math.log(j) - lnMin) / (lnMax - lnMin));
const janelaDePos = (p: number) => Math.exp(lnMin + (1 - p / POSTOS) * (lnMax - lnMin));

/** Passo redondo (1, 2 ou 5 vezes potência de dez) pra caber ~9 rótulos. */
const passoBonito = (bruto: number) => {
  const base = Math.pow(10, Math.floor(Math.log10(bruto)));
  const f = bruto / base;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * base;
};

const casasDe = (passo: number) => Math.max(0, -Math.floor(Math.log10(passo) + 1e-9));
const fmt = (n: number, casas: number) =>
  (Math.abs(n) < 1e-9 ? 0 : n).toFixed(casas).replace('.', ',').replace('-', '−');

const PRESETS: { nome: string; centro: number; janela: number }[] = [
  { nome: 'Do 0 ao 100', centro: 50, janela: 110 },
  { nome: 'Os dois lados do zero', centro: 0, janela: 20 },
  { nome: 'Entre o 1 e o 2', centro: 1.5, janela: 1.4 },
];

export default function RetaZoom({
  centro: centroInicial = 0,
  janela: janelaInicial = 20,
  titulo,
  chaveUrl,
}: RetaZoomProps) {
  const [centro, setCentro] = useState(centroInicial);
  const [janela, setJanela] = useState(janelaInicial);
  const [travado, setTravado] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [congelada, setCongelada] = useState<{ min: number; max: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const arraste = useRef<{ x: number; centro: number } | null>(null);

  /* ---- restaura o estado da URL, pra a configuração do preparo voltar ---- */
  useEffect(() => {
    if (!chaveUrl) return;
    const bruto = new URLSearchParams(location.hash.slice(1)).get(chaveUrl);
    if (!bruto) return;
    const [c, j] = bruto.split(',').map(Number);
    if (Number.isFinite(c)) setCentro(c);
    if (Number.isFinite(j)) setJanela(Math.min(JANELA_MAX, Math.max(JANELA_MIN, j)));
  }, [chaveUrl]);

  const min = centro - janela / 2;
  const max = centro + janela / 2;
  const x = useCallback(
    (v: number) => MARGEM + ((v - min) / (max - min)) * (L - 2 * MARGEM),
    [min, max],
  );

  const passo = useMemo(() => passoBonito(janela / 9), [janela]);
  const casas = casasDe(passo);

  /* Marca menor só entra se sobrar pelo menos 6px entre elas, senão vira borrão. */
  const marcas = useMemo(() => {
    const larguraUtil = L - 2 * MARGEM;
    const menor = (passo / 5 / janela) * larguraUtil >= 6 ? passo / 5 : passo;
    const eps = menor * 1e-6;
    const out: { v: number; rotulada: boolean; forte: boolean }[] = [];
    for (let i = Math.ceil((min - eps) / menor); i * menor <= max + eps; i++) {
      const v = i * menor;
      const rotulada = Math.abs(v / passo - Math.round(v / passo)) < 1e-6;
      // com passo abaixo de 1 os inteiros viram os pontos de referência da tela
      const inteiro = Math.abs(v - Math.round(v)) < eps;
      out.push({ v, rotulada, forte: Math.abs(v) < eps || (passo < 1 && inteiro) });
    }
    return out;
  }, [min, max, passo, janela]);

  /* ---- arrastar pra andar pelos números ---- */
  const unidadesPorPixel = () => {
    const r = svgRef.current?.getBoundingClientRect();
    const utilPx = r && r.width ? (r.width * (L - 2 * MARGEM)) / L : L - 2 * MARGEM;
    return janela / utilPx;
  };

  const aoDescer = (e: React.PointerEvent) => {
    if (travado) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    arraste.current = { x: e.clientX, centro };
    setArrastando(true);
  };
  const aoMover = (e: React.PointerEvent) => {
    if (!arraste.current) return;
    setCentro(arraste.current.centro - (e.clientX - arraste.current.x) * unidadesPorPixel());
  };
  const aoSoltar = () => {
    arraste.current = null;
    setArrastando(false);
  };

  const zoom = (fator: number) =>
    setJanela((j) => Math.min(JANELA_MAX, Math.max(JANELA_MIN, j * fator)));

  const aoTeclar = (e: React.KeyboardEvent) => {
    const passoTecla = janela / 10;
    if (e.key === 'ArrowLeft' && !travado) setCentro((c) => c - passoTecla);
    else if (e.key === 'ArrowRight' && !travado) setCentro((c) => c + passoTecla);
    else if (e.key === 'ArrowUp' || e.key === '+') zoom(1 / 1.6);
    else if (e.key === 'ArrowDown' || e.key === '-') zoom(1.6);
    else return;
    e.preventDefault();
  };

  const copiarLink = () => {
    if (!chaveUrl) return;
    const p = new URLSearchParams(location.hash.slice(1));
    p.set(chaveUrl, `${centro.toFixed(3)},${janela.toFixed(3)}`);
    navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${p.toString()}`);
  };

  const aria =
    `Reta numérica mostrando de ${fmt(min, casas)} a ${fmt(max, casas)}. ` +
    `Cada marca rotulada vale ${fmt(passo, casas)}.`;

  return (
    <figure className="rz">
      {titulo && <figcaption className="rz-titulo">{titulo}</figcaption>}

      <div className="rz-leitura">
        <span>
          Você está vendo de <b>{fmt(min, casas)}</b> até <b>{fmt(max, casas)}</b>
        </span>
        <span className="rz-passo">
          cada marca com número vale <b>{fmt(passo, casas)}</b>
        </span>
      </div>

      <svg
        ref={svgRef}
        className={`rz-svg ${arrastando ? 'arrastando' : ''} ${travado ? 'travado' : ''}`}
        viewBox={`0 0 ${L} ${A}`}
        role="img"
        tabIndex={0}
        aria-label={aria}
        onPointerDown={aoDescer}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onKeyDown={aoTeclar}
      >
        <line x1={0} y1={Y} x2={L} y2={Y} stroke="var(--tinta)" strokeWidth="1.5" />

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
                className={`rz-tick ${m.forte ? 'forte' : ''}`}
              >
                {fmt(m.v, casas)}
              </text>
            )}
          </g>
        ))}

        {/* a janela de antes, pra comparar com a de agora */}
        {congelada && (
          <g className="rz-congelada">
            <line
              x1={Math.max(2, x(congelada.min))}
              y1={Y + 44}
              x2={Math.min(L - 2, x(congelada.max))}
              y2={Y + 44}
              stroke="var(--tinta-fraca)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <text x={L / 2} y={Y + 62} textAnchor="middle" className="rz-tick">
              janela de antes: de {fmt(congelada.min, casas)} até {fmt(congelada.max, casas)}
            </text>
          </g>
        )}
      </svg>

      <div className="rz-ctrl">
        <div className="rz-linha">
          <button className="rz-btn" onClick={() => zoom(1.6)} aria-label="Afastar">
            −
          </button>
          <input
            className="rz-slider"
            type="range"
            min={0}
            max={POSTOS}
            value={posDeJanela(janela)}
            onChange={(e) => setJanela(janelaDePos(Number(e.target.value)))}
            aria-label="Escala: afastar ou aproximar"
          />
          <button className="rz-btn" onClick={() => zoom(1 / 1.6)} aria-label="Aproximar">
            +
          </button>
        </div>

        <div className="rz-linha">
          <label className="rz-campo">
            centro
            <input
              type="number"
              value={Number(centro.toFixed(casas + 1))}
              step={passo}
              onChange={(e) => Number.isFinite(+e.target.value) && setCentro(+e.target.value)}
              readOnly={travado}
            />
          </label>
          <label className="rz-campo">
            largura
            <input
              type="number"
              value={Number(janela.toFixed(2))}
              step={passo}
              min={JANELA_MIN}
              max={JANELA_MAX}
              onChange={(e) => {
                const v = +e.target.value;
                if (Number.isFinite(v)) setJanela(Math.min(JANELA_MAX, Math.max(JANELA_MIN, v)));
              }}
            />
          </label>
          <button className="rz-btn" onClick={() => setTravado((t) => !t)} aria-pressed={travado}>
            Travar o centro
          </button>
          <button
            className="rz-btn"
            onClick={() => setCongelada(congelada ? null : { min, max })}
            aria-pressed={!!congelada}
          >
            {congelada ? 'Soltar' : 'Congelar'}
          </button>
        </div>

        <div className="rz-linha">
          {PRESETS.map((p) => (
            <button
              key={p.nome}
              className="rz-btn"
              onClick={() => {
                setCentro(p.centro);
                setJanela(p.janela);
              }}
            >
              {p.nome}
            </button>
          ))}
          <button
            className="rz-btn"
            onClick={() => {
              setCentro(centroInicial);
              setJanela(janelaInicial);
              setCongelada(null);
              setTravado(false);
            }}
          >
            Recomeçar
          </button>
          {chaveUrl && (
            <button className="rz-btn sutil" onClick={copiarLink} title="Copiar link com esta configuração">
              Copiar link
            </button>
          )}
        </div>
      </div>

      <p className="rz-nota">
        Arraste a reta pros lados pra andar pelos números. Com o desenho em foco, as setas ← →
        andam e ↑ ↓ mudam a escala.
      </p>

      <style>{`
        .rz {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .rz-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .rz-leitura {
          display: flex; gap: 14px; flex-wrap: wrap; align-items: baseline;
          font-size: 0.95rem; color: var(--tinta-media);
          font-variant-numeric: tabular-nums;
          margin-bottom: calc(var(--u) * 0.3);
        }
        .rz-leitura b { color: var(--tinta); }
        .rz-passo { color: var(--tinta-fraca); font-size: 0.86rem; }

        .rz-svg {
          width: 100%; height: auto; display: block; overflow: visible;
          cursor: grab; touch-action: none;
        }
        .rz-svg.arrastando { cursor: grabbing; }
        .rz-svg.travado { cursor: default; }
        .rz-svg:focus-visible { outline: 2px solid var(--azul); outline-offset: 4px; }
        .rz-tick { font-family: var(--f-ui); font-size: 12px; fill: var(--tinta-fraca); }
        .rz-tick.forte { fill: var(--tinta); font-weight: 700; }

        .rz-ctrl {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: calc(var(--u) * 0.5); padding-top: calc(var(--u) * 0.5);
          border-top: 1px solid var(--linha);
        }
        .rz-linha { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .rz-slider { flex: 1; min-width: 140px; accent-color: var(--azul); }
        .rz-campo {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.74rem; color: var(--tinta-fraca);
        }
        .rz-campo input {
          width: 6ch; font: inherit; font-size: 0.82rem; color: var(--tinta);
          border: 1px solid var(--linha); border-radius: var(--raio);
          padding: 4px 5px; background: var(--papel); text-align: center;
        }
        /* travado fica cinza mas continua focável, senão o aluno de teclado perde o campo do meio da fila */
        .rz-campo input:read-only { color: var(--tinta-fraca); background: var(--grafite-fraco); }
        .rz-btn {
          font-family: var(--f-ui); font-size: 0.74rem;
          border: 1px solid var(--linha); background: var(--papel);
          color: var(--tinta-media); padding: 5px 11px;
          border-radius: var(--raio); cursor: pointer;
        }
        .rz-btn:hover { border-color: var(--tinta); color: var(--tinta); }
        .rz-btn[aria-pressed="true"] {
          background: var(--tinta); border-color: var(--tinta); color: var(--papel);
        }
        .rz-btn.sutil { color: var(--tinta-fraca); }
        .rz-nota {
          font-family: var(--f-ui); font-size: 0.74rem; color: var(--tinta-fraca);
          margin: calc(var(--u) * 0.4) 0 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .rz-svg, .rz-btn { transition: none; }
        }
      `}</style>
    </figure>
  );
}
