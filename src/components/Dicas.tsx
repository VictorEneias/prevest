import { useState, Children, type ReactNode } from 'react';

/* A escada de dicas.
 *
 * Ela abre um degrau por vez de propósito. Na primeira versão dos exercícios de
 * junção as três dicas ficavam abertas juntas, e a dica 1 já mandava reescrever
 * tudo em forma de junção enquanto a 3 entregava o procedimento inteiro: o aluno
 * lia as três de uma vez e copiava em vez de resolver.
 *
 * O degrau também não conta o que fazer, ele aponta pra onde olhar. Quem escreve
 * a dica tem que conseguir dizer o que o aluno ainda vai ter que descobrir
 * sozinho depois de ler.
 */

export interface DicaProps {
  children: ReactNode;
}

/** Um degrau. Só existe dentro de <Dicas>. */
export function Dica({ children }: DicaProps) {
  return <div className="dica-passo">{children}</div>;
}

export interface DicasProps {
  children: ReactNode;
}

export default function Dicas({ children }: DicasProps) {
  const degraus = Children.toArray(children);
  const [abertos, setAbertos] = useState(0);
  const total = degraus.length;

  return (
    <div className="dicas">
      <p className="dicas-tit">
        Travou? <span>as dicas sobem um degrau de cada vez</span>
      </p>

      {degraus.slice(0, abertos).map((d, i) => (
        <div className="dicas-linha" key={i}>
          <span className="dicas-num">dica {i + 1}</span>
          {d}
        </div>
      ))}

      {abertos < total ? (
        <button className="dicas-botao" onClick={() => setAbertos((a) => a + 1)}>
          {abertos === 0 ? 'Ver a primeira dica' : `Ainda travado, ver a dica ${abertos + 1}`}
          <span className="dicas-resta">
            {total - abertos} de {total}
          </span>
        </button>
      ) : (
        <p className="dicas-fim">
          Acabaram as dicas. Se ainda não saiu, abre a resolução e lê procurando o passo em que
          você travou, e não a resposta.
        </p>
      )}

      <style>{`
        .dicas {
          margin: calc(var(--u) * 0.9) 0;
          padding: calc(var(--u) * 0.5) calc(var(--u) * 0.7);
          background: var(--papel-fundo);
          border: 1px solid var(--linha);
          border-radius: 6px;
        }
        .dicas-tit {
          font-family: var(--f-ui); font-weight: 700; font-size: 0.8rem;
          color: var(--tinta); margin: 0;
        }
        .dicas-tit span { font-weight: 400; color: var(--tinta-fraca); }
        .dicas-linha {
          display: flex; gap: 10px; align-items: baseline;
          margin-top: calc(var(--u) * 0.45);
        }
        .dicas-num {
          flex: none;
          font-family: var(--f-ui); font-size: 0.64rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--acento); padding-top: 3px;
        }
        .dica-passo > :first-child { margin-top: 0; }
        .dica-passo > :last-child { margin-bottom: 0; }
        .dicas-botao {
          display: flex; align-items: center; gap: 10px;
          margin-top: calc(var(--u) * 0.5);
          padding: 6px 12px;
          font-family: var(--f-ui); font-size: 0.78rem; font-weight: 600;
          color: var(--tinta); background: var(--papel);
          border: 1px solid var(--linha); border-radius: 6px; cursor: pointer;
        }
        .dicas-botao:hover { border-color: var(--tinta); }
        .dicas-resta { font-weight: 400; font-size: 0.7rem; color: var(--tinta-fraca); }
        .dicas-fim {
          font-family: var(--f-ui); font-size: 0.78rem; color: var(--tinta-media);
          margin: calc(var(--u) * 0.5) 0 0;
        }
      `}</style>
    </div>
  );
}
