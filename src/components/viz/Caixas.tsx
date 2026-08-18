import { useEffect, useMemo, useState } from 'react';

/* <Caixas /> — o número procurando a caixa dele.
 *
 * Naturais dentro de inteiros dentro de racionais, desenhado como caixa dentro
 * de caixa, e o número entra na menor caixa que aceita ele. A frase "todo
 * inteiro é racional" é fácil de falar e difícil de sentir, e o que faz sentir
 * é arrastar o slider: no 3 o ponto está nas três caixas, um quarto depois ele
 * já caiu pra fora de duas.
 *
 * O campo de texto aceita fração, dízima e raiz porque a aula termina dizendo
 * que sobrou gente de fora, e sem poder escrever √2 o aluno não vê a caixa de
 * fora existir. */

export interface CaixasProps {
  /** Como o número começa escrito. Aceita "3", "-2", "0,75", "3/4", "√2". */
  valor?: string;
  titulo?: string;
  /** Guarda o estado no hash da URL, pra eu salvar a configuração da aula. */
  chaveUrl?: string;
}

type Onde = 'natural' | 'inteiro' | 'racional' | 'fora';

type Lido = {
  /** o que aparece escrito na bolinha */
  rotulo: string;
  /** posição na reta, pra o slider e pra ordenar */
  n: number | null;
  onde: Onde;
  /** o porquê, em uma linha */
  motivo: string;
};

const IRRACIONAIS: Record<string, { rotulo: string; n: number }> = {
  'π': { rotulo: 'π', n: Math.PI },
  pi: { rotulo: 'π', n: Math.PI },
  '√2': { rotulo: '√2', n: Math.SQRT2 },
  raiz2: { rotulo: '√2', n: Math.SQRT2 },
  '√3': { rotulo: '√3', n: Math.sqrt(3) },
};

const menos = (s: string) => s.replace(/-/g, '−');
const fmt = (n: number) => {
  const s = Number.isInteger(n) ? String(n) : String(Number(n.toFixed(4)));
  return menos(s).replace('.', ',');
};

/** Divide os dois inteiros e vê se fechou, que é o que decide entre ℤ e ℚ. */
const ler = (bruto: string): Lido => {
  const t = bruto.trim().replace(/\s/g, '');
  if (!t) return { rotulo: '?', n: null, onde: 'fora', motivo: 'escreve um número aí do lado' };

  const irr = IRRACIONAIS[t.toLowerCase()] ?? IRRACIONAIS[t];
  if (irr)
    return {
      ...irr,
      onde: 'fora',
      motivo: 'não existe fração de inteiros que dê exatamente ele, então ele fica fora das três',
    };

  /* dízima escrita com reticências: 0,333… é 1/3, e toda dízima periódica é fração */
  if (/(\.\.\.|…)$/.test(t)) {
    const num = Number(t.replace(/(\.\.\.|…)$/, '').replace(',', '.'));
    return {
      rotulo: menos(t.replace(/\.\.\.$/, '…')),
      n: Number.isFinite(num) ? num : null,
      onde: 'racional',
      motivo: 'dízima periódica, e toda dízima periódica dá pra escrever como fração',
    };
  }

  const frac = t.match(/^(-?\d+)\/(-?\d+)$/);
  if (frac) {
    const [a, b] = [Number(frac[1]), Number(frac[2])];
    if (b === 0)
      return { rotulo: menos(t), n: null, onde: 'fora', motivo: 'o de baixo não pode ser zero' };
    const v = a / b;
    if (Number.isInteger(v))
      return {
        rotulo: menos(t),
        n: v,
        onde: v >= 0 ? 'natural' : 'inteiro',
        motivo: `a divisão fecha e dá ${fmt(v)}, então ele é inteiro mesmo escrito como fração`,
      };
    return {
      rotulo: menos(t),
      n: v,
      onde: 'racional',
      motivo: 'já está escrito como fração de dois inteiros, entra na hora',
    };
  }

  const v = Number(t.replace(',', '.'));
  if (!Number.isFinite(v))
    return { rotulo: menos(t), n: null, onde: 'fora', motivo: 'não deu pra ler como número' };
  if (Number.isInteger(v))
    return {
      rotulo: fmt(v),
      n: v,
      onde: v >= 0 ? 'natural' : 'inteiro',
      motivo: v >= 0 ? 'inteiro e não negativo, então é número de contar' : 'inteiro negativo',
    };
  return {
    rotulo: fmt(v),
    n: v,
    onde: 'racional',
    motivo: 'decimal exato, então dá pra escrever como fração de denominador 10, 100, e por aí vai',
  };
};

