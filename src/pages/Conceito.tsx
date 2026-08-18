import { useParams } from 'react-router-dom';
import { dependemDe, porId } from '../conteudo';
import { ROTULO_MATERIA, rotuloBloco } from '../lib/curriculo';
import { useTitulo } from '../estado';
import C from '../components/C';
import MapaConceitos from '../components/viz/MapaConceitos';

const NIVEL: Record<string, string> = {
  fundamento: 'Fundamento',
  basico: 'Básico',
  medio: 'Médio',
  avancado: 'Avançado',
};

/** A rota /conceitos/:id. O título da aba sai daqui e não do <Conceito>, senão
 *  abrir um painel renomearia a aba da página que está atrás. */
export function PaginaConceito() {
  const { id } = useParams();
  useTitulo(porId.get(id ?? '')?.titulo);
  return <Conceito id={id ?? ''} />;
}

/**
 * A página de um conceito. A mesma serve de página inteira e de conteúdo de
 * painel: no painel eu corto o cromo (título grande, ficha, mapa do rodapé) e
 * deixo só o que o aluno precisa ler pra desentalar. Antes isso era uma segunda
 * rota carregada dentro de um iframe.
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
          <h1>Conceito não encontrado</h1>
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
          <h2>{c.titulo}</h2>
          {c.resumo && <p style={{ color: 'var(--tinta-media)' }}>{c.resumo}</p>}
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

        <h1>{c.titulo}</h1>
        {c.subtitulo && (
          <p style={{ color: 'var(--tinta-media)', marginTop: 'calc(var(--u)*-0.5)' }}>
            {c.subtitulo}
          </p>
        )}

        <div className="ficha">
          <span>
            <b>{ROTULO_MATERIA[c.materia]}</b> · {rotuloBloco(c.bloco)}
          </span>
          <span>{NIVEL[c.nivel]}</span>
          {c.tempo_estimado && <span>~{c.tempo_estimado} min</span>}
          {c.itens_fuvest !== undefined && (
            <span>
              <b>{c.itens_fuvest}</b> itens FUVEST
            </span>
          )}
        </div>

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
          <>
            <hr className="regua" />
            <p className="rotulo-secao">Onde este módulo se encaixa</p>
            <p className="nota-secao">
              Nada aqui está bloqueado. É só o que se conecta a este módulo: o que vem antes, em
              cima, e o que continua a partir dele, embaixo.
            </p>
            <MapaConceitos foco={c.id} raio={1} altura="34vh" />
          </>
        )}
      </article>
    </div>
  );
}
