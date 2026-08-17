import { useEffect, useRef, type ReactNode } from 'react';
import { CAMADAS_ABERTAS, useAula } from '../../estado';

/** Base das camadas. No MDX use os wrappers, não esta. */
export interface CamadaProps {
  camada: 'dica' | 'resolucao' | 'pensamento' | 'erros' | 'curiosidade';
  rotulo: string;
  children?: ReactNode;
}

export default function Camada({ camada, rotulo, children }: CamadaProps) {
  const { modo } = useAula();
  const ref = useRef<HTMLDetailsElement>(null);

  /* Mexo no open na mão em vez de controlar por prop: assim trocar de modo
     recoloca todas as camadas no estado do modo, e o aluno continua livre pra
     abrir uma no clique sem o React fechar de volta. */
  useEffect(() => {
    if (ref.current) ref.current.open = CAMADAS_ABERTAS[modo].includes(camada);
  }, [modo, camada]);

  return (
    <details ref={ref} className="camada" data-camada={camada}>
      <summary>{rotulo}</summary>
      <div className="camada-corpo">{children}</div>
    </details>
  );
}
