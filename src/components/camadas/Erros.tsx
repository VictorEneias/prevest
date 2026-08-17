import type { ReactNode } from 'react';
import Camada from './Camada';

/** As armadilhas. Escreva o erro do jeito que o aluno comete. */
export default function Erros({ children }: { children?: ReactNode }) {
  return <Camada camada="erros" rotulo="Onde o pessoal escorrega">{children}</Camada>;
}
