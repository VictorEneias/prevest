import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { exerciciosVisiveis, porId, type Exercicio } from '../conteudo';
import { slotDeCor } from '../lib/curriculo';
import { useTitulo } from '../estado';
import CartaoExercicio from '../components/CartaoExercicio';

/**
 * A busca de exercícios.
 *
 * Ela é uma página de filtro, e não uma lista: com o currículo inteiro coberto
 * são centenas de exercícios, e o aluno chega querendo "os básicos de fração" ou
 * "o que a FUVEST já cobrou disso". Os três filtros são os três eixos que o
 * exercício declara, mais o "multidisciplinar", que ninguém declara porque ele é
 * `modulos.length > 1`.
 *
 * A ordem com vários módulos escolhidos é o tamanho da interseção: quem cobra
 * dois dos módulos que você marcou vem antes de quem cobra um. É o que faz
 * marcar duas aulas significar "quero o exercício que junta as duas".
 *
 * O estado inteiro mora na URL, então o filtro montado é um link: o Victor
 * manda "resolve estes" pro aluno sem precisar de lista de tarefa nenhuma.
 */

const NIVEIS = [
  ['basico', 'Básico'],
  ['medio', 'Médio'],
  ['desafio', 'Desafio'],
] as const;

const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Lê um parâmetro que guarda lista, como ?modulos=juncao,fracoes */
const lista = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

