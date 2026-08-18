import { useEffect, useState } from 'react';

/* <Retangulo /> — a comutatividade como um desenho que gira.
 *
 * Bolinhas em linha e coluna: contar por linha dá 4+4+4 e contar por coluna dá
 * 3+3+3+3, e o botão de girar mostra que virar a cabeça não cria nem destrói
 * bolinha. É a demonstração honesta de 3×4 = 4×3, e é a mesma figura que volta
 * na área do retângulo, então ela nasce genérica de propósito.
 *
 * Antes isso era um bloco de ● no meio do texto, e o desenho estático não
 * conseguia mostrar o giro, que é justamente o argumento. */

export interface RetanguloProps {
  linhas?: number;
  colunas?: number;
  titulo?: string;
  /** Guarda o estado no hash da URL, pra eu salvar a configuração da aula. */
  chaveUrl?: string;
}

const L = 720;
const MARGEM = 40;
const MAX = 12;
const PASSO_MAX = 44;

const PRESETS: { nome: string; l: number; c: number }[] = [
  { nome: '3 por 4', l: 3, c: 4 },
  { nome: '4 por 3', l: 4, c: 3 },
  { nome: 'Uma fila só', l: 1, c: 9 },
  { nome: 'Quadrado', l: 6, c: 6 },
];

const trava = (n: number) => Math.min(MAX, Math.max(1, Math.round(n)));

/** 4 + 4 + 4, e com muitas parcelas vira "4 + … + 4, 9 vezes". */
const soma = (quanto: number, vezes: number) =>
  vezes <= 8
    ? Array(vezes).fill(quanto).join(' + ')
    : `${quanto} + ${quanto} + … + ${quanto}  (${vezes} vezes)`;

