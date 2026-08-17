import type { ReactNode } from 'react';
import Camada from './Camada';

/**
 * O aparte que o aluno abre se quiser: demonstração, dedução, de onde vem o
 * troço. Nasce fechada em todo modo, e como é camada some no Modo Aula
 * enquanto a página estiver em rascunho.
 */
export default function Curiosidade({
  rotulo = 'Curiosidade',
  children,
}: {
  rotulo?: string;
  children?: ReactNode;
}) {
  return <Camada camada="curiosidade" rotulo={rotulo}>{children}</Camada>;
}
