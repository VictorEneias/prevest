import type { ReactNode } from 'react';

/* A resolução, fechada.
 *
 * Fechada porque exercício com a resposta à vista não é exercício, é exemplo, e
 * o aluno que lê a resolução antes de tentar sai achando que entendeu. Dentro
 * dela o texto é markdown normal, com os `###` de sempre: "Como eu penso" e
 * "Onde o pessoal escorrega" são títulos, e não mais duas caixas.
 */

export interface ResolucaoProps {
  /** A resposta, repetida aqui em cima pra quem só quer conferir se acertou. */
  resposta?: string;
  children: ReactNode;
}

export default function Resolucao({ resposta, children }: ResolucaoProps) {
  return (
    <details className="resol">
      <summary>
        <span className="resol-tit">Ver a resolução</span>
        <span className="resol-aviso">tenta de verdade antes, mesmo que dê errado</span>
      </summary>

      {resposta && (
        <p className="resol-resposta">
          Resposta: <b>{resposta}</b>
        </p>
      )}

      {children}

      <style>{`
        .resol {
          margin: calc(var(--u) * 0.9) 0;
          padding: calc(var(--u) * 0.5) calc(var(--u) * 0.7);
          border: 1px solid var(--linha);
          border-radius: 6px;
          background: var(--papel);
        }
        .resol > summary {
          display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
          cursor: pointer; list-style: none; font-family: var(--f-ui);
        }
        .resol > summary::-webkit-details-marker { display: none; }
        .resol > summary::after {
          content: '▸'; margin-left: auto; color: var(--tinta-fraca);
        }
        .resol[open] > summary::after { content: '▾'; }
        .resol > summary:focus-visible { outline: 2px solid var(--azul); outline-offset: 3px; }
        .resol-tit { font-weight: 700; font-size: 0.86rem; color: var(--tinta); }
        .resol-aviso { font-size: 0.72rem; color: var(--tinta-fraca); }
        .resol-resposta {
          font-family: var(--f-ui); font-size: 0.86rem; color: var(--tinta-media);
          border-bottom: 1px solid var(--linha);
          margin: calc(var(--u) * 0.5) 0 calc(var(--u) * 0.6);
          padding-bottom: calc(var(--u) * 0.4);
        }
        .resol-resposta b { color: var(--tinta); }
        .resol h3 {
          font-size: 0.94rem; margin: calc(var(--u) * 0.8) 0 calc(var(--u) * 0.3);
        }
      `}</style>
    </details>
  );
}
