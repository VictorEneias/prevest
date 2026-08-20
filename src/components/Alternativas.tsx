import { useState, Children, type ReactNode } from 'react';

/* As alternativas de uma questão de múltipla escolha.
 *
 * Antes elas eram uma linha de prosa com "(A) ... (B) ..." no meio, e numa
 * questão com fórmula isso virava uma parede: o (B) encostava no fim da fórmula
 * do (A) e o aluno lia tudo junto. Agora é uma por linha, e é clicável.
 *
 * Clicar marca: a certa fica verde e a errada fica vermelha, e as erradas ficam
 * marcadas, porque eliminar alternativa é parte de resolver questão de prova e
 * apagar a eliminação seria apagar o raciocínio. Achou a certa, para de aceitar
 * clique — insistir depois de acertar não ensina nada.
 *
 * Cor nunca vai sozinha: cada marca leva um glifo e a linha de baixo diz em
 * palavra o que aconteceu, porque deutan e protan não separam verde de vermelho.
 * É a mesma regra que está escrita na paleta do global.css.
 */

export interface AltProps {
  children: ReactNode;
}

/** Uma alternativa. Só existe dentro de <Alternativas>, e a letra é a posição. */
export function Alt({ children }: AltProps) {
  return <>{children}</>;
}

export interface AlternativasProps {
  /** A letra da certa: "A" a "E". */
  correta: string;
  children: ReactNode;
}

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function Alternativas({ correta, children }: AlternativasProps) {
  const itens = Children.toArray(children);
  const certa = correta.trim().toUpperCase();
  const [tentadas, setTentadas] = useState<string[]>([]);

  const acertou = tentadas.includes(certa);
  const ultima = tentadas[tentadas.length - 1];

  const marcar = (letra: string) => {
    if (acertou || tentadas.includes(letra)) return;
    setTentadas((t) => [...t, letra]);
  };

  return (
    <div className="alt">
      <ul className="alt-lista">
        {itens.map((item, i) => {
          const letra = LETRAS[i] ?? String(i + 1);
          const marcada = tentadas.includes(letra);
          const estado = marcada ? (letra === certa ? 'certa' : 'errada') : '';
          return (
            <li key={letra}>
              <button
                className={`alt-item ${estado}`}
                onClick={() => marcar(letra)}
                disabled={acertou && letra !== certa}
                aria-pressed={marcada}
                aria-label={`Alternativa ${letra}`}
              >
                <span className="alt-letra">{letra}</span>
                <span className="alt-texto">{item}</span>
                {marcada && (
                  <span className="alt-glifo" aria-hidden="true">
                    {letra === certa ? '✓' : '✗'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {tentadas.length > 0 && (
        <p className="alt-recado" role="status">
          <span className={acertou ? 'ok' : 'nao'}>
            {acertou
              ? `✓ é a ${certa} mesmo.`
              : `✗ a ${ultima} não é. Tenta outra, ou abre a primeira dica.`}
          </span>
          <button className="alt-limpar" onClick={() => setTentadas([])}>
            tentar novamente
          </button>
        </p>
      )}

      <style>{`
        .alt { margin: calc(var(--u) * 0.9) 0; }
        .alt-lista { list-style: none; margin: 0; padding: 0; }
        .alt-lista li { margin: 0 0 6px; }
        .alt-item {
          display: flex; align-items: flex-start; gap: 10px;
          width: 100%; text-align: left;
          padding: 7px 11px;
          font: inherit; color: var(--tinta-media);
          background: var(--papel);
          border: 1px solid var(--linha); border-radius: 6px;
          cursor: pointer;
        }
        .alt-item:hover:not(:disabled) { border-color: var(--tinta); color: var(--tinta); }
        .alt-item:disabled { cursor: default; opacity: 0.55; }
        .alt-letra {
          flex: none;
          font-family: var(--f-ui); font-size: 0.78rem; font-weight: 700;
          color: var(--tinta-fraca);
          padding-top: 2px; min-width: 1.1em;
        }
        .alt-texto { flex: 1; }
        .alt-texto > :first-child { margin-top: 0; }
        .alt-texto > :last-child { margin-bottom: 0; }
        .alt-glifo { flex: none; font-weight: 700; }

        .alt-item.certa {
          color: var(--verde); border-color: var(--verde); background: var(--verde-fraco);
        }
        .alt-item.certa .alt-letra, .alt-item.certa .alt-glifo { color: var(--verde); }
        .alt-item.errada {
          color: var(--vermelho); border-color: var(--vermelho); background: var(--vermelho-fraco);
        }
        .alt-item.errada .alt-letra, .alt-item.errada .alt-glifo { color: var(--vermelho); }

        .alt-recado {
          display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px;
          font-family: var(--f-ui); font-size: 0.8rem;
          margin: calc(var(--u) * 0.4) 0 0;
        }
        .alt-recado .ok { color: var(--verde); font-weight: 600; }
        .alt-recado .nao { color: var(--vermelho); font-weight: 600; }
        .alt-limpar {
          font-family: var(--f-ui); font-size: 0.78rem;
          color: var(--acento); background: none; border: 0; padding: 0;
          text-decoration: underline; cursor: pointer;
        }
      `}</style>
    </div>
  );
}
