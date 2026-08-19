import { useParams } from 'react-router-dom';
import { dependemDe, porId } from '../conteudo';
import { ROTULO_MATERIA, rotuloBloco } from '../lib/curriculo';
import { useTitulo } from '../estado';
import C from '../components/C';
import MapaConceitos from '../components/viz/MapaConceitos';

const NIVEL: Record<string, string> = {
  base: 'Base',
  medio: 'Ensino médio',
};

/** A rota /conceitos/:id. O título da aba sai daqui e não do <Conceito>, senão
 *  abrir um painel renomearia a aba da página que está atrás. */
export function PaginaConceito() {
  const { id } = useParams();
  useTitulo(porId.get(id ?? '')?.titulo);
  return <Conceito id={id ?? ''} />;
}

/**
 * A página de uma aula. A mesma serve de página inteira e de conteúdo de painel:
 * no painel eu corto o cromo (título grande, ficha, mapa do rodapé) e deixo só o
 * que o aluno precisa ler pra desentalar.
 */
export default function Conceito({
  id,
  dentroDePainel = false,
}: {
  id: string;
  dentroDePainel?: boolean;
}) {
  const c = porId.get(id);

  if (!c) {
    return (
      <div className="folha">
        <article className="papel">
          <h1>Aula não encontrada</h1>
          <p>
            Não existe <code>content/conceitos/{id}.mdx</code>. Rode <code>npm run grafo</code> pra
            ver quem aponta pra esse id.
          </p>
        </article>
      </div>
    );
  }

  const { Corpo } = c;
  const filhos = dependemDe(c.id);

  if (dentroDePainel) {
    return (
      <div className="folha">
        <article className="papel">
          <p className="aula-etiqueta">{rotuloBloco(c.bloco)}</p>
          <h2>{c.titulo}</h2>
          {c.resumo && <p className="aula-subtitulo">{c.resumo}</p>}
          <hr className="regua" />
          <div className="aula">
            <Corpo />
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="folha">
      <article className="papel">
        {!c.revisado && (
          <p className="rascunho">
            <b>Rascunho</b> Ainda não conferi esta página linha por linha.
          </p>
        )}

        <p className="aula-etiqueta">
          {ROTULO_MATERIA[c.materia]} · {rotuloBloco(c.bloco)}
        </p>
        <h1>{c.titulo}</h1>
        {c.subtitulo && <p className="aula-subtitulo">{c.subtitulo}</p>}

        {/* Os dois tempos entram, e quem escolhe qual aparece é o modo: em
            estudo o aluno vê o de leitura, em aula eu vejo o meu. Quem troca é
            o CSS, como todo o resto do Modo Aula. */}
        <ul className="ficha">
          <li>{NIVEL[c.nivel]}</li>
          {c.tempo_leitura && <li className="tempo-leitura">{c.tempo_leitura} min de leitura</li>}
          {c.tempo_estimado && <li className="tempo-aula">{c.tempo_estimado} min de aula</li>}
          {c.itens_fuvest !== undefined && (
            <li>
              <b>{c.itens_fuvest}</b> itens FUVEST
            </li>
          )}
        </ul>

        {c.topicos.length > 0 && (
          <>
            <p className="rotulo-secao">O que tem nesta aula</p>
            <ul className="topicos">
              {c.topicos.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}

        {c.prereqs.length > 0 && (
          <>
            <p className="rotulo-secao">Precisa saber antes</p>
            <ul className="prereq-lista">
              {c.prereqs.map((p) => (
                <li key={p}>
                  <C id={p}>{porId.get(p)?.titulo ?? p}</C>
                </li>
              ))}
            </ul>
          </>
        )}

        <hr className="regua" />
        <div className="aula">
          <Corpo />
        </div>

        {(filhos.length > 0 || c.prereqs.length > 0) && (
          <div className="vizinhanca">
            <hr className="regua" />
            <p className="rotulo-secao">Onde esta aula se encaixa</p>
            <p className="nota-secao">
              Nada aqui está bloqueado. É só o que se conecta a esta aula: o que vem antes, em cima,
              e o que continua a partir dela, embaixo.
            </p>
            <MapaConceitos foco={c.id} raio={1} altura="34vh" />
          </div>
        )}
      </article>
    </div>
  );
}
