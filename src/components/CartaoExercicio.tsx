import { Link } from 'react-router-dom';
import { porId, rotuloFonte, type Exercicio } from '../conteudo';
import { slotDeCor } from '../lib/curriculo';

/* O cartão de um exercício, com a ficha em cima e o corpo do .mdx embaixo.
 *
 * Mora fora da página de busca porque ele aparece nos dois lugares: na busca e
 * no fim da aula. O corpo já vem com a escada de dicas e a resolução fechada,
 * então o cartão só precisa dizer de onde o exercício veio e o que ele cobra. */

export interface CartaoExercicioProps {
  e: Exercicio;
  /** No fim da aula, a ficha da própria aula é ruído: todo exercício dali é
   *  dela. Na busca não passa nada e todos os módulos aparecem. */
  ocultarModulo?: string;
}

export default function CartaoExercicio({ e, ocultarModulo }: CartaoExercicioProps) {
  const { Corpo } = e;
  return (
    <article className="ex" id={e.id}>
      <header className="ex-topo">
        <span className="ex-fonte">{rotuloFonte(e)}</span>
        <span className="ex-nivel" data-nivel={e.nivel}>
          {e.nivel === 'basico' ? 'básico' : e.nivel === 'medio' ? 'médio' : 'desafio'}
        </span>
        {e.modulos.filter((m) => m !== ocultarModulo).map((m) => (
          <Link
            key={m}
            className="ex-modulo"
            to={`/conceitos/${m}`}
            data-slot={slotDeCor(porId.get(m)?.materia ?? 'matematica', porId.get(m)?.bloco ?? '')}
          >
            {porId.get(m)?.titulo ?? m}
          </Link>
        ))}
        {!e.verificado && (
          <span className="ex-pendente" title={`content/exercicios/${e.id}.mdx`}>
            não verificado
          </span>
        )}
        {e.fonte_url && (
          <a className="ex-origem" href={e.fonte_url} target="_blank" rel="noreferrer">
            prova original{e.fonte_questao ? ` · questão ${e.fonte_questao}` : ''}
          </a>
        )}
      </header>

      <Corpo />
    </article>
  );
}
