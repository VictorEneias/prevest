import type { ReactNode } from 'react';

/* <Alem> — a curiosidade que está além do escopo, numa caixinha fechada.
 *
 * Existe pro caso do "de onde vem esse truque": a explicação é boa, é honesta e
 * eu quero ela na página, porém ela usa assunto que ainda não foi dado, e quem
 * está lendo pela primeira vez trava ali achando que precisa entender aquilo pra
 * seguir. Fechada por padrão, ela vira um convite em vez de um obstáculo.
 *
 * Isto não é a volta das camadas de conteúdo que saíram em agosto. Aquelas
 * obrigavam TODO parágrafo a escolher uma caixa antes de ser escrito; esta é uma
 * caixa só, com um trabalho só, e o texto normal continua sendo prosa solta.
 * Se um dia aparecer uma segunda caixa, vale reler esta frase antes.
 */

export interface AlemProps {
  /** O que a caixinha promete, em uma linha. Vira o título clicável. */
  titulo: string;
  /** O assunto que a explicação usa e que ainda não foi dado. */
  precisa?: string;
  children: ReactNode;
}

export default function Alem({ titulo, precisa, children }: AlemProps) {
  return (
    <details className="alem">
      <summary>
        <span className="alem-tag">além do escopo</span>
        <span className="alem-titulo">{titulo}</span>
      </summary>

      <p className="alem-aviso">
        Esta explicação está fora do que a aula precisa
        {precisa ? (
          <>
            , e usa <b>{precisa}</b>, que não é pré-requisito daqui
          </>
        ) : (
          ', e fora dos pré-requisitos dela'
        )}
        . Se você já viu esse assunto, é muito bem-vindo e vale a leitura. Se não viu, dá pra
        pular sem perder absolutamente nada do que vem depois.
      </p>

      {children}

      <style>{`
        .alem {
          margin: calc(var(--u) * 1.1) 0;
          padding: calc(var(--u) * 0.5) calc(var(--u) * 0.75);
          background: var(--papel-fundo);
          border: 1px solid var(--grade-forte);
          border-left: 3px solid var(--grafite);
          border-radius: var(--raio);
        }
        .alem > summary {
          display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
          cursor: pointer; list-style: none;
          font-family: var(--f-ui); color: var(--tinta);
        }
        .alem > summary::-webkit-details-marker { display: none; }
        /* o sinal de abrir é texto, e não seta de tema do navegador, porque ele
           precisa dizer o que acontece pro aluno que nunca viu uma caixa dessas */
        .alem > summary::after {
          content: 'clique pra abrir';
          font-size: 0.72rem; color: var(--tinta-fraca); margin-left: auto;
        }
        .alem[open] > summary::after { content: 'clique pra fechar'; }
        .alem > summary:hover .alem-titulo { text-decoration: underline; }
        .alem > summary:focus-visible { outline: 2px solid var(--azul); outline-offset: 3px; }
        .alem-tag {
          font-size: 0.66rem; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: var(--grafite);
          border: 1px solid var(--grade-forte); border-radius: var(--raio);
          padding: 2px 6px; background: var(--papel); white-space: nowrap;
        }
        .alem-titulo { font-weight: 600; font-size: 1.02rem; }
        .alem-aviso {
          font-family: var(--f-ui); font-size: 0.8rem; color: var(--tinta-media);
          border-bottom: 1px solid var(--linha);
          margin: calc(var(--u) * 0.5) 0 calc(var(--u) * 0.6);
          padding-bottom: calc(var(--u) * 0.4);
        }
        .alem-aviso b { color: var(--tinta); }
        /* dentro da caixa o texto volta a ser texto de aula */
        .alem > p:not(.alem-aviso) { font-family: var(--f-texto); }
      `}</style>
    </details>
  );
}
