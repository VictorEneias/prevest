import { useEffect, useRef, useState } from 'react';

/* <Coordenadas /> — o ponto que o aluno arrasta, e o par ordenado respondendo.
 *
 * A aula de plano cartesiano vive de uma coisa que desenho parado não mostra: o
 * par muda quando o ponto anda. Arrastando, o aluno vê o primeiro número reagir
 * ao movimento horizontal e o segundo ao vertical, e o sinal de cada um virar
 * junto com a travessia do eixo, que é de onde o quadrante sai.
 *
 * Os dois botões ligam jeitos de ver, e não fazem conta: o caminho mostra a
 * ordem em que o par é lido, e os espelhos põem os três simétricos na tela pro
 * aluno descobrir sozinho qual sinal troca em cada reflexão. */

export interface CoordenadasProps {
  /** Onde o ponto começa. */
  x?: number;
  y?: number;
  /** O quadrado que aparece. Padrão: de −6 a 6 nos dois eixos. */
  dominio?: [number, number];
  /** Começa com o caminho do zero até o ponto desenhado. */
  caminho?: boolean;
  /** Começa com os três pontos espelhados na tela. */
  espelhos?: boolean;
  titulo?: string;
  /** Guarda o estado no hash da URL, pra eu salvar a configuração da aula. */
  chaveUrl?: string;
}

const L = 640;
const MARGEM = 34;
const PASSO_ARRASTE = 0.5;

const menos = (s: string | number) => String(s).replace(/-/g, '−');
const num = (n: number) => menos(String(Number(n.toFixed(2)))).replace('.', ',');

/* com coordenada quebrada o par vira "(2,5, −1)" e ninguém sabe onde um número
   acaba e o outro começa, então aí o separador passa a ser ponto e vírgula */
const parOrdenado = (x: number, y: number) =>
  Number.isInteger(x) && Number.isInteger(y) ? `(${num(x)}, ${num(y)})` : `(${num(x)}; ${num(y)})`;

const ondeEsta = (x: number, y: number) => {
  if (x === 0 && y === 0) return 'na origem, que é onde os dois eixos se cruzam';
  if (y === 0) return `sobre o eixo x, ${x > 0 ? 'à direita' : 'à esquerda'} da origem`;
  if (x === 0) return `sobre o eixo y, ${y > 0 ? 'acima' : 'abaixo'} da origem`;
  if (x > 0 && y > 0) return '1º quadrante: x positivo e y positivo';
  if (x < 0 && y > 0) return '2º quadrante: x negativo e y positivo';
  if (x < 0 && y < 0) return '3º quadrante: x negativo e y negativo';
  return '4º quadrante: x positivo e y negativo';
};