const PERTENCE: { chave: Onde; simbolo: string; nome: string; aceita: Onde[] }[] = [
  { chave: 'natural', simbolo: 'ℕ', nome: 'naturais', aceita: ['natural'] },
  { chave: 'inteiro', simbolo: 'ℤ', nome: 'inteiros', aceita: ['natural', 'inteiro'] },
  {
    chave: 'racional',
    simbolo: 'ℚ',
    nome: 'racionais',
    aceita: ['natural', 'inteiro', 'racional'],
  },
];

const PRESETS = ['5', '-2', '0', '0,75', '3/4', '8/4', '0,333...', '√2'];

export default function Caixas({ valor: inicial = '3', titulo, chaveUrl }: CaixasProps) {
  const [texto, setTexto] = useState(inicial);
  const [congelado, setCongelado] = useState<Lido | null>(null);

  useEffect(() => {
    if (!chaveUrl) return;
    const bruto = new URLSearchParams(location.hash.slice(1)).get(chaveUrl);
    if (bruto) setTexto(bruto);
  }, [chaveUrl]);

  const lido = useMemo(() => ler(texto), [texto]);

  const copiarLink = () => {
    if (!chaveUrl) return;
    const p = new URLSearchParams(location.hash.slice(1));
    p.set(chaveUrl, texto);
    navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${p.toString()}`);
  };

  const dentroDe = (c: Onde) => PERTENCE.find((p) => p.chave === c)!.aceita.includes(lido.onde);

  const aria =
    `${lido.rotulo} está ` +
    (lido.onde === 'fora'
      ? 'fora dos naturais, dos inteiros e dos racionais.'
      : PERTENCE.filter((p) => p.aceita.includes(lido.onde))
          .map((p) => `nos ${p.nome}`)
          .join(', ') + '.');

  const bolinha = (l: Lido, fantasma = false) => (
    <span className={`cx-bola ${fantasma ? 'fantasma' : ''}`}>{l.rotulo}</span>
  );

  /* a vaga de cada caixa: o número entra na dela, e o congelado fica do lado */
  const conteudo = (nivel: Onde) => (
    <>
      {lido.onde === nivel && bolinha(lido)}
      {congelado && congelado.onde === nivel && bolinha(congelado, true)}
    </>
  );

  return (
    <figure className="cx">
      {titulo && <figcaption className="cx-titulo">{titulo}</figcaption>}

      <div className="cx-palco" role="img" aria-label={aria}>
        <div className="cx-fora">
          <span className="cx-rot">fora das três: os que não dão fração</span>
          <div className="cx-caixa q">
            <span className="cx-rot">ℚ racionais</span>
            <div className="cx-caixa z">
              <span className="cx-rot">ℤ inteiros</span>
              <div className="cx-caixa n">
                <span className="cx-rot">ℕ naturais</span>
                <div className="cx-vaga">{conteudo('natural')}</div>
              </div>
              <div className="cx-vaga">{conteudo('inteiro')}</div>
            </div>
            <div className="cx-vaga">{conteudo('racional')}</div>
          </div>
          <div className="cx-vaga">{conteudo('fora')}</div>
        </div>
      </div>

      <div className="cx-leitura">
        {PERTENCE.map((p) => (
          <span key={p.chave} className={`cx-frase ${dentroDe(p.chave) ? 'sim' : 'nao'}`}>
            {lido.rotulo} {dentroDe(p.chave) ? '∈' : '∉'} {p.simbolo}
          </span>
        ))}
        <span className="cx-motivo">{lido.motivo}</span>
      </div>

      <div className="cx-ctrl">
        <div className="cx-linha">
          <input
            className="cx-slider"
            type="range"
            min={-5}
            max={5}
            step={0.25}
            value={lido.n === null ? 0 : Math.min(5, Math.max(-5, lido.n))}
            onChange={(e) => setTexto(fmt(Number(e.target.value)).replace('−', '-'))}
            aria-label="Varrer os números de −5 a 5, de quarto em quarto"
          />
          <label className="cx-campo">
            número
            <input
              type="text"
              value={texto}
              size={7}
              onChange={(e) => setTexto(e.target.value)}
              aria-label="Escrever o número: aceita fração, dízima e raiz"
            />
          </label>
          <button
            className="cx-btn"
            onClick={() => setCongelado(congelado ? null : lido)}
            aria-pressed={!!congelado}
          >
            {congelado ? 'Soltar' : 'Congelar'}
          </button>
        </div>

        <div className="cx-linha">
          {PRESETS.map((p) => (
            <button key={p} className="cx-btn" onClick={() => setTexto(p)}>
              {menos(p)}
            </button>
          ))}
          <button
            className="cx-btn"
            onClick={() => {
              setTexto(inicial);
              setCongelado(null);
            }}
          >
            Recomeçar
          </button>
          {chaveUrl && (
            <button
              className="cx-btn sutil"
              onClick={copiarLink}
              title="Copiar link com esta configuração"
            >
              Copiar link
            </button>
          )}
        </div>
      </div>

      <p className="cx-nota">
        Arraste o slider de quarto em quarto e olha em quantas caixas o ponto está a cada parada.
        No campo do lado dá pra escrever fração (<code>3/4</code>), dízima (<code>0,333...</code>)
        e raiz (<code>√2</code>).
      </p>

      <style>{`
        .cx {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .cx-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .cx-palco { display: flex; justify-content: center; }
        .cx-fora, .cx-caixa {
          position: relative;
          border: 1px dashed var(--grade-forte);
          border-radius: var(--raio);
          padding: 22px 14px 12px;
          width: 100%;
        }
        .cx-fora { border-style: dotted; background: var(--papel-fundo); }
        .cx-caixa { border-style: solid; background: var(--papel); border-color: var(--grafite); }
        .cx-caixa.n { border-color: var(--tinta); }
        .cx-rot {
          position: absolute; top: 5px; left: 10px;
          font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--tinta-fraca); font-weight: 600;
        }
        /* a vaga existe pra a caixa não pular de altura quando o ponto sai dela */
        .cx-vaga {
          min-height: 40px; display: flex; align-items: center; gap: 8px;
          padding-left: 2px;
        }
        .cx-bola {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 2.6em; height: 2.6em; padding: 0 0.5em;
          border-radius: 999px; background: var(--azul); color: var(--papel);
          font-weight: 700; font-variant-numeric: tabular-nums;
          box-shadow: var(--sombra);
        }
        .cx-bola.fantasma {
          background: transparent; color: var(--tinta-fraca);
          border: 2px dashed var(--tinta-fraca); box-shadow: none;
        }

        .cx-leitura {
          display: flex; gap: 10px; flex-wrap: wrap; align-items: baseline;
          margin-top: calc(var(--u) * 0.5);
        }
        .cx-frase {
          font-size: 0.95rem; font-variant-numeric: tabular-nums;
          padding: 2px 8px; border-radius: var(--raio); border: 1px solid var(--linha);
        }
        .cx-frase.sim { color: var(--tinta); border-color: var(--tinta); font-weight: 600; }
        .cx-frase.nao { color: var(--tinta-fraca); text-decoration: line-through; }
        .cx-motivo { font-size: 0.86rem; color: var(--tinta-media); flex: 1 1 14rem; }

        .cx-ctrl {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: calc(var(--u) * 0.5); padding-top: calc(var(--u) * 0.5);
          border-top: 1px solid var(--linha);
        }
        .cx-linha { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .cx-slider { flex: 1; min-width: 140px; accent-color: var(--azul); }
        .cx-campo {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.74rem; color: var(--tinta-fraca);
        }
        .cx-campo input {
          font: inherit; font-size: 0.82rem; color: var(--tinta);
          border: 1px solid var(--linha); border-radius: var(--raio);
          padding: 4px 5px; background: var(--papel); text-align: center;
        }
        .cx-btn {
          font-family: var(--f-ui); font-size: 0.74rem;
          border: 1px solid var(--linha); background: var(--papel);
          color: var(--tinta-media); padding: 5px 11px;
          border-radius: var(--raio); cursor: pointer;
        }
        .cx-btn:hover { border-color: var(--tinta); color: var(--tinta); }
        .cx-btn[aria-pressed="true"] {
          background: var(--tinta); border-color: var(--tinta); color: var(--papel);
        }
        .cx-btn.sutil { color: var(--tinta-fraca); }
        .cx-nota {
          font-family: var(--f-ui); font-size: 0.74rem; color: var(--tinta-fraca);
          margin: calc(var(--u) * 0.4) 0 0;
        }
        .cx-nota code { font-size: 0.95em; }
      `}</style>
    </figure>
  );
}
