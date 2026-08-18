import { Link, useParams } from 'react-router-dom';
import { exercicioPorId, porId } from '../conteudo';
import { ROTULO_NIVEL_EX } from '../lib/curriculo';
import { useTitulo } from '../estado';

export default function Exercicio() {
  const { id } = useParams();
  const e = id ? exercicioPorId.get(id) : undefined;
  const principal = e ? porId.get(e.assuntos[0]) : undefined;
  useTitulo(principal ? `Exercício de ${principal.titulo}` : 'Exercício');

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
          <p className="rascunho">
            <b>Rascunho</b> Resolução ainda não conferida.
          </p>
        )}
        <div className="ficha">
          <span>
            <b>{e.fonte}</b>
          </span>
          <span>
            Nível {e.nivel} · {ROTULO_NIVEL_EX[e.nivel]}
          </span>
          {e.tempo_alvo && <span>alvo: {e.tempo_alvo} min</span>}
          {/* Sem esta volta, o exercício é um beco: o mapa não leva até ele e ele
              não leva a lugar nenhum. */}
          {principal && <Link to={`/conceitos/${principal.id}`}>← {principal.titulo}</Link>}
        </div>
        <hr className="regua" />
        <Corpo />
      </article>
    </div>
  );
}
