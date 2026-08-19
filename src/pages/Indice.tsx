import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { conceitos } from '../conteudo';
import { rotuloBloco } from '../lib/curriculo';
import { useTitulo } from '../estado';

/**
 * O índice remissivo do site.
 *
 * O mapa tem 84 aulas e serve pra ver como o curso se encaixa. Ele não serve
 * pra quem chega com uma dúvida específica: quem quer distância de ponto a reta
 * ia percorrer a linha de geometria, não achar nada com esse nome e sair fora.
 * Aqui estão os 762 tópicos que as aulas declaram cobrir, cada um levando pra
 * aula que cobre. É a lista do fim do livro, não o sumário.
 */

const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

interface Item {
  topico: string;
  id: string;
  aula: string;
  bloco: string;
}

export default function Indice() {
  useTitulo('Índice de assuntos');
  /* A busca do topo não procura sozinha: ela manda o texto pra cá por ?q=, que
     é o mesmo campo desta página. Assim existe uma implementação de busca só. */
  const [parametros, setParametros] = useSearchParams();
  const [busca, setBusca] = useState(() => parametros.get('q') ?? '');

  useEffect(() => {
    const q = parametros.get('q') ?? '';
    setBusca((atual) => (q && q !== atual ? q : atual));
  }, [parametros]);

  const todos = useMemo<Item[]>(
    () =>
      conceitos
        .flatMap((c) => c.topicos.map((t) => ({ topico: t, id: c.id, aula: c.titulo, bloco: c.bloco })))
        .sort((a, b) => a.topico.localeCompare(b.topico, 'pt-BR')),
    [],
  );

  const achados = useMemo(() => {
    const q = semAcento(busca.trim());
    if (!q) return todos;
    return todos.filter((i) => semAcento(i.topico).includes(q) || semAcento(i.aula).includes(q));
  }, [busca, todos]);

  /* Agrupado por letra, que é como se lê um índice: o olho vai direto na letra. */
  const grupos = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const i of achados) {
      const letra = semAcento(i.topico[0] ?? '?').toUpperCase();
      if (!m.has(letra)) m.set(letra, []);
      m.get(letra)!.push(i);
    }
    return [...m.entries()];
  }, [achados]);

  return (
    <div className="folha folha-larga">
      <h1>Índice de assuntos</h1>
      <p className="nota-secao" style={{ maxWidth: '62ch' }}>
        Tudo que as aulas cobrem, em ordem alfabética. Se você sabe o nome do que está
        travando, procure aqui. Se quer ver como uma coisa leva na outra, o{' '}
        <Link to="/">mapa</Link> faz esse trabalho.
      </p>

      <input
        type="search"
        className="mapa-busca indice-busca"
        placeholder="O que você está procurando?"
        aria-label="Procurar assunto"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setParametros(e.target.value ? { q: e.target.value } : {}, { replace: true });
        }}
        autoFocus
      />

      <p className="ficha">
        <span>
          <b>{achados.length}</b> {achados.length === 1 ? 'assunto' : 'assuntos'}
          {busca.trim() && ` de ${todos.length}`}
        </span>
      </p>

      {achados.length === 0 ? (
        <p>
          Nada com esse nome. Tente uma palavra só (<i>parábola</i>, <i>fatorial</i>,{' '}
          <i>tangente</i>), ou procure no <Link to="/">mapa</Link>.
        </p>
      ) : (
        grupos.map(([letra, itens]) => (
          <section key={letra} className="indice-grupo">
            <h2 className="indice-letra" aria-hidden="true">
              {letra}
            </h2>
            <ul className="indice-lista">
              {itens.map((i, k) => (
                <li key={`${i.id}-${k}`}>
                  <Link to={`/conceitos/${i.id}`}>
                    <span className="indice-topico">{i.topico}</span>
                    <span className="indice-aula">{i.aula}</span>
                    <span className="indice-area">{rotuloBloco(i.bloco)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
