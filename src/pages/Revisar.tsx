import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { exercicios, porId, rotuloFonte, type Exercicio } from '../conteudo';
import { useTitulo } from '../estado';
import CartaoExercicio from '../components/CartaoExercicio';

/**
 * A mesa de auditoria dos exercícios. Só existe em `npm run dev`.
 *
 * O que ela resolve: com 300 exercícios na pasta, aprovar um é achar o arquivo
 * certo, descer até o frontmatter e trocar um `false` por `true`, e isso custa
 * mais tempo do que ler a resolução. Aqui o exercício aparece renderizado, do
 * jeito que o aluno vai ver, com o botão de aprovar e o texto do arquivo aberto
 * ao lado pra corrigir o que estiver ruim.
 *
 * Quem escreve em disco é o middleware de plugins/revisar.ts, que é do servidor
 * de desenvolvimento do Vite. No site publicado esta rota nem existe.
 *
 * O editor continua sendo o VS Code pro trabalho grande. Isto aqui é pra passada
 * de revisão: cortar uma dica repetida, trocar uma palavra e aprovar.
 */

const api = async (caminho: string, opcoes?: RequestInit) => {
  const r = await fetch(`/__revisar${caminho}`, opcoes);
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.erro ?? 'deu ruim');
  return dados as { id: string; texto: string };
};

export default function Revisar() {
  useTitulo('Revisar');
  const [aberto, setAberto] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [recado, setRecado] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  /* o índice do MDX é congelado no import, então depois de gravar eu marco quem
     mudou pra tela não continuar dizendo "pendente" até o HMR passar */
  const [aprovados, setAprovados] = useState<Set<string>>(new Set());

  const { pendentes, prontos } = useMemo(() => {
    const jaFoi = (e: Exercicio) => e.verificado || aprovados.has(e.id);
    return {
      pendentes: exercicios.filter((e) => !jaFoi(e)),
      prontos: exercicios.filter(jaFoi),
    };
  }, [aprovados]);

  const abrir = async (id: string) => {
    if (aberto === id) return setAberto(null);
    setRecado(null);
    try {
      const { texto } = await api(`?id=${id}`);
      setTexto(texto);
      setAberto(id);
    } catch (e) {
      setRecado((e as Error).message);
    }
  };

  const gravar = async (id: string, corpo: Record<string, unknown>) => {
    setSalvando(true);
    setRecado(null);
    try {
      await api(`?id=${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      if (corpo.verificado === true) setAprovados((a) => new Set(a).add(id));
      if (corpo.verificado === false) {
        setAprovados((a) => {
          const n = new Set(a);
          n.delete(id);
          return n;
        });
      }
      setRecado('gravado');
    } catch (e) {
      setRecado((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  const fila = (titulo: string, lista: Exercicio[], pendente: boolean) => (
    <section className="rv-fila">
      <p className="rotulo-secao">
        {titulo} <b>{lista.length}</b>
      </p>
      {lista.length === 0 && (
        <p className="nota-secao">{pendente ? 'Nada esperando você.' : 'Nenhum aprovado ainda.'}</p>
      )}
      {lista.map((e) => (
        <div className="rv-item" key={e.id}>
          <div className="rv-barra">
            <code>{e.id}.mdx</code>
            <span className="rv-tag">{rotuloFonte(e)}</span>
            <span className="rv-tag">{e.nivel}</span>
            {e.modulos.map((m) => (
              <span className="rv-tag" key={m}>
                {porId.get(m)?.titulo ?? m}
              </span>
            ))}
            <span className="rv-espaco" />
            <button
              className="rv-botao"
              disabled={salvando}
              onClick={() => gravar(e.id, { verificado: pendente })}
            >
              {pendente ? '✓ Aprovar' : 'Voltar pra rascunho'}
            </button>
            <button className="rv-botao" onClick={() => abrir(e.id)}>
              {aberto === e.id ? 'Fechar o arquivo' : 'Editar o arquivo'}
            </button>
          </div>

          {aberto === e.id && (
            <div className="rv-editor">
              <textarea
                value={texto}
                onChange={(ev) => setTexto(ev.target.value)}
                spellCheck={false}
                rows={Math.min(40, texto.split('\n').length + 2)}
              />
              <div className="rv-barra">
                <button
                  className="rv-botao forte"
                  disabled={salvando}
                  onClick={() => gravar(e.id, { texto })}
                >
                  Gravar no arquivo
                </button>
                <span className="rv-dica">
                  grava direto em <code>content/exercicios/{e.id}.mdx</code>, e o histórico é o git
                </span>
              </div>
            </div>
          )}

          <CartaoExercicio e={e} />
        </div>
      ))}
    </section>
  );

  return (
    <div className="folha folha-larga">
      <p className="aula-etiqueta">auditoria</p>
      <h1>Revisar exercícios</h1>
      <p className="nota-secao">
        Esta página só existe no <code>npm run dev</code>, e é a única do site que escreve em
        disco. Exercício aprovado passa a aparecer na <Link to="/exercicios">busca</Link> do site
        publicado; enquanto não for, ele fica só aqui e no dev.
      </p>

      {recado && <p className={`rv-recado ${recado === 'gravado' ? 'ok' : 'ruim'}`}>{recado}</p>}

      {fila('Esperando auditoria', pendentes, true)}
      {fila('Já aprovados', prontos, false)}

      <style>{`
        .rv-fila { margin-top: calc(var(--u) * 1.2); }
        .rv-item {
          margin: calc(var(--u) * 0.8) 0;
          border-left: 3px solid var(--linha);
          padding-left: calc(var(--u) * 0.6);
        }
        .rv-barra {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          font-family: var(--f-ui); font-size: 0.74rem;
        }
        .rv-espaco { flex: 1; }
        .rv-tag {
          padding: 2px 8px; border: 1px solid var(--linha); border-radius: 999px;
          color: var(--tinta-fraca);
        }
        .rv-botao {
          font-family: var(--f-ui); font-size: 0.74rem; font-weight: 600;
          padding: 5px 11px; border: 1px solid var(--linha); border-radius: 6px;
          background: var(--papel); color: var(--tinta-media); cursor: pointer;
        }
        .rv-botao:hover { border-color: var(--tinta); color: var(--tinta); }
        .rv-botao.forte { border-color: var(--acento); color: var(--acento); }
        .rv-botao:disabled { opacity: 0.5; cursor: default; }
        .rv-editor { margin: calc(var(--u) * 0.5) 0; }
        .rv-editor textarea {
          width: 100%; font-family: var(--f-mono, ui-monospace, monospace);
          font-size: 0.78rem; line-height: 1.5; color: var(--tinta);
          background: var(--papel-fundo); border: 1px solid var(--linha);
          border-radius: 6px; padding: calc(var(--u) * 0.5); resize: vertical;
        }
        .rv-dica { color: var(--tinta-fraca); }
        .rv-recado {
          font-family: var(--f-ui); font-size: 0.78rem; padding: 6px 10px;
          border-radius: 6px; border: 1px solid var(--linha);
        }
        .rv-recado.ok { color: var(--acento); border-color: var(--acento); }
        .rv-recado.ruim { color: var(--vermelho); border-color: var(--vermelho); }
      `}</style>
    </div>
  );
}
