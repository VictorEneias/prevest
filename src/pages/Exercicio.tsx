import { useParams } from 'react-router-dom';
import { exercicioPorId } from '../conteudo';

const NIVEL: Record<string, string> = {
  A: 'Nível A — mecânica',
  B: 'Nível B — vestibular',
  C: 'Nível C — integração',
};

export default function Exercicio() {
  const { id } = useParams();
  const e = id ? exercicioPorId.get(id) : undefined;

  if (!e) {
    return (
      <div className="folha">
        <article className="papel">
          <h1>Exercício não encontrado</h1>
          <p>
            Não existe <code>content/exercicios/{id}.mdx</code>.
          </p>
        </article>
      </div>
    );
  }

  const { Corpo } = e;

  return (
    <div className="folha">
      <article className={`papel ${e.revisado ? '' : 'conceito-nao-revisado'}`}>
        {!e.revisado && (
          <div className="rascunho">
            <b>Rascunho — não revisado</b>
            Resolução não conferida. Refaça a conta antes de mostrar pro aluno.
          </div>
        )}
        <div className="ficha">
          <span>
            <b>{e.fonte}</b>
          </span>
          <span>{NIVEL[e.nivel]}</span>
          {e.tempo_alvo && <span>alvo: {e.tempo_alvo} min</span>}
        </div>
        <hr className="regua" />
        <Corpo />
      </article>
    </div>
  );
}
