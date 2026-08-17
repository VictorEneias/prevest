import type { ReactNode } from 'react';
import { porId } from '../conteudo';
import { useAula } from '../estado';

/**
 * <C id="potenciacao">potenciação</C>
 *
 * Abre painel por cima em vez de navegar, porque trocar de página no meio da
 * explicação faz o aluno perder o fio. Os painéis empilham, então dá pra descer
 * até onde estiver o buraco e voltar fechando um por um.
 *
 * Id que não existe não derruba a página, só pinta o elo de vermelho: quem
 * acusa de verdade é o npm run grafo.
 */
export default function C({ id, children }: { id: string; children?: ReactNode }) {
  const { abrirConceito } = useAula();
  const alvo = porId.get(id);

  return (
    <button
      type="button"
      className="elo-conceito"
      data-conceito={id}
      data-quebrado={alvo ? 'nao' : 'sim'}
      title={alvo ? `Abrir: ${alvo.titulo}` : `CONCEITO INEXISTENTE: ${id}`}
      aria-label={alvo ? `Abrir pré-requisito: ${alvo.titulo}` : `Link quebrado: ${id}`}
      onClick={() => {
        if (!alvo) return;
        abrirConceito(id, alvo.titulo);
      }}
    >
      {children}
    </button>
  );
}
