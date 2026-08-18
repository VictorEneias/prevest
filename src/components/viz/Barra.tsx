import { useEffect, useState } from 'react';

/* <Barra /> — a fração como pedaço de barra, com duas pra comparar e somar.
 *
 * O denominador corta a barra e o numerador pinta, e é isso que faz o aluno ver
 * o que o texto só afirma: que 3/5 é maior que 3/7 porque o pedaço é maior, que
 * 2/4 e 1/2 pintam o mesmo tanto, e que igualar os pedaços multiplica os cortes
 * sem mexer no que está pintado.
 *
 * A barra mostra dois inteiros lado a lado, então 7/4 passa da linha grossa em
 * vez de estourar o desenho, e a soma ganha uma terceira barra já cortada no
 * MMC, que é a única forma de somar pedaço de tamanho diferente. */

export interface BarraProps {
  /** A primeira fração, [numerador, denominador]. */
  a?: [number, number];
  /** A segunda. Sem ela, a figura mostra uma barra só. */
  b?: [number, number];
  /** Liga a terceira barra com a soma das duas. */
  soma?: boolean;
  titulo?: string;
  /** Guarda o estado no hash da URL, pra eu salvar a configuração da aula. */
  chaveUrl?: string;
}

const L = 720;
const MARGEM = 34;
const ALTURA = 42;
const DEN_MAX = 16;
const NUM_MAX = 80;
/* teto do MMC no botão de igualar: acima disso o pedaço fica fino demais pra
   ver, e a lição de "o MMC é o caminho curto" já foi dada pelo próprio número */
const MMC_MAX = 40;

const mdc = (a: number, b: number): number => (b ? mdc(b, a % b) : Math.abs(a));
const mmc = (a: number, b: number) => Math.abs(a * b) / mdc(a, b);
const trava = (n: number, max: number) => Math.min(max, Math.max(0, Math.round(n)));
const dec = (n: number) => String(Number(n.toFixed(3))).replace('.', ',');

const PRESETS: { nome: string; a: [number, number]; b: [number, number] }[] = [
  { nome: 'Meio e um terço', a: [1, 2], b: [1, 3] },
  { nome: 'Mesmo numerador', a: [3, 5], b: [3, 7] },
  { nome: 'Equivalentes', a: [2, 4], b: [1, 2] },
  { nome: 'Passa do inteiro', a: [7, 4], b: [1, 4] },
];

/** Uma fração escrita empilhada, que é como ela aparece no texto da aula. */
function Fr({ n, d }: { n: number; d: number }) {
  return (
    <span className="br-fr">
      <span className="br-num">{n}</span>
      <span className="br-den">{d}</span>
    </span>
  );
}

