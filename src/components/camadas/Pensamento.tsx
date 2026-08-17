import type { ReactNode } from 'react';
import Camada from './Camada';

/**
 * O que passou na cabeça antes da conta: o que eu olhei primeiro, o que eu
 * descartei e por quê, como eu soube que era esse o caminho. Se virar resumo
 * da resolução, está errado.
 */
export default function Pensamento({ children }: { children?: ReactNode }) {
  return <Camada camada="pensamento" rotulo="Como eu penso nessa">{children}</Camada>;
}
