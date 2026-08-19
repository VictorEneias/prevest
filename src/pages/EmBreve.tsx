import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useTitulo } from '../estado';

/**
 * A página que ainda não existe.
 *
 * Ela é honesta de propósito: diz o que vai morar ali e por que ainda não mora,
 * em vez de "em breve" com uma ilustração. Exercícios, conta e as miudezas
 * institucionais usam esta mesma página.
 */
export default function EmBreve({ titulo, children }: { titulo: string; children: ReactNode }) {
  useTitulo(titulo);

  return (
    <div className="simples">
      <p className="aula-etiqueta">ainda não existe</p>
      <h1>{titulo}</h1>
      <p>{children}</p>
      <Link className="simples-volta" to="/">
        <span aria-hidden="true">←</span> Voltar pro mapa
      </Link>
    </div>
  );
}