export default function Coordenadas({
  x: xInicial = 3,
  y: yInicial = 2,
  dominio = [-6, 6],
  caminho: caminhoInicial = false,
  espelhos: espelhosInicial = false,
  titulo,
  chaveUrl,
}: CoordenadasProps) {
  const [min, max] = dominio;
  const trava = (v: number) => Math.min(max, Math.max(min, Math.round(v / PASSO_ARRASTE) * PASSO_ARRASTE));

  const [x, setX] = useState(trava(xInicial));
  const [y, setY] = useState(trava(yInicial));
  const [caminho, setCaminho] = useState(caminhoInicial);
  const [espelhos, setEspelhos] = useState(espelhosInicial);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chaveUrl) return;
    const bruto = new URLSearchParams(location.hash.slice(1)).get(chaveUrl);
    if (!bruto) return;
    const [vx, vy, c, e] = bruto.split(',');
    if (Number.isFinite(+vx)) setX(trava(+vx));
    if (Number.isFinite(+vy)) setY(trava(+vy));
    if (c !== undefined) setCaminho(c === '1');
    if (e !== undefined) setEspelhos(e === '1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveUrl]);

  const esc = (L - 2 * MARGEM) / (max - min);
  const A = L;
  const px = (v: number) => MARGEM + (v - min) * esc;
  const py = (v: number) => A - MARGEM - (v - min) * esc;

  const marcas: number[] = [];
  for (let v = Math.ceil(min); v <= max; v++) marcas.push(v);

  const doPonteiro = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const k = L / r.width;
    setX(trava(min + ((e.clientX - r.left) * k - MARGEM) / esc));
    setY(trava(min + (A - MARGEM - (e.clientY - r.top) * k) / esc));
  };

  const arrastar = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    doPonteiro(e);
  };

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setX((v) => trava(v + PASSO_ARRASTE));
    else if (e.key === 'ArrowLeft') setX((v) => trava(v - PASSO_ARRASTE));
    else if (e.key === 'ArrowUp') setY((v) => trava(v + PASSO_ARRASTE));
    else if (e.key === 'ArrowDown') setY((v) => trava(v - PASSO_ARRASTE));
    else return;
    e.preventDefault();
  };

  const copiarLink = () => {
    if (!chaveUrl) return;
    const p = new URLSearchParams(location.hash.slice(1));
    p.set(chaveUrl, `${x},${y},${caminho ? 1 : 0},${espelhos ? 1 : 0}`);
    navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${p.toString()}`);
  };

  const reflexos = [
    { rot: 'espelho no eixo y', x: -x, y, cor: 'var(--bloco-2)' },
    { rot: 'espelho no eixo x', x, y: -y, cor: 'var(--bloco-1)' },
    { rot: 'meia volta pela origem', x: -x, y: -y, cor: 'var(--bloco-3)' },
  ];

  const aria =
    `Plano cartesiano de ${menos(min)} a ${menos(max)} nos dois eixos. O ponto P está em ` +
    `${parOrdenado(x, y)}, ${ondeEsta(x, y)}.` +
    (espelhos
      ? ` Os espelhos estão na tela: ${reflexos.map((r) => `${r.rot} em ${parOrdenado(r.x, r.y)}`).join(', ')}.`
      : '');

  const corX = x < 0 ? 'var(--vermelho)' : 'var(--azul)';
  const corY = y < 0 ? 'var(--vermelho)' : 'var(--azul)';

  return (
    <figure className="cd">
      {titulo && <figcaption className="cd-titulo">{titulo}</figcaption>}

      <div className="cd-leitura">
        <span className="cd-par">
          P = <b>{parOrdenado(x, y)}</b>
        </span>
        <span className="cd-frase">{ondeEsta(x, y)}</span>
      </div>

      <svg
        ref={svgRef}
        className="cd-svg"
        viewBox={`0 0 ${L} ${A}`}
        role="img"
        tabIndex={0}
        aria-label={aria}
        onKeyDown={aoTeclar}
        onPointerDown={arrastar}
        onPointerMove={(e) => e.buttons === 1 && doPonteiro(e)}
      >
        <defs>
          <marker id="cd-seta-x" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill={corX} />
          </marker>
          <marker id="cd-seta-y" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill={corY} />
          </marker>
        </defs>

        {marcas.map((v) => (
          <g key={v}>
            <line x1={px(v)} y1={MARGEM} x2={px(v)} y2={A - MARGEM} className="cd-grade" />
            <line x1={MARGEM} y1={py(v)} x2={L - MARGEM} y2={py(v)} className="cd-grade" />
          </g>
        ))}

        <line x1={MARGEM - 10} y1={py(0)} x2={L - MARGEM + 10} y2={py(0)} className="cd-eixo" />
        <line x1={px(0)} y1={A - MARGEM + 10} x2={px(0)} y2={MARGEM - 10} className="cd-eixo" />
        <text x={L - MARGEM + 4} y={py(0) - 12} className="cd-eixo-nome">x</text>
        <text x={px(0) + 12} y={MARGEM - 4} className="cd-eixo-nome">y</text>

        {marcas.map((v) =>
          v === 0 ? null : (
            <g key={`t${v}`}>
              <text x={px(v)} y={py(0) + 17} textAnchor="middle" className="cd-tick">
                {menos(v)}
              </text>
              <text x={px(0) - 7} y={py(v) + 4} textAnchor="end" className="cd-tick">
                {menos(v)}
              </text>
            </g>
          ),
        )}
        <text x={px(0) - 7} y={py(0) + 17} textAnchor="end" className="cd-tick">0</text>

        {caminho && (
          <>
            <line
              x1={px(0)}
              y1={py(0)}
              x2={px(x)}
              y2={py(0)}
              stroke={corX}
              strokeWidth="3"
              markerEnd={x !== 0 ? 'url(#cd-seta-x)' : undefined}
            />
            <line
              x1={px(x)}
              y1={py(0)}
              x2={px(x)}
              y2={py(y)}
              stroke={corY}
              strokeWidth="3"
              markerEnd={y !== 0 ? 'url(#cd-seta-y)' : undefined}
            />
            {x !== 0 && (
              <text x={px(x / 2)} y={py(0) - 9} textAnchor="middle" className="cd-passo" fill={corX}>
                1º: anda {num(x)} {x > 0 ? 'pra direita' : 'pra esquerda'}
              </text>
            )}
            {y !== 0 && (
              <text x={px(x) + 9} y={py(y / 2)} className="cd-passo" fill={corY}>
                2º: {y > 0 ? 'sobe' : 'desce'} {num(Math.abs(y))}
              </text>
            )}
          </>
        )}

        {espelhos &&
          reflexos.map((r) => (
            <g key={r.rot}>
              <circle cx={px(r.x)} cy={py(r.y)} r="6" fill="var(--papel)" stroke={r.cor} strokeWidth="2.5" />
              <text x={px(r.x)} y={py(r.y) - 13} textAnchor="middle" className="cd-espelho" fill={r.cor}>
                {parOrdenado(r.x, r.y)}
              </text>
            </g>
          ))}

        <line x1={px(x)} y1={py(y)} x2={px(x)} y2={py(0)} className="cd-guia" />
        <line x1={px(x)} y1={py(y)} x2={px(0)} y2={py(y)} className="cd-guia" />
        <circle cx={px(x)} cy={py(0)} r="4" className="cd-proj" />
        <circle cx={px(0)} cy={py(y)} r="4" className="cd-proj" />

        <circle cx={px(x)} cy={py(y)} r="8" className="cd-ponto" />
        {/* perto da borda direita o nome vira pro outro lado da bolinha, senão
            ele sai do quadro e vaza por cima da moldura do cartão */}
        <text
          x={px(x) + (x > max - 2.5 ? -13 : 13)}
          y={py(y) + (y > max - 0.5 ? 20 : -11)}
          textAnchor={x > max - 2.5 ? 'end' : 'start'}
          className="cd-rot"
        >
          P {parOrdenado(x, y)}
        </text>
      </svg>

      <div className="cd-ctrl">
        <p className="cd-como">
          Acima está o ponto <b>P</b>, e você pode <b>arrastar ele com o dedo ou com o mouse</b>. Os
          dois sliders fazem a mesma coisa separado: um anda só na horizontal, o outro só na
          vertical.
        </p>

        <div className="cd-linha">
          <span className="cd-etiq">anda pro lado (x):</span>
          <input
            className="cd-slider"
            type="range"
            min={min}
            max={max}
            step={PASSO_ARRASTE}
            value={x}
            onChange={(e) => setX(trava(+e.target.value))}
            aria-label="Coordenada x do ponto"
          />
          <label className="cd-campo">
            <input
              type="number"
              step={PASSO_ARRASTE}
              value={x}
              onChange={(e) => Number.isFinite(+e.target.value) && setX(trava(+e.target.value))}
            />
          </label>
        </div>

        <div className="cd-linha">
          <span className="cd-etiq">sobe e desce (y):</span>
          <input
            className="cd-slider"
            type="range"
            min={min}
            max={max}
            step={PASSO_ARRASTE}
            value={y}
            onChange={(e) => setY(trava(+e.target.value))}
            aria-label="Coordenada y do ponto"
          />
          <label className="cd-campo">
            <input
              type="number"
              step={PASSO_ARRASTE}
              value={y}
              onChange={(e) => Number.isFinite(+e.target.value) && setY(trava(+e.target.value))}
            />
          </label>
        </div>

        <div className="cd-linha">
          <button className="cd-btn" onClick={() => setCaminho((v) => !v)} aria-pressed={caminho}>
            Mostrar o caminho do zero até P
          </button>
          <button className="cd-btn" onClick={() => setEspelhos((v) => !v)} aria-pressed={espelhos}>
            Mostrar os espelhos
          </button>
        </div>

        {espelhos && (
          <ul className="cd-lista">
            {reflexos.map((r) => (
              <li key={r.rot}>
                <span className="cd-bolinha" style={{ borderColor: r.cor }} />
                {r.rot}: <b>{parOrdenado(r.x, r.y)}</b>
              </li>
            ))}
          </ul>
        )}

        <p className="cd-nota">
          <b>Experimenta:</b> segura o y parado e arrasta o P só pra esquerda, atravessando o eixo
          y, e olha qual dos dois números do par troca de sinal. Depois liga os espelhos e faz o
          mesmo: cada espelho troca um sinal, e um deles troca os dois. Com o desenho em foco, ← →
          andam pro lado e ↑ ↓ sobem e descem, de meio em meio.
          {chaveUrl && (
            <button className="cd-link" onClick={copiarLink}>
              copiar link deste estado
            </button>
          )}
        </p>
      </div>

      <style>{`
        .cd {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .cd-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .cd-leitura {
          display: flex; gap: 14px; flex-wrap: wrap; align-items: baseline;
          margin-bottom: calc(var(--u) * 0.3);
        }
        .cd-par { font-size: 1.15rem; color: var(--tinta); font-variant-numeric: tabular-nums; }
        .cd-frase { font-size: 0.9rem; color: var(--tinta-media); }

        .cd-svg {
          width: 100%; height: auto; display: block; margin: 0 auto;
          max-width: 58vh; overflow: visible; touch-action: none; cursor: crosshair;
        }
        .cd-svg:focus-visible { outline: 2px solid var(--azul); outline-offset: 4px; }
        .cd-grade { stroke: var(--grade-forte); stroke-width: 1; }
        .cd-eixo { stroke: var(--tinta); stroke-width: 1.5; }
        .cd-eixo-nome { font-size: 15px; font-style: italic; fill: var(--tinta); }
        .cd-tick { font-size: 11.5px; fill: var(--tinta-fraca); }
        .cd-ponto { fill: var(--azul); stroke: var(--papel); stroke-width: 2; }
        .cd-proj { fill: var(--tinta-fraca); }
        .cd-guia { stroke: var(--tinta-fraca); stroke-width: 1.5; stroke-dasharray: 4 4; }
        .cd-rot { font-size: 14px; font-weight: 700; fill: var(--azul); }
        .cd-passo { font-size: 12.5px; font-weight: 600; }
        .cd-espelho { font-size: 12.5px; font-weight: 700; }

        .cd-ctrl {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: calc(var(--u) * 0.5); padding-top: calc(var(--u) * 0.5);
          border-top: 1px solid var(--linha);
        }
        .cd-linha { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .cd-etiq { font-size: 0.74rem; color: var(--tinta-fraca); min-width: 11ch; }
        .cd-slider { flex: 1; min-width: 140px; accent-color: var(--azul); }
        .cd-campo { display: inline-flex; align-items: center; gap: 5px; }
        .cd-campo input {
          width: 6ch; font: inherit; font-size: 0.82rem; color: var(--tinta);
          border: 1px solid var(--linha); border-radius: var(--raio);
          padding: 4px 5px; background: var(--papel); text-align: center;
        }
        .cd-btn {
          font-family: var(--f-ui); font-size: 0.74rem;
          border: 1px solid var(--linha); background: var(--papel);
          color: var(--tinta-media); padding: 5px 11px;
          border-radius: var(--raio); cursor: pointer;
        }
        .cd-btn:hover { border-color: var(--tinta); color: var(--tinta); }
        .cd-btn[aria-pressed="true"] {
          background: var(--tinta); border-color: var(--tinta); color: var(--papel);
        }
        .cd-lista {
          list-style: none; margin: 0; padding: 0;
          display: flex; gap: 14px; flex-wrap: wrap;
          font-size: 0.78rem; color: var(--tinta-media);
        }
        .cd-lista b { color: var(--tinta); font-variant-numeric: tabular-nums; }
        .cd-bolinha {
          display: inline-block; width: 9px; height: 9px; margin-right: 5px;
          border: 2.5px solid; border-radius: 50%; vertical-align: baseline;
        }
        .cd-como { font-size: 0.8rem; color: var(--tinta-media); margin: 0 0 2px; }
        .cd-como b { color: var(--tinta); }
        .cd-nota {
          font-family: var(--f-ui); font-size: 0.74rem; color: var(--tinta-fraca);
          margin: calc(var(--u) * 0.4) 0 0;
        }
        .cd-nota b { color: var(--tinta-media); }
        .cd-link {
          font: inherit; color: var(--tinta-fraca); background: none;
          border: 0; padding: 0 0 0 8px; text-decoration: underline; cursor: pointer;
        }
        .cd-link:hover { color: var(--tinta); }
      `}</style>
    </figure>
  );
}
