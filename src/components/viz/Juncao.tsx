import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* <Juncao /> — o primitivo de sinal.
 *
 * Cada número é uma seta: o comprimento é o módulo e a direção é o sinal, e
 * juntar é encadear seta ponta a ponta a partir do zero. Mexendo nas setas o
 * aluno vê o que no papel só dá pra afirmar: que reordenar não move o ponto
 * final, que um grupo de setas vira uma seta só, e que o mesmo desenho serve
 * pra "menos" e pra "mais um negativo".
 *
 * Com contexto="deslocamento" ou "forca" isto vira soma vetorial em 1D, então
 * cinemática, velocidade relativa e resultante na mesma direção reusam este
 * componente em vez de ganhar um novo. */

type Contexto = 'numero' | 'deslocamento' | 'forca';

export interface JuncaoProps {
  /** Parcelas iniciais. Ex.: [5, -3, 2] */
  parcelas?: number[];
  /** Como a expressão aparece escrita. 'juncao' mostra (+5) + (−3). */
  notacao?: 'juncao' | 'subtracao';
  contexto?: Contexto;
  permitirEditar?: boolean;
  permitirReordenar?: boolean;
  permitirAgrupar?: boolean;
  /** Trava o domínio da reta. Sem isso ele se ajusta sozinho. */
  dominio?: [number, number];
  titulo?: string;
  /** Guarda o estado no hash da URL, pra eu salvar a configuração da aula. */
  chaveUrl?: string;
}

const CTX: Record<Contexto, { unid: string; pos: string; neg: string; resultado: string }> = {
  numero: { unid: '', pos: 'pra direita', neg: 'pra esquerda', resultado: 'Resultado' },
  deslocamento: { unid: ' m', pos: 'avanço', neg: 'recuo', resultado: 'Posição final' },
  forca: { unid: ' N', pos: 'pra direita', neg: 'pra esquerda', resultado: 'Resultante' },
};

/* Os casos que eu chamo na lousa toda aula, a um clique. Cada contexto tem os
   seus, senão em Física apareceria "dois negativos" pra falar de força. */
const PRESETS: Record<Contexto, { nome: string; parcelas: number[] }[]> = {
  numero: [
    { nome: 'Positivo com negativo', parcelas: [3, -5] },
    { nome: 'Dois negativos', parcelas: [-3, -5] },
    { nome: 'Volta pro zero', parcelas: [7, -7] },
    { nome: 'Atravessa o zero', parcelas: [5, -9, 2] },
  ],
  deslocamento: [
    { nome: 'Ida e volta', parcelas: [40, -40] },
    { nome: 'Anda mais do que volta', parcelas: [50, -35, 20, -5] },
  ],
  forca: [
    { nome: 'Em equilíbrio', parcelas: [30, -30] },
    { nome: 'Resultante pra direita', parcelas: [50, -20] },
  ],
};

const L = 720;
const A = 246;
const Y = 178;
const MARGEM = 34;

/** Onde o arco estoura de verdade. Bezier cúbico com os dois controles em
 *  `topo`: B(0.5) = (P0 + 3C1 + 3C2 + P3) / 8. Sem isso o rótulo cai na curva. */
const picoDoArco = (topo: number) => (2 * (Y - 3) + 6 * topo) / 8;

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));
const sinal = (n: number) => (n < 0 ? '−' : '+');
const menos = (s: string) => s.replace(/-/g, '−');