export default function Retangulo({
  linhas: linhasIniciais = 3,
  colunas: colunasIniciais = 4,
  titulo,
  chaveUrl,
}: RetanguloProps) {
  const [linhas, setLinhas] = useState(trava(linhasIniciais));
  const [colunas, setColunas] = useState(trava(colunasIniciais));
  const [contando, setContando] = useState<'linha' | 'coluna' | null>(null);
  const [congelado, setCongelado] = useState<{ l: number; c: number } | null>(null);

  useEffect(() => {
    if (!chaveUrl) return;
    const bruto = new URLSearchParams(location.hash.slice(1)).get(chaveUrl);
    if (!bruto) return;
    const [l, c] = bruto.split(',').map(Number);
    if (Number.isFinite(l)) setLinhas(trava(l));
    if (Number.isFinite(c)) setColunas(trava(c));
  }, [chaveUrl]);

  const total = linhas * colunas;
  const passo = Math.min(PASSO_MAX, (L - 2 * MARGEM) / Math.max(colunas, 6));
  const largura = (colunas - 1) * passo;
  const x0 = (L - largura) / 2;
  const y0 = 34;
  const A = y0 + (linhas - 1) * passo + 58;

  const girar = () => {
    setLinhas(colunas);
    setColunas(linhas);
  };

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setColunas((c) => trava(c - 1));
    else if (e.key === 'ArrowRight') setColunas((c) => trava(c + 1));
    else if (e.key === 'ArrowUp') setLinhas((l) => trava(l - 1));
    else if (e.key === 'ArrowDown') setLinhas((l) => trava(l + 1));
    else if (e.key === 'g' || e.key === 'G') girar();
    else return;
    e.preventDefault();
  };

  const copiarLink = () => {
    if (!chaveUrl) return;
    const p = new URLSearchParams(location.hash.slice(1));
    p.set(chaveUrl, `${linhas},${colunas}`);
    navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${p.toString()}`);
  };

  const aria =
    `Retângulo de bolinhas com ${linhas} ${linhas === 1 ? 'linha' : 'linhas'} e ` +
    `${colunas} ${colunas === 1 ? 'coluna' : 'colunas'}, ${total} bolinhas no total.` +
    (contando === 'linha'
      ? ` Contando por linha: ${linhas} vezes ${colunas}.`
      : contando === 'coluna'
        ? ` Contando por coluna: ${colunas} vezes ${linhas}.`
        : '');

  return (
    <figure className="rt">
      {titulo && <figcaption className="rt-titulo">{titulo}</figcaption>}

      <div className="rt-leitura">
        <span className="rt-conta">
          {linhas} × {colunas} = <b>{total}</b>
        </span>
        {contando === 'linha' && (
          <span className="rt-soma">
            por linha: {soma(colunas, linhas)} = {total}
          </span>
        )}
        {contando === 'coluna' && (
          <span className="rt-soma">
            por coluna: {soma(linhas, colunas)} = {total}
          </span>
        )}
        {congelado && (
          <span className="rt-antes">
            antes: {congelado.l} × {congelado.c} = {congelado.l * congelado.c}
          </span>
        )}
      </div>

      <svg
        className="rt-svg"
        viewBox={`0 0 ${L} ${A}`}
        role="img"
        tabIndex={0}
        aria-label={aria}
        onKeyDown={aoTeclar}
      >
        {contando === 'linha' &&
          Array.from({ length: linhas }, (_, i) => (
            <rect
              key={`fl${i}`}
              x={x0 - passo * 0.42}
              y={y0 + i * passo - passo * 0.42}
              width={largura + passo * 0.84}
              height={passo * 0.84}
              rx="6"
              className={`rt-faixa ${i % 2 ? 'par' : 'impar'}`}
            />
          ))}
        {contando === 'coluna' &&
          Array.from({ length: colunas }, (_, j) => (
            <rect
              key={`fc${j}`}
              x={x0 + j * passo - passo * 0.42}
              y={y0 - passo * 0.42}
              width={passo * 0.84}
              height={(linhas - 1) * passo + passo * 0.84}
              rx="6"
              className={`rt-faixa ${j % 2 ? 'par' : 'impar'}`}
            />
          ))}

        {Array.from({ length: linhas }, (_, i) =>
          Array.from({ length: colunas }, (_, j) => (
            <circle
              key={`${i}-${j}`}
              cx={x0 + j * passo}
              cy={y0 + i * passo}
              r={Math.min(9, passo * 0.24)}
              className="rt-bola"
            />
          )),
        )}

        {/* as contagens de fora: quantas linhas de um lado, quantas colunas de baixo */}
        <text x={x0 - passo * 0.75} y={y0 + ((linhas - 1) * passo) / 2 + 5} className="rt-eixo">
          {linhas}
        </text>
        <text x={x0 + largura / 2} y={y0 + (linhas - 1) * passo + passo * 0.95} className="rt-eixo">
          {colunas}
        </text>
      </svg>

      <div className="rt-ctrl">
        <div className="rt-linha">
          <label className="rt-campo">
            linhas
            <input
              className="rt-slider"
              type="range"
              min={1}
              max={MAX}
              value={linhas}
              onChange={(e) => setLinhas(trava(+e.target.value))}
              aria-label="Quantidade de linhas"
            />
            <input
              type="number"
              min={1}
              max={MAX}
              value={linhas}
              onChange={(e) => setLinhas(trava(+e.target.value))}
            />
          </label>
        </div>
        <div className="rt-linha">
          <label className="rt-campo">
            colunas
            <input
              className="rt-slider"
              type="range"
              min={1}
              max={MAX}
              value={colunas}
              onChange={(e) => setColunas(trava(+e.target.value))}
              aria-label="Quantidade de colunas"
            />
            <input
              type="number"
              min={1}
              max={MAX}
              value={colunas}
              onChange={(e) => setColunas(trava(+e.target.value))}
            />
          </label>
        </div>

        <div className="rt-linha">
          <button
            className="rt-btn"
            onClick={() => setContando(contando === 'linha' ? null : 'linha')}
            aria-pressed={contando === 'linha'}
          >
            Contar por linha
          </button>
          <button
            className="rt-btn"
            onClick={() => setContando(contando === 'coluna' ? null : 'coluna')}
            aria-pressed={contando === 'coluna'}
          >
            Contar por coluna
          </button>
          <button className="rt-btn" onClick={girar}>
            Girar a cabeça
          </button>
          <button
            className="rt-btn"
            onClick={() => setCongelado(congelado ? null : { l: linhas, c: colunas })}
            aria-pressed={!!congelado}
          >
            {congelado ? 'Soltar' : 'Congelar'}
          </button>
        </div>

        <div className="rt-linha">
          {PRESETS.map((p) => (
            <button
              key={p.nome}
              className="rt-btn"
              onClick={() => {
                setLinhas(p.l);
                setColunas(p.c);
              }}
            >
              {p.nome}
            </button>
          ))}
          <button
            className="rt-btn"
            onClick={() => {
              setLinhas(trava(linhasIniciais));
              setColunas(trava(colunasIniciais));
              setContando(null);
              setCongelado(null);
            }}
          >
            Recomeçar
          </button>
          {chaveUrl && (
            <button
              className="rt-btn sutil"
              onClick={copiarLink}
              title="Copiar link com esta configuração"
            >
              Copiar link
            </button>
          )}
        </div>
      </div>

      <p className="rt-nota">
        Congele um retângulo, gire e compare o total. Com o desenho em foco, ← → mudam as colunas,
        ↑ ↓ mudam as linhas e a tecla G gira.
      </p>

      <style>{`
        .rt {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .rt-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .rt-leitura {
          display: flex; gap: 14px; flex-wrap: wrap; align-items: baseline;
          font-variant-numeric: tabular-nums; margin-bottom: calc(var(--u) * 0.3);
        }
        .rt-conta { font-size: 1.15rem; color: var(--tinta); }
        .rt-soma { font-size: 0.95rem; color: var(--azul); }
        .rt-antes { font-size: 0.86rem; color: var(--tinta-fraca); }

        .rt-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .rt-svg:focus-visible { outline: 2px solid var(--azul); outline-offset: 4px; }
        .rt-bola { fill: var(--tinta); }
        .rt-faixa { fill: var(--azul-fraco); stroke: var(--azul-medio); stroke-width: 1; }
        .rt-faixa.par { fill: var(--papel-fundo); }
        .rt-eixo {
          font-family: var(--f-ui); font-size: 13px; font-weight: 700;
          fill: var(--tinta-fraca); text-anchor: middle;
        }

        .rt-ctrl {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: calc(var(--u) * 0.5); padding-top: calc(var(--u) * 0.5);
          border-top: 1px solid var(--linha);
        }
        .rt-linha { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .rt-campo {
          display: flex; align-items: center; gap: 8px; flex: 1 1 100%;
          font-size: 0.74rem; color: var(--tinta-fraca);
        }
        .rt-slider { flex: 1; min-width: 120px; accent-color: var(--azul); }
        .rt-campo input[type="number"] {
          width: 4.5ch; font: inherit; font-size: 0.82rem; color: var(--tinta);
          border: 1px solid var(--linha); border-radius: var(--raio);
          padding: 4px 5px; background: var(--papel); text-align: center;
        }
        .rt-btn {
          font-family: var(--f-ui); font-size: 0.74rem;
          border: 1px solid var(--linha); background: var(--papel);
          color: var(--tinta-media); padding: 5px 11px;
          border-radius: var(--raio); cursor: pointer;
        }
        .rt-btn:hover { border-color: var(--tinta); color: var(--tinta); }
        .rt-btn[aria-pressed="true"] {
          background: var(--tinta); border-color: var(--tinta); color: var(--papel);
        }
        .rt-btn.sutil { color: var(--tinta-fraca); }
        .rt-nota {
          font-family: var(--f-ui); font-size: 0.74rem; color: var(--tinta-fraca);
          margin: calc(var(--u) * 0.4) 0 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .rt-bola, .rt-faixa { transition: none; }
        }
      `}</style>
    </figure>
  );
}