export default function Exercicios() {
  useTitulo('Exercícios');
  const [parametros, setParametros] = useSearchParams();

  const niveis = lista(parametros.get('nivel'));
  const fontes = lista(parametros.get('fonte'));
  const modulos = lista(parametros.get('modulos'));
  const soMulti = parametros.get('multi') === 'sim';
  const soPendentes = parametros.get('pendentes') === 'sim';
  const [buscaModulo, setBuscaModulo] = useState('');

  /* Escrever um filtro é reescrever a URL inteira, com replace: assim o botão
     de voltar do navegador não vira um desfazer de clique em clique. */
  const escrever = (chave: string, valor: string[] | boolean) => {
    const p = new URLSearchParams(parametros);
    const vazio = Array.isArray(valor) ? valor.length === 0 : !valor;
    if (vazio) p.delete(chave);
    else p.set(chave, Array.isArray(valor) ? valor.join(',') : 'sim');
    setParametros(p, { replace: true });
  };
  const alternar = (chave: string, atual: string[], v: string) =>
    escrever(chave, atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v]);

  /* Os filtros só oferecem o que existe: banca sem exercício nenhum na lista é
     um botão que só sabe devolver "nada encontrado". */
  const { fontesExistentes, modulosExistentes, pendentes } = useMemo(() => {
    const porFonte = new Map<string, number>();
    const porModulo = new Map<string, number>();
    for (const e of exerciciosVisiveis) {
      porFonte.set(e.fonte, (porFonte.get(e.fonte) ?? 0) + 1);
      for (const m of e.modulos) porModulo.set(m, (porModulo.get(m) ?? 0) + 1);
    }
    return {
      fontesExistentes: [...porFonte.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR')),
      modulosExistentes: [...porModulo.entries()].sort((a, b) =>
        (porId.get(a[0])?.titulo ?? a[0]).localeCompare(porId.get(b[0])?.titulo ?? b[0], 'pt-BR'),
      ),
      pendentes: exerciciosVisiveis.filter((e) => !e.verificado).length,
    };
  }, []);

  const achados = useMemo(() => {
    const filtrados = exerciciosVisiveis.filter((e) => {
      if (niveis.length && !niveis.includes(e.nivel)) return false;
      if (fontes.length && !fontes.includes(e.fonte)) return false;
      if (soMulti && e.modulos.length < 2) return false;
      if (soPendentes && e.verificado) return false;
      if (modulos.length && !e.modulos.some((m) => modulos.includes(m))) return false;
      return true;
    });

    const ordem = { basico: 0, medio: 1, desafio: 2 };
    const juntos = (e: Exercicio) => e.modulos.filter((m) => modulos.includes(m)).length;
    return filtrados.sort(
      (a, b) => juntos(b) - juntos(a) || ordem[a.nivel] - ordem[b.nivel] || a.id.localeCompare(b.id),
    );
  }, [niveis.join(), fontes.join(), modulos.join(), soMulti, soPendentes]);

  const filtrando =
    niveis.length > 0 || fontes.length > 0 || modulos.length > 0 || soMulti || soPendentes;

  const modulosNaLista = modulosExistentes.filter(([id]) => {
    const q = semAcento(buscaModulo.trim());
    if (!q) return true;
    return semAcento(porId.get(id)?.titulo ?? id).includes(q);
  });

  return (
    <div className="folha folha-larga">
      <p className="aula-etiqueta">exercícios</p>
      <h1>Praticar</h1>
      <p className="nota-secao">
        Escolha as aulas que você quer treinar e o quanto quer apanhar. Marcando mais de uma aula,
        os exercícios que cobram as duas juntas aparecem primeiro.
      </p>

      <div className="filtros">
        <div className="filtro-grupo">
          <p className="filtro-rot">Dificuldade</p>
          <div className="filtro-fichas">
            {NIVEIS.map(([v, rot]) => (
              <button
                key={v}
                aria-pressed={niveis.includes(v)}
                onClick={() => alternar('nivel', niveis, v)}
              >
                {rot}
              </button>
            ))}
            <button
              aria-pressed={soMulti}
              onClick={() => escrever('multi', !soMulti)}
              title="Exercícios que cobram mais de uma aula"
            >
              Multidisciplinar
            </button>
          </div>
        </div>

        <div className="filtro-grupo">
          <p className="filtro-rot">De onde vem</p>
          <div className="filtro-fichas">
            {fontesExistentes.map(([f, n]) => (
              <button key={f} aria-pressed={fontes.includes(f)} onClick={() => alternar('fonte', fontes, f)}>
                {f} <span>{n}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filtro-grupo filtro-modulos">
          <p className="filtro-rot">
            Aulas
            {modulos.length > 0 && (
              <button className="filtro-limpar" onClick={() => escrever('modulos', [])}>
                limpar
              </button>
            )}
          </p>
          {modulosExistentes.length > 6 && (
            <input
              type="search"
              className="filtro-busca"
              placeholder="Qual aula?"
              aria-label="Procurar aula"
              value={buscaModulo}
              onChange={(e) => setBuscaModulo(e.target.value)}
            />
          )}
          <div className="filtro-fichas">
            {modulosNaLista.map(([id, n]) => (
              <button
                key={id}
                data-slot={slotDeCor(porId.get(id)?.materia ?? 'matematica', porId.get(id)?.bloco ?? '')}
                aria-pressed={modulos.includes(id)}
                onClick={() => alternar('modulos', modulos, id)}
              >
                {porId.get(id)?.titulo ?? id} <span>{n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Só aparece em npm run dev, porque em produção não existe exercício não
            verificado pra listar. É a mesa de auditoria enquanto não tem conta. */}
        {import.meta.env.DEV && pendentes > 0 && (
          <div className="filtro-grupo">
            <p className="filtro-rot">Auditoria</p>
            <div className="filtro-fichas">
              <button aria-pressed={soPendentes} onClick={() => escrever('pendentes', !soPendentes)}>
                Só os não verificados <span>{pendentes}</span>
              </button>
              <Link className="filtro-ir" to="/revisar">
                abrir a mesa de auditoria →
              </Link>
            </div>
          </div>
        )}
      </div>

      <ul className="ficha">
        <li>
          <b>{achados.length}</b> {achados.length === 1 ? 'exercício' : 'exercícios'}
          {filtrando && ` de ${exerciciosVisiveis.length}`}
        </li>
      </ul>

      {achados.length === 0 ? (
        <p>
          Nada com esses filtros. Tira um deles, ou começa pelo{' '}
          <Link to="/">mapa</Link> pra ver quais aulas já existem.
        </p>
      ) : (
        achados.map((e) => <CartaoExercicio key={e.id} e={e} />)
      )}
    </div>
  );
}
