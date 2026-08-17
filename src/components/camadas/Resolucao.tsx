import type { ReactNode } from 'react';
import Camada from './Camada';

/** As contas. Fechada em aula. */
export default function Resolucao({ children }: { children?: ReactNode }) {
  return <Camada camada="resolucao" rotulo="Resolução">{children}</Camada>;
}