export default function Barra({
  a = [1, 2],
  b,
  soma: comSoma = false,
  titulo,
  chaveUrl,
}: BarraProps) {
  const [na, setNa] = useState(a[0]);
  const [da, setDa] = useState(a[1]);
  const [nb, setNb] = useState(b?.[0] ?? 1);
  const [db, setDb] = useState(b?.[1] ?? 3);
  const [congelado, setCongelado] = useState<{ n: number; d: number } | null>(null);

  const duas = !!b;

  useEffect(() => {
    if (!chaveUrl) return;
    const bruto = new URLSearchParams(location.hash.slice(1)).get(chaveUrl);
    if (!bruto) return;
    const [p, q, r, s] = bruto.split(',').map(Number);
    if (Number.isFinite(p)) setNa(trava(p, NUM_MAX));
    if (Number.isFinite(q)) setDa(Math.max(1, trava(q, MMC_MAX)));
    if (Number.isFinite(r)) setNb(trava(r, NUM_MAX));
    if (Number.isFinite(s)) setDb(Math.max(1, trava(s, MMC_MAX)));
  }, [chaveUrl]);

  const va = na / da;
  const vb = nb / db;
  const comum = duas ? mmc(da, db) : da;
  const somaNum = duas ? na * (comum / da) + nb * (comum / db) : na;

  /* igualar os pedaços é reescrever as duas no MMC: o pintado não muda de tamanho */
  const igualar = () => {
    if (!duas) return;
    setNa(na * (comum / da));
    setNb(nb * (comum / db));
    setDa(comum);
    setDb(comum);
  };

  const simplificar = () => {
    const g = mdc(na, da) || 1;
    setNa(na / g);
    setDa(da / g);
    if (duas) {
      const h = mdc(nb, db) || 1;
      setNb(nb / h);
      setDb(db / h);
    }
  };

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setNa((n) => trava(n + 1, NUM_MAX));
    else if (e.key === 'ArrowLeft') setNa((n) => trava(n - 1, NUM_MAX));
    else if (e.key === 'ArrowUp') setDa((d) => Math.max(1, trava(d - 1, MMC_MAX)));
    else if (e.key === 'ArrowDown') setDa((d) => Math.max(1, trava(d + 1, MMC_MAX)));
    else return;
    e.preventDefault();
  };

  const copiarLink = () => {
    if (!chaveUrl) return;
    const p = new URLSearchParams(location.hash.slice(1));
    p.set(chaveUrl, `${na},${da},${nb},${db}`);
    navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${p.toString()}`);
  };

  const util = L - 2 * MARGEM;
  const inteiro = util / 2;

  const barras = [
    { n: na, d: da, rotulo: 'a', cor: 'var(--azul)' },
    ...(duas ? [{ n: nb, d: db, rotulo: 'b', cor: 'var(--grafite)' }] : []),
    ...(duas && comSoma
      ? [{ n: somaNum, d: comum, rotulo: 'a + b', cor: 'var(--marca)' }]
      : []),
  ];

  /* a altura tem que sair da mesma conta que empilha as barras lá embaixo, senão
     a última sobra fora do viewBox e invade o parágrafo seguinte */
  const A = 22 + (congelado ? ALTURA + 36 : 0) + barras.length * (ALTURA + 26) + 8;

  const aria =
    `Barra cortada em ${da} ${da === 1 ? 'pedaço' : 'pedaços'}, com ${na} pintados, ` +
    `que é ${dec(va)}.` +
    (duas
      ? ` Segunda barra cortada em ${db}, com ${nb} pintados, que é ${dec(vb)}. ` +
        (va === vb
          ? 'As duas pintam o mesmo tanto.'
          : `A ${va > vb ? 'primeira' : 'segunda'} pinta mais.`)
      : '');

  /* uma barra: os cortes vazios, o pintado por cima e a linha grossa do inteiro */
  const desenhar = (
    n: number,
    d: number,
    y: number,
    cor: string,
    rotulo: string,
    fantasma = false,
  ) => {
    const largura = inteiro / d;
    const pedacos = Array.from({ length: d * 2 }, (_, i) => i);
    return (
      <g key={`${rotulo}-${y}`} opacity={fantasma ? 0.55 : 1}>
        {pedacos.map((i) => (
          <rect
            key={i}
            x={MARGEM + i * largura}
            y={y}
            width={largura}
            height={ALTURA}
            className="br-pedaco"
          />
        ))}
        {pedacos
          .filter((i) => i < n)
          .map((i) => (
            <rect
              key={`p${i}`}
              x={MARGEM + i * largura}
              y={y}
              width={largura}
              height={ALTURA}
              fill={cor}
              stroke="var(--papel)"
              strokeWidth="1"
              opacity={fantasma ? 0.35 : 0.85}
            />
          ))}
        <line
          x1={MARGEM + inteiro}
          y1={y - 6}
          x2={MARGEM + inteiro}
          y2={y + ALTURA + 6}
          stroke="var(--tinta)"
          strokeWidth="2.5"
        />
        <text x={MARGEM} y={y - 8} className="br-rot">
          {fantasma ? 'antes: ' : ''}
          {n}/{d}
          {!fantasma && ` = ${dec(n / d)}`}
        </text>
      </g>
    );
  };

  let y = 22;
  const desenhos: React.ReactNode[] = [];
  if (congelado) {
    desenhos.push(desenhar(congelado.n, congelado.d, y, 'var(--tinta-fraca)', 'antes', true));
    y += ALTURA + 36;
  }
  for (const barra of barras) {
    desenhos.push(desenhar(barra.n, barra.d, y, barra.cor, barra.rotulo));
    y += ALTURA + 26;
  }

  return (
    <figure className="br">
      {titulo && <figcaption className="br-titulo">{titulo}</figcaption>}

      <div className="br-leitura">
        <span className="br-conta">
          <Fr n={na} d={da} />
          {duas && (
            <>
              <span className="br-op">{va === vb ? '=' : va > vb ? '>' : '<'}</span>
              <Fr n={nb} d={db} />
            </>
          )}
        </span>
        {duas && comSoma && (
          <span className="br-conta soma">
            <Fr n={na} d={da} />
            <span className="br-op">+</span>
            <Fr n={nb} d={db} />
            <span className="br-op">=</span>
            <Fr n={na * (comum / da)} d={comum} />
            <span className="br-op">+</span>
            <Fr n={nb * (comum / db)} d={comum} />
            <span className="br-op">=</span>
            <Fr n={somaNum} d={comum} />
          </span>
        )}
        {duas && (
          <span className="br-mmc">
            pedaço comum: MMC({da}, {db}) = {comum}
          </span>
        )}
      </div>

      <svg
        className="br-svg"
        viewBox={`0 0 ${L} ${A}`}
        role="img"
        tabIndex={0}
        aria-label={aria}
        onKeyDown={aoTeclar}
      >
        {desenhos}
      </svg>

      <div className="br-ctrl">
        <div className="br-linha">
          <label className="br-campo">
            corta em
            <input
              className="br-slider"
              type="range"
              min={1}
              max={Math.max(DEN_MAX, da)}
              value={da}
              onChange={(e) => setDa(Math.max(1, trava(+e.target.value, DEN_MAX)))}
              aria-label="Denominador da primeira fração"
            />
            <input
              type="number"
              min={1}
              max={Math.max(DEN_MAX, da)}
              value={da}
              onChange={(e) => setDa(Math.max(1, trava(+e.target.value, DEN_MAX)))}
            />
          </label>
          <label className="br-campo">
            pinta
            <input
              className="br-slider"
              type="range"
              min={0}
              max={Math.min(NUM_MAX, da * 2)}
              value={na}
              onChange={(e) => setNa(trava(+e.target.value, NUM_MAX))}
              aria-label="Numerador da primeira fração"
            />
            <input
              type="number"
              min={0}
              max={NUM_MAX}
              value={na}
              onChange={(e) => setNa(trava(+e.target.value, NUM_MAX))}
            />
          </label>
        </div>

        {duas && (
          <div className="br-linha">
            <label className="br-campo">
              corta em
              <input
                className="br-slider"
                type="range"
                min={1}
                max={Math.max(DEN_MAX, db)}
                value={db}
                onChange={(e) => setDb(Math.max(1, trava(+e.target.value, DEN_MAX)))}
                aria-label="Denominador da segunda fração"
              />
              <input
                type="number"
                min={1}
                max={Math.max(DEN_MAX, db)}
                value={db}
                onChange={(e) => setDb(Math.max(1, trava(+e.target.value, DEN_MAX)))}
              />
            </label>
            <label className="br-campo">
              pinta
              <input
                className="br-slider"
                type="range"
                min={0}
                max={Math.min(NUM_MAX, db * 2)}
                value={nb}
                onChange={(e) => setNb(trava(+e.target.value, NUM_MAX))}
                aria-label="Numerador da segunda fração"
              />
              <input
                type="number"
                min={0}
                max={NUM_MAX}
                value={nb}
                onChange={(e) => setNb(trava(+e.target.value, NUM_MAX))}
              />
            </label>
          </div>
        )}

        <div className="br-linha">
          {duas && (
            <button
              className="br-btn"
              onClick={igualar}
              disabled={da === db || comum > MMC_MAX}
              title={
                comum > MMC_MAX
                  ? `o pedaço comum seria de ${comum} em ${comum}, fino demais pra desenhar`
                  : undefined
              }
            >
              Igualar os pedaços
            </button>
          )}
          <button className="br-btn" onClick={simplificar}>
            Simplificar
          </button>
          <button
            className="br-btn"
            onClick={() => setCongelado(congelado ? null : { n: na, d: da })}
            aria-pressed={!!congelado}
          >
            {congelado ? 'Soltar' : 'Congelar'}
          </button>
        </div>

        <div className="br-linha">
          {PRESETS.map((p) => (
            <button
              key={p.nome}
              className="br-btn"
              onClick={() => {
                setNa(p.a[0]);
                setDa(p.a[1]);
                setNb(p.b[0]);
                setDb(p.b[1]);
              }}
            >
              {p.nome}
            </button>
          ))}
          <button
            className="br-btn"
            onClick={() => {
              setNa(a[0]);
              setDa(a[1]);
              setNb(b?.[0] ?? 1);
              setDb(b?.[1] ?? 3);
              setCongelado(null);
            }}
          >
            Recomeçar
          </button>
          {chaveUrl && (
            <button
              className="br-btn sutil"
              onClick={copiarLink}
              title="Copiar link com esta configuração"
            >
              Copiar link
            </button>
          )}
        </div>
      </div>

      <p className="br-nota">
        A linha grossa marca o fim do primeiro inteiro. Com o desenho em foco, ← → pintam e apagam
        pedaço da primeira barra e ↑ ↓ mudam em quantos pedaços ela está cortada.
      </p>

      <style>{`
        .br {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .br-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .br-leitura {
          display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
          margin-bottom: calc(var(--u) * 0.3);
        }
        .br-conta {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 1.05rem; color: var(--tinta); font-variant-numeric: tabular-nums;
        }
        .br-conta.soma { font-size: 0.95rem; color: var(--tinta-media); }
        .br-op { color: var(--tinta-fraca); }
        .br-fr {
          display: inline-flex; flex-direction: column; align-items: center;
          line-height: 1.05; font-weight: 600;
        }
        .br-den { border-top: 1.5px solid currentColor; padding-top: 1px; }
        .br-mmc { font-size: 0.82rem; color: var(--tinta-fraca); }

        .br-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .br-svg:focus-visible { outline: 2px solid var(--azul); outline-offset: 4px; }
        .br-pedaco { fill: var(--papel-fundo); stroke: var(--grade-forte); stroke-width: 1; }
        .br-rot {
          font-family: var(--f-ui); font-size: 12.5px; font-weight: 700;
          fill: var(--tinta-media); font-variant-numeric: tabular-nums;
        }

        .br-ctrl {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: calc(var(--u) * 0.5); padding-top: calc(var(--u) * 0.5);
          border-top: 1px solid var(--linha);
        }
        .br-linha { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .br-campo {
          display: flex; align-items: center; gap: 6px; flex: 1 1 14rem;
          font-size: 0.74rem; color: var(--tinta-fraca);
        }
        .br-slider { flex: 1; min-width: 90px; accent-color: var(--azul); }
        .br-campo input[type="number"] {
          width: 4.5ch; font: inherit; font-size: 0.82rem; color: var(--tinta);
          border: 1px solid var(--linha); border-radius: var(--raio);
          padding: 4px 5px; background: var(--papel); text-align: center;
        }
        .br-btn {
          font-family: var(--f-ui); font-size: 0.74rem;
          border: 1px solid var(--linha); background: var(--papel);
          color: var(--tinta-media); padding: 5px 11px;
          border-radius: var(--raio); cursor: pointer;
        }
        .br-btn:hover { border-color: var(--tinta); color: var(--tinta); }
        .br-btn[aria-pressed="true"] {
          background: var(--tinta); border-color: var(--tinta); color: var(--papel);
        }
        /* botão de igualar apagado quando os pedaços já são iguais: aí não há o que igualar */
        .br-btn:disabled { color: var(--tinta-fraca); border-style: dashed; cursor: default; }
        .br-btn.sutil { color: var(--tinta-fraca); }
        .br-nota {
          font-family: var(--f-ui); font-size: 0.74rem; color: var(--tinta-fraca);
          margin: calc(var(--u) * 0.4) 0 0;
        }
      `}</style>
    </figure>
  );
}
