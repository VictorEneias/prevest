import type { ReactNode } from 'react';
import Camada from './Camada';

/**
 * A escada de dicas: 1 manda reler, 2 aponta um dado, 3 nomeia a ferramenta.
 * Nenhuma delas entrega a resposta. Fechada em todos os modos.
 */
const ROTULOS: Record<number, string> = {
  1: 'Dica 1 — reler',
  2: 'Dica 2 — onde olhar',
  3: 'Dica 3 — que ferramenta',
};

export default function Dica({ n, children }: { n: 1 | 2 | 3; children?: ReactNode }) {
  return <Camada camada="dica" rotulo={ROTULOS[n] ?? `Dica ${n}`}>{children}</Camada>;
}