export default function Juncao({
  parcelas: iniciais = [5, -3, 2],
  notacao: notacaoInicial = 'subtracao',
  contexto = 'numero',
  permitirEditar = true,
  permitirReordenar = true,
  permitirAgrupar = false,
  dominio,
  titulo,
  chaveUrl,
}: JuncaoProps) {
  // id estável por parcela, senão o React reaproveita o <input> errado ao reordenar
  const proximoId = useRef(iniciais.length);
  const [itens, setItens] = useState(() => iniciais.map((v, i) => ({ id: i, v })));
  const parcelas = useMemo(() => itens.map((it) => it.v), [itens]);
  const [notacao, setNotacao] = useState(notacaoInicial);
  const [passo, setPasso] = useState(iniciais.length); // quantas setas exibir
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [alvoSolta, setAlvoSolta] = useState<number | null>(null);
  const [grupo, setGrupo] = useState<[number, number] | null>(null);
  const [agrupando, setAgrupando] = useState(false);
  const [fantasma, setFantasma] = useState<number[] | null>(null);
  const [pulsando, setPulsando] = useState(false);

  const fitaRef = useRef<HTMLDivElement>(null);
  const c = CTX[contexto];

  /* ---- restaura o estado da URL, pra a configuração do preparo voltar ---- */
  useEffect(() => {
    if (!chaveUrl) return;
    const bruto = new URLSearchParams(location.hash.slice(1)).get(chaveUrl);
    if (!bruto) return;
    const vals = bruto.split(',').map(Number).filter(Number.isFinite);
    if (vals.length) {
      setItens(vals.map((v) => ({ id: proximoId.current++, v })));
      setPasso(vals.length);
    }
  }, [chaveUrl]);

  /* ---- somas acumuladas: onde cada seta começa e termina ---- */
  const acum = useMemo(() => {
    const a = [0];
    parcelas.forEach((p) => a.push(a[a.length - 1] + p));
    return a;
  }, [parcelas]);

  const total = acum[acum.length - 1];
  const totalVisivel = acum[Math.min(passo, parcelas.length)];

  /* ---- domínio da reta ---- */
  const [min, max] = useMemo(() => {
    if (dominio) return dominio;
    const vals = [...acum, 0, ...(fantasma ? fantasma : [])];
    let lo = Math.floor(Math.min(...vals)) - 1;
    let hi = Math.ceil(Math.max(...vals)) + 1;
    if (hi - lo < 6) {
      const meio = (hi + lo) / 2;
      lo = Math.floor(meio - 3);
      hi = Math.ceil(meio + 3);
    }
    return [lo, hi] as [number, number];
  }, [acum, dominio, fantasma]);

  const x = useCallback((v: number) => MARGEM + ((v - min) / (max - min)) * (L - 2 * MARGEM), [min, max]);

  /* ---- marcações inteiras, ralas o bastante pra caberem ---- */
  const ticks = useMemo(() => {
    const span = max - min;
    const passoTick = span <= 14 ? 1 : span <= 30 ? 2 : span <= 70 ? 5 : 10;
    const out: number[] = [];
    for (let v = Math.ceil(min / passoTick) * passoTick; v <= max; v += passoTick) out.push(v);
    return out;
  }, [min, max]);

  /* ---- expressão escrita ---- */
  const expressao = useMemo(() => {
    if (notacao === 'juncao') {
      return parcelas.map((p) => `(${sinal(p)}${fmt(Math.abs(p))})`).join(' + ');
    }
    return parcelas
      .map((p, i) => (i === 0 ? menos(fmt(p)) : ` ${sinal(p)} ${fmt(Math.abs(p))}`))
      .join('');
  }, [parcelas, notacao]);

  /* ---- reordenar arrastando ---- */
  const mover = (de: number, para: number) => {
    if (de === para) return;
    setItens((atual) => {
      const novo = [...atual];
      const [item] = novo.splice(de, 1);
      novo.splice(para, 0, item);
      return novo;
    });
    setGrupo(null);
    setPulsando(true);
    setTimeout(() => setPulsando(false), 550);
  };

  const aoMoverPonteiro = (e: React.PointerEvent) => {
    if (arrastando === null || !fitaRef.current) return;
    const chips = Array.from(fitaRef.current.querySelectorAll<HTMLElement>('[data-chip]'));
    let destino = chips.length - 1;
    for (let i = 0; i < chips.length; i++) {
      const r = chips[i].getBoundingClientRect();
      if (e.clientX < r.left + r.width / 2) {
        destino = i;
        break;
      }
    }
    setAlvoSolta(destino);
  };

  const soltar = () => {
    if (arrastando !== null && alvoSolta !== null) mover(arrastando, alvoSolta);
    setArrastando(null);
    setAlvoSolta(null);
  };

  const embaralhar = () => {
    setItens((atual) => {
      const novo = [...atual];
      for (let i = novo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [novo[i], novo[j]] = [novo[j], novo[i]];
      }
      return novo;
    });
    setGrupo(null);
    setPasso(parcelas.length);
    setPulsando(true);
    setTimeout(() => setPulsando(false), 550);
  };

  /* Trocar a ordem só existia no arrasto, então quem usa teclado não conseguia
     ver a comutatividade acontecer, que é o ponto da figura. As setas só movem
     quando o foco está no chip: dentro do <input> elas são do campo. */
  const aoTeclarNoChip = (e: React.KeyboardEvent, i: number) => {
    if (e.target !== e.currentTarget) return;
    if (!permitirReordenar || agrupando) return;
    if (e.key === 'ArrowLeft' && i > 0) mover(i, i - 1);
    else if (e.key === 'ArrowRight' && i < parcelas.length - 1) mover(i, i + 1);
    else return;
    e.preventDefault();
  };

  const recomecar = (novas = iniciais) => {
    setItens(novas.map((v) => ({ id: proximoId.current++, v })));
    setPasso(novas.length);
    setGrupo(null);
    setAgrupando(false);
    setFantasma(null);
    setNotacao(notacaoInicial);
  };

  const editar = (i: number, v: number) => {
    setItens((atual) => atual.map((it, k) => (k === i ? { ...it, v } : it)));
    setGrupo(null);
  };

  const clicarChip = (i: number) => {
    if (!agrupando) return;
    setGrupo((g) => {
      if (!g) return [i, i];
      const [a, b] = g;
      if (i >= a && i <= b) return null;
      return [Math.min(a, i), Math.max(b, i)];
    });
  };

  const copiarLink = () => {
    if (!chaveUrl) return;
    const p = new URLSearchParams(location.hash.slice(1));
    p.set(chaveUrl, parcelas.join(','));
    const url = `${location.origin}${location.pathname}#${p.toString()}`;
    navigator.clipboard?.writeText(url);
  };

  const somaGrupo = grupo ? parcelas.slice(grupo[0], grupo[1] + 1).reduce((s, v) => s + v, 0) : 0;
  const visiveis = Math.min(passo, parcelas.length);

  return (
    <figure className="jc">
      {titulo && <figcaption className="jc-titulo">{titulo}</figcaption>}

      {/* ---------- expressão ---------- */}
      <div className="jc-expr">
        <span className="jc-expr-txt">{expressao}</span>
        <span className="jc-igual">=</span>
        <span className={`jc-total ${total < 0 ? 'neg' : 'pos'} ${pulsando ? 'pulsa' : ''}`}>
          {menos(fmt(total))}
          {c.unid}
        </span>
      </div>

      {/* ---------- fita de parcelas ---------- */}
      <div
        className="jc-fita"
        ref={fitaRef}
        onPointerMove={aoMoverPonteiro}
        onPointerUp={soltar}
        onPointerCancel={soltar}
      >
        {itens.map(({ id: chaveChip, v: p }, i) => (
          <div
            key={chaveChip}
            data-chip
            className={[
              'jc-chip',
              p < 0 ? 'neg' : 'pos',
              arrastando === i ? 'arrastando' : '',
              alvoSolta === i && arrastando !== null && arrastando !== i ? 'alvo' : '',
              grupo && i >= grupo[0] && i <= grupo[1] ? 'no-grupo' : '',
              i >= visiveis ? 'oculto' : '',
            ].join(' ')}
            onPointerDown={(e) => {
              if (!permitirReordenar || agrupando) return;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              setArrastando(i);
              setAlvoSolta(i);
            }}
            onClick={() => clicarChip(i)}
            onKeyDown={(e) => aoTeclarNoChip(e, i)}
            tabIndex={permitirReordenar && !agrupando ? 0 : undefined}
            role={permitirReordenar && !agrupando ? 'button' : undefined}
            aria-label={
              permitirReordenar && !agrupando
                ? `Parcela ${i + 1} de ${parcelas.length}: ${p < 0 ? 'menos' : 'mais'} ${Math.abs(p)}. Setas esquerda e direita trocam de lugar.`
                : undefined
            }
            title={permitirReordenar && !agrupando ? 'Arraste ou use ← → pra trocar de lugar' : undefined}
          >
            <span className="jc-chip-sinal">{sinal(p)}</span>
            {permitirEditar ? (
              <input
                className="jc-chip-num"
                type="number"
                value={Math.abs(p)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v)) editar(i, p < 0 ? -Math.abs(v) : Math.abs(v));
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={`Módulo da parcela ${i + 1}`}
              />
            ) : (
              <span className="jc-chip-num-fixo">{fmt(Math.abs(p))}</span>
            )}
            {permitirEditar && (
              <button
                className="jc-chip-inv"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  editar(i, -p);
                }}
                title="Inverter o sinal (trocar pelo oposto)"
                aria-label={`Inverter sinal da parcela ${i + 1}`}
              >
                ⇄
              </button>
            )}
          </div>
        ))}

        {permitirEditar && parcelas.length < 7 && (
          <button
            className="jc-add"
            onClick={() => {
              setItens((a) => [...a, { id: proximoId.current++, v: 1 }]);
              setPasso((p) => p + 1);
            }}
            title="Adicionar parcela"
          >
            +
          </button>
        )}
        {permitirEditar && parcelas.length > 1 && (
          <button
            className="jc-add"
            onClick={() => {
              setItens((a) => a.slice(0, -1));
              setPasso((p) => Math.max(1, p - 1));
              setGrupo(null);
            }}
            title="Remover a última parcela"
          >
            −
          </button>
        )}
      </div>

      {/* ---------- reta numérica ---------- */}
      <svg
        className="jc-svg"
        viewBox={`0 0 ${L} ${A}`}
        role="img"
        aria-label={`Reta numérica de ${min} a ${max}. Setas encadeadas: ${parcelas
          .map((p) => `${p < 0 ? 'menos' : 'mais'} ${Math.abs(p)}`)
          .join(', ')}. Resultado ${total}.`}
      >
        <defs>
          <marker id="pta-pos" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="var(--azul)" />
          </marker>
          <marker id="pta-neg" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="var(--vermelho)" />
          </marker>
          <marker id="pta-grp" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="var(--tinta)" />
          </marker>
        </defs>

        {/* eixo */}
        <line x1={MARGEM - 14} y1={Y} x2={L - MARGEM + 14} y2={Y} stroke="var(--tinta)" strokeWidth="1.5" />
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
              className={`jc-tick ${v === 0 ? 'zero' : ''}`}
            >
              {menos(String(v))}
            </text>
          </g>
        ))}

        {/* setas encadeadas, os "pulinhos" acima da reta */}
        {parcelas.slice(0, visiveis).map((p, i) => {
          const x0 = x(acum[i]);
          const x1 = x(acum[i + 1]);
          const alturaBase = 30 + Math.min(i, 5) * 21;
          const topo = Y - alturaBase;
          const yRotulo = picoDoArco(topo) - 7;
          const neg = p < 0;
          const noGrupo = grupo && i >= grupo[0] && i <= grupo[1];
          if (Math.abs(x1 - x0) < 0.5) return null;
          return (
            <g key={i} className={`jc-seta ${noGrupo ? 'no-grupo' : ''}`}>
              <path
                d={`M ${x0} ${Y - 3} C ${x0} ${topo}, ${x1} ${topo}, ${x1} ${Y - 3}`}
                fill="none"
                stroke={neg ? 'var(--vermelho)' : 'var(--azul)'}
                strokeWidth={noGrupo ? 3 : 2.2}
                markerEnd={`url(#${neg ? 'pta-neg' : 'pta-pos'})`}
                opacity={noGrupo ? 1 : 0.92}
              />
              <text
                x={(x0 + x1) / 2}
                y={yRotulo}
                textAnchor="middle"
                className={`jc-rot ${neg ? 'neg' : 'pos'}`}
              >
                {sinal(p)}
                {fmt(Math.abs(p))}
              </text>
              <circle cx={x0} cy={Y} r="3" fill={neg ? 'var(--vermelho)' : 'var(--azul)'} />
            </g>
          );
        })}

        {/* a seta que resume o grupo */}
        {grupo && (
          <path
            d={`M ${x(acum[grupo[0]])} ${Y + 34} L ${x(acum[grupo[1] + 1])} ${Y + 34}`}
            stroke="var(--tinta)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            markerEnd="url(#pta-grp)"
            fill="none"
          />
        )}
        {grupo && (
          <text
            x={(x(acum[grupo[0]]) + x(acum[grupo[1] + 1])) / 2}
            y={Y + 52}
            textAnchor="middle"
            className="jc-rot grp"
          >
            o grupo inteiro = uma seta só ({menos(fmt(somaGrupo))})
          </text>
        )}

        {/* ponto final */}
        <g className={pulsando ? 'jc-fim pulsa' : 'jc-fim'}>
          <line
            x1={x(totalVisivel)}
            y1={Y - 6}
            x2={x(totalVisivel)}
            y2={Y + 14}
            stroke="var(--tinta)"
            strokeWidth="3"
          />
          <circle cx={x(totalVisivel)} cy={Y} r="6" fill="var(--tinta)" />
          <text x={x(totalVisivel)} y={Y - 14} textAnchor="middle" className="jc-fim-rot">
            {menos(fmt(totalVisivel))}
          </text>
        </g>

        {/* curva congelada */}
        {fantasma && (
          <g opacity="0.42">
            <circle cx={x(fantasma[fantasma.length - 1])} cy={Y} r="5" fill="none" stroke="var(--tinta-fraca)" strokeWidth="2" />
            <text x={x(fantasma[fantasma.length - 1])} y={Y + 46} textAnchor="middle" className="jc-tick">
              antes
            </text>
          </g>
        )}
      </svg>

      {/* ---------- controles ---------- */}
      <div className="jc-ctrl">
        <div className="jc-grupo-btn">
          <button
            onClick={() => setNotacao((n) => (n === 'juncao' ? 'subtracao' : 'juncao'))}
            className="jc-btn destaque"
          >
            {notacao === 'juncao' ? 'Ver como subtração' : 'Ver como junção'}
          </button>
          {permitirReordenar && (
            <button onClick={embaralhar} className="jc-btn">
              Embaralhar
            </button>
          )}
        </div>

        <div className="jc-grupo-btn">
          <button
            onClick={() => setPasso((p) => (p >= parcelas.length ? 1 : p + 1))}
            className="jc-btn"
            title="Mostrar uma seta de cada vez"
          >
            {passo >= parcelas.length ? 'Passo a passo' : `Próxima seta (${passo}/${parcelas.length})`}
          </button>
          <button
            onClick={() => setFantasma(fantasma ? null : [...acum])}
            className="jc-btn"
            aria-pressed={!!fantasma}
          >
            {fantasma ? 'Soltar' : 'Congelar'}
          </button>
          {permitirAgrupar && (
            <button
              onClick={() => {
                setAgrupando((a) => !a);
                setGrupo(null);
              }}
              className="jc-btn"
              aria-pressed={agrupando}
            >
              {agrupando ? 'Sair do agrupar' : 'Agrupar'}
            </button>
          )}
          <button onClick={() => recomecar()} className="jc-btn">
            Recomeçar
          </button>
          {chaveUrl && (
            <button onClick={copiarLink} className="jc-btn sutil" title="Copiar link com esta configuração">
              Copiar link
            </button>
          )}
        </div>
      </div>

      {permitirEditar && (
        <div className="jc-presets">
          {PRESETS[contexto].map((pr) => (
            <button key={pr.nome} className="jc-btn sutil" onClick={() => recomecar(pr.parcelas)}>
              {pr.nome}
            </button>
          ))}
        </div>
      )}

      {agrupando && (
        <p className="jc-nota">Clique nas parcelas pra montar um grupo. Clique dentro do grupo pra desfazer.</p>
      )}

      <style>{`
        .jc {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .jc-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.5);
        }
        .jc-expr {
          display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
          font-size: 1.32rem; font-variant-numeric: tabular-nums;
          margin-bottom: calc(var(--u) * 0.6);
        }
        .jc-expr-txt { color: var(--tinta); letter-spacing: 0.01em; }
        .jc-igual { color: var(--tinta-fraca); }
        .jc-total { font-weight: 700; }
        .jc-total.pos { color: var(--azul); }
        .jc-total.neg { color: var(--vermelho); }
        .jc-total.pulsa, .jc-fim.pulsa { animation: jc-bate 0.55s ease; }
        @keyframes jc-bate {
          0%,100% { transform: scale(1); }
          35% { transform: scale(1.16); }
        }
        .jc-fim.pulsa { transform-box: fill-box; transform-origin: center; }

        .jc-fita {
          display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
          margin-bottom: calc(var(--u) * 0.5); touch-action: none;
        }
        .jc-chip {
          display: inline-flex; align-items: center; gap: 2px;
          padding: 4px 5px 4px 9px; border-radius: var(--raio);
          border: 1.5px solid; cursor: grab; user-select: none;
          font-variant-numeric: tabular-nums; transition: transform .12s ease, opacity .12s ease;
        }
        .jc-chip.pos { border-color: var(--azul); background: var(--azul-fraco); color: var(--azul); }
        .jc-chip.neg { border-color: var(--vermelho); background: var(--vermelho-fraco); color: var(--vermelho); }
        .jc-chip.arrastando { opacity: .45; cursor: grabbing; }
        .jc-chip.alvo { transform: translateX(5px); box-shadow: -3px 0 0 var(--tinta); }
        .jc-chip.no-grupo { outline: 2px dashed var(--tinta); outline-offset: 3px; }
        .jc-chip.oculto { opacity: .28; }
        .jc-chip:focus-visible { outline: 2px solid var(--tinta); outline-offset: 2px; }
        .jc-chip-sinal { font-weight: 700; font-size: 1.02rem; }
        .jc-chip-num {
          width: 3.1ch; border: 0; background: transparent; color: inherit;
          font: inherit; font-weight: 600; font-size: 1.02rem; text-align: center;
          -moz-appearance: textfield;
        }
        .jc-chip-num::-webkit-outer-spin-button,
        .jc-chip-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .jc-chip-num-fixo { font-weight: 600; font-size: 1.02rem; padding: 0 4px; }
        .jc-chip-inv {
          border: 0; background: transparent; color: inherit; cursor: pointer;
          opacity: .5; font-size: .82rem; padding: 2px 3px; border-radius: 2px;
        }
        .jc-chip-inv:hover { opacity: 1; background: rgba(0,0,0,.07); }
        .jc-add {
          width: 26px; height: 26px; border-radius: var(--raio);
          border: 1px dashed var(--tinta-fraca); background: transparent;
          color: var(--tinta-fraca); cursor: pointer; font-size: 1rem; line-height: 1;
        }
        .jc-add:hover { border-color: var(--tinta); color: var(--tinta); }

        .jc-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .jc-tick { font-family: var(--f-ui); font-size: 12px; fill: var(--tinta-fraca); }
        .jc-tick.zero { fill: var(--tinta); font-weight: 700; }
        .jc-rot { font-family: var(--f-ui); font-size: 13px; font-weight: 600; }
        .jc-rot.pos { fill: var(--azul); }
        .jc-rot.neg { fill: var(--vermelho); }
        .jc-rot.grp { fill: var(--tinta-media); font-size: 12px; font-weight: 500; }
        .jc-fim-rot { font-family: var(--f-ui); font-size: 14px; font-weight: 700; fill: var(--tinta); }

        .jc-ctrl {
          display: flex; justify-content: space-between; gap: var(--u); flex-wrap: wrap;
          margin-top: calc(var(--u) * 0.5); padding-top: calc(var(--u) * 0.5);
          border-top: 1px solid var(--linha);
        }
        .jc-grupo-btn { display: flex; gap: 6px; flex-wrap: wrap; }
        .jc-btn {
          font-family: var(--f-ui); font-size: 0.74rem;
          border: 1px solid var(--linha); background: var(--papel);
          color: var(--tinta-media); padding: 5px 11px; border-radius: var(--raio); cursor: pointer;
        }
        .jc-btn:hover { border-color: var(--tinta); color: var(--tinta); }
        .jc-btn[aria-pressed="true"] { background: var(--tinta); border-color: var(--tinta); color: var(--papel); }
        .jc-btn.destaque { border-color: var(--azul); color: var(--azul); font-weight: 600; }
        .jc-btn.destaque:hover { background: var(--azul-fraco); }
        .jc-btn.sutil { color: var(--tinta-fraca); }
        .jc-presets {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-top: calc(var(--u) * 0.4);
        }
        .jc-nota {
          font-family: var(--f-ui); font-size: 0.74rem; color: var(--tinta-fraca);
          margin: calc(var(--u) * 0.4) 0 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .jc-total.pulsa, .jc-fim.pulsa, .jc-chip { animation: none; transition: none; }
        }
      `}</style>
    </figure>
  );
}
