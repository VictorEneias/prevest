import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

/* <Par> — duas figuras na mesma linha.
 *
 * Quando o mesmo assunto é desenhado de dois jeitos (o C separado do A e o C
 * dentro do A, a união em volta e a união como um conjunto só), empilhar as duas
 * é ruim de duas formas: obriga o aluno a rolar entre uma e outra justamente
 * quando o argumento é a comparação, e faz a página parecer o dobro do que é.
 *
 * Ele avisa o filho que agora tem metade da largura, passando `compacto`. Sem
 * isso a figura só encolhe junto com o viewBox e o texto dela fica ilegível.
 */

export interface ParProps {
  children: ReactNode;
}

export default function Par({ children }: ParProps) {
  return (
    <div className="par">
      {Children.map(children, (filho) =>
        isValidElement<{ compacto?: boolean }>(filho)
          ? cloneElement(filho, { compacto: true })
          : filho,
      )}

      <style>{`
        .par {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: calc(var(--u) * 0.6);
          margin: calc(var(--u) * 1.25) 0;
          align-items: start;
        }
        /* a margem vertical é do <Par>, senão as duas figuras empurram uma linha
           de sobra dentro da grade */
        .par > figure { margin: 0; }
        /* uma coluna quando a tela não dá pra duas: em tela de aula isso não
           acontece, e no celular do aluno acontece sempre */
        @media (max-width: 900px) {
          .par { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
