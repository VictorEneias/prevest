import { useEffect, useState } from 'react';

/* <Barra /> — a fração como pedaço de barra, com duas pra comparar e somar.
 *
 * O denominador corta a barra e o numerador pinta, e é isso que faz o aluno ver
 * o que o texto só afirma: que 3/5 é maior que 3/7 porque o pedaço é maior, que
 * 2/4 e 1/2 pintam o mesmo tanto, e que igualar os pedaços multiplica os cortes
 * sem mexer no que está pintado.
 *
 * A barra mostra dois inteiros lado a lado, então 7/4 passa da marca do 1 em vez
 * de estourar o desenho, e a soma ganha uma terceira barra já cortada no MMC,
 * que é a única forma de somar pedaço de tamanho diferente.
 *
 * Aqui já teve uma fileira de botão embaixo dos controles: igualar os pedaços,
 * simplificar, congelar e quatro presets. Saiu tudo. O botão fazia a conta no
 * lugar do aluno, e ele passava a olhar o resultado aparecer em vez de mexer no
 * corte até ele aparecer. O que substitui é o texto acima dos controles, que diz
 * o que experimentar com as mesmas mãos que já estão nos sliders. */

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

const mdc = (a: number, b: number): number => (b ? mdc(b, a % b) : Math.abs(a));
const mmc = (a: number, b: number) => Math.abs(a * b) / mdc(a, b);
const trava = (n: number, max: number) => Math.min(max, Math.max(0, Math.round(n)));
const dec = (n: number) => String(Number(n.toFixed(3))).replace('.', ',');

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

  const duas = !!b;

  useEffect(() => {
    if (!chaveUrl) return;
    const bruto = new URLSearchParams(location.hash.slice(1)).get(chaveUrl);
    if (!bruto) return;
    const [p, q, r, s] = bruto.split(',').map(Number);
    if (Number.isFinite(p)) setNa(trava(p, NUM_MAX));
    if (Number.isFinite(q)) setDa(Math.max(1, trava(q, DEN_MAX)));
    if (Number.isFinite(r)) setNb(trava(r, NUM_MAX));
    if (Number.isFinite(s)) setDb(Math.max(1, trava(s, DEN_MAX)));
  }, [chaveUrl]);

  const va = na / da;
  const vb = nb / db;
  const comum = duas ? mmc(da, db) : da;
  const somaNum = duas ? na * (comum / da) + nb * (comum / db) : na;

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setNa((n) => trava(n + 1, NUM_MAX));
    else if (e.key === 'ArrowLeft') setNa((n) => trava(n - 1, NUM_MAX));
    else if (e.key === 'ArrowUp') setDa((d) => Math.max(1, trava(d - 1, DEN_MAX)));
    else if (e.key === 'ArrowDown') setDa((d) => Math.max(1, trava(d + 1, DEN_MAX)));
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
    ...(duas && comSoma ? [{ n: somaNum, d: comum, rotulo: 'a + b', cor: 'var(--marca)' }] : []),
  ];

  /* a altura sai da mesma conta que empilha as barras, mais a régua do fim,
     senão a última sobra fora do viewBox e invade o parágrafo seguinte */
  const A = 22 + barras.length * (ALTURA + 26) + 26;

  const aria =
    `Barra cortada em ${da} ${da === 1 ? 'pedaço' : 'pedaços'}, com ${na} pintados, ` +
    `que é ${dec(va)}.` +
    (duas
      ? ` Segunda barra cortada em ${db}, com ${nb} pintados, que é ${dec(vb)}. ` +
        (va === vb
          ? 'As duas pintam o mesmo tanto.'
          : `A ${va > vb ? 'primeira' : 'segunda'} pinta mais.`)
      : '');

  /* uma barra: os cortes vazios, o pintado por cima e a marca do primeiro inteiro */
  const desenhar = (n: number, d: number, y: number, cor: string, rotulo: string) => {
    const largura = inteiro / d;
    const pedacos = Array.from({ length: d * 2 }, (_, i) => i);
    return (
      <g key={`${rotulo}-${y}`}>
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
              opacity={0.85}
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
          {n}/{d} = {dec(n / d)}
        </text>
      </g>
    );
  };

  let y = 22;
  const desenhos: React.ReactNode[] = [];
  for (const barra of barras) {
    desenhos.push(desenhar(barra.n, barra.d, y, barra.cor, barra.rotulo));
    y += ALTURA + 26;
  }

  /* A régua embaixo de tudo. Antes o desenho tinha a linha grossa no meio e nada
     dizendo que ali era o 1: quem via 7/4 passando da linha não tinha como saber
     que tinha passado de um inteiro. */
  const reguaY = y - 20;
  const marcas: { x: number; rot: string }[] = [
    { x: MARGEM, rot: '0' },
    { x: MARGEM + inteiro, rot: '1' },
    { x: MARGEM + 2 * inteiro, rot: '2' },
  ];

  const experimente = comSoma
    ? 'Corta as duas no mesmo número de partes e repara que o pintado de cada uma não muda de tamanho, só de nome. Aí sim a terceira barra soma, porque agora os pedaços são iguais.'
    : duas
      ? 'Corta as duas no mesmo número de partes (o pedaço comum ali em cima diz qual número serve) e repara: o pintado não muda de tamanho, muda só o nome da fração. É isso que igualar os pedaços quer dizer.'
      : 'Aumenta o corte sem mexer no que está pintado e repara que a parte colorida encolhe, porque o mesmo inteiro passou a ser dividido entre mais gente.';

  const controles = (
    quem: string,
    cor: string,
    n: number,
    d: number,
    setN: (v: number) => void,
    setD: (v: number) => void,
  ) => (
    <div className="br-linha">
      <span className="br-quem">
        <i style={{ background: cor }} aria-hidden="true" />
        {quem}
      </span>
      <label className="br-campo">
        cortar em quantas partes:
        <input
          className="br-slider"
          type="range"
          min={1}
          max={DEN_MAX}
          value={d}
          onChange={(e) => setD(Math.max(1, trava(+e.target.value, DEN_MAX)))}
          aria-label={`Em quantas partes a ${quem.toLowerCase()} está cortada`}
        />
        <input
          type="number"
          min={1}
          max={DEN_MAX}
          value={d}
          onChange={(e) => setD(Math.max(1, trava(+e.target.value, DEN_MAX)))}
        />
      </label>
      <label className="br-campo">
        pintar quantas partes:
        <input
          className="br-slider"
          type="range"
          min={0}
          max={Math.min(NUM_MAX, d * 2)}
          value={n}
          onChange={(e) => setN(trava(+e.target.value, NUM_MAX))}
          aria-label={`Quantas partes da ${quem.toLowerCase()} estão pintadas`}
        />
        <input
          type="number"
          min={0}
          max={NUM_MAX}
          value={n}
          onChange={(e) => setN(trava(+e.target.value, NUM_MAX))}
        />
      </label>
    </div>
  );

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
        <line
          x1={MARGEM}
          y1={reguaY}
          x2={MARGEM + 2 * inteiro}
          y2={reguaY}
          className="br-regua"
        />
        {marcas.map((m) => (
          <g key={m.rot}>
            <line x1={m.x} y1={reguaY - 4} x2={m.x} y2={reguaY + 4} className="br-regua" />
            <text x={m.x} y={reguaY + 18} className="br-marca" textAnchor="middle">
              {m.rot}
            </text>
          </g>
        ))}
      </svg>

      <div className="br-ctrl">
        <p className="br-como">
          {duas ? 'As duas barras acima têm o mesmo tamanho' : 'A barra acima'} vale{' '}
          <b>2 inteiros</b>: a marca do meio é o <b>1</b> e a ponta é o <b>2</b>. Aí embaixo você
          escolhe em quantas partes {duas ? 'cada uma' : 'ela'} vai ser cortada, e quantas dessas
          partes vão ser pintadas.
        </p>

        {controles('Barra 1', 'var(--azul)', na, da, setNa, setDa)}
        {duas && controles('Barra 2', 'var(--grafite)', nb, db, setNb, setDb)}

        <p className="br-nota">
          <b>Experimenta:</b> {experimente} Com o desenho em foco, ← → pintam e apagam e ↑ ↓ mudam
          o corte da primeira barra.
          {chaveUrl && (
            <button className="br-link" onClick={copiarLink}>
              copiar link deste estado
            </button>
          )}
        </p>
      </div>

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
        .br-regua { stroke: var(--grade-forte); stroke-width: 1; }
        .br-marca {
          font-family: var(--f-ui); font-size: 12px; font-weight: 700;
          fill: var(--tinta-fraca);
        }

        .br-ctrl {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: calc(var(--u) * 0.5); padding-top: calc(var(--u) * 0.5);
          border-top: 1px solid var(--linha);
        }
        .br-como {
          font-size: 0.8rem; color: var(--tinta-media); margin: 0 0 2px;
        }
        .br-como b { color: var(--tinta); }
        .br-linha { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .br-quem {
          display: inline-flex; align-items: center; gap: 6px; flex: none;
          font-size: 0.74rem; font-weight: 600; color: var(--tinta-media);
          min-width: 5.5rem;
        }
        .br-quem i { width: 10px; height: 10px; border-radius: 2px; }
        .br-campo {
          display: flex; align-items: center; gap: 8px; flex: 1 1 17rem;
          font-size: 0.74rem; color: var(--tinta-fraca);
        }
        .br-slider { flex: 1; min-width: 80px; accent-color: var(--azul); }
        .br-campo input[type="number"] {
          width: 4.5ch; font: inherit; font-size: 0.82rem; color: var(--tinta);
          border: 1px solid var(--linha); border-radius: var(--raio);
          padding: 4px 5px; background: var(--papel); text-align: center;
        }
        .br-nota {
          font-size: 0.74rem; color: var(--tinta-fraca); line-height: 1.5;
          margin: calc(var(--u) * 0.2) 0 0;
        }
        .br-nota b { color: var(--tinta-media); }
        /* o copiar link é ferramenta minha, e não do aluno: fica como texto no
           fim da nota em vez de virar mais um botão embaixo dos controles */
        .br-link {
          font: inherit; color: var(--tinta-fraca); background: none;
          border: 0; padding: 0 0 0 8px; text-decoration: underline; cursor: pointer;
        }
        .br-link:hover { color: var(--tinta); }
      `}</style>
    </figure>
  );
}
