import { useEffect, useMemo, useRef, useState } from 'react';
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
 * "o que a FUVEST já cobrou disso".
 *
 * Dificuldade e banca são fichas que ligam e desligam porque são três e cinco.
 * A aula não: são 84 quando o currículo fechar, e 84 fichas na tela viram uma
 * parede que ninguém lê. Então ali eu procuro pelo nome e vou somando aula, e o
 * que fica desenhado é só o que eu escolhi.
 *
 * A ordem com vários módulos escolhidos é o tamanho da interseção: quem cobra
 * dois dos módulos que você marcou vem antes de quem cobra um. É o que faz
 * escolher duas aulas significar "quero o exercício que junta as duas".
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

const tituloDe = (id: string) => porId.get(id)?.titulo ?? id;
const slotDe = (id: string) =>
  slotDeCor(porId.get(id)?.materia ?? 'matematica', porId.get(id)?.bloco ?? '');

export default function Exercicios() {
  useTitulo('Exercícios');
  const [parametros, setParametros] = useSearchParams();

  const niveis = lista(parametros.get('nivel'));
  const fontes = lista(parametros.get('fonte'));
  const modulos = lista(parametros.get('modulos'));
  const soPendentes = parametros.get('pendentes') === 'sim';

  const [buscaModulo, setBuscaModulo] = useState('');
  const [aberta, setAberta] = useState(false);
  const [destaque, setDestaque] = useState(0);
  const campo = useRef<HTMLInputElement>(null);

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
        tituloDe(a[0]).localeCompare(tituloDe(b[0]), 'pt-BR'),
      ),
      pendentes: exerciciosVisiveis.filter((e) => !e.verificado).length,
    };
  }, []);

  const achados = useMemo(() => {
    const filtrados = exerciciosVisiveis.filter((e) => {
      if (niveis.length && !niveis.includes(e.nivel)) return false;
      if (fontes.length && !fontes.includes(e.fonte)) return false;
      if (soPendentes && e.verificado) return false;
      if (modulos.length && !e.modulos.some((m) => modulos.includes(m))) return false;
      return true;
    });

    const ordem = { basico: 0, medio: 1, desafio: 2 };
    const juntos = (e: Exercicio) => e.modulos.filter((m) => modulos.includes(m)).length;
    return filtrados.sort(
      (a, b) => juntos(b) - juntos(a) || ordem[a.nivel] - ordem[b.nivel] || a.id.localeCompare(b.id),
    );
  }, [niveis.join(), fontes.join(), modulos.join(), soPendentes]);

  const filtrando = niveis.length > 0 || fontes.length > 0 || modulos.length > 0 || soPendentes;

  /* A sugestão nunca oferece o que já está escolhido, senão o aluno clica de novo
     na aula que já somou e nada acontece na tela. */
  const sugestoes = useMemo(() => {
    const q = semAcento(buscaModulo.trim());
    return modulosExistentes.filter(
      ([id]) => !modulos.includes(id) && (!q || semAcento(tituloDe(id)).includes(q)),
    );
  }, [buscaModulo, modulos.join(), modulosExistentes]);

  useEffect(() => setDestaque(0), [buscaModulo, modulos.join()]);

  const somar = (id: string) => {
    escrever('modulos', [...modulos, id]);
    setBuscaModulo('');
    setDestaque(0);
    campo.current?.focus();
  };

  const teclado = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!aberta) return setAberta(true);
      const passo = e.key === 'ArrowDown' ? 1 : -1;
      setDestaque((i) => (sugestoes.length ? (i + passo + sugestoes.length) % sugestoes.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const alvo = sugestoes[destaque];
      if (alvo) somar(alvo[0]);
    } else if (e.key === 'Escape') {
      setAberta(false);
    } else if (e.key === 'Backspace' && !buscaModulo && modulos.length) {
      /* apagar com o campo vazio tira a última aula somada, que é o que todo campo
         de etiqueta faz e o que a mão tenta antes de procurar o × */
      escrever('modulos', modulos.slice(0, -1));
    }
  };

  return (
    <div className="folha folha-larga">
      <p className="aula-etiqueta">exercícios</p>
      <h1>Praticar</h1>
      <p className="nota-secao">
        Escolha as aulas que você quer treinar e o quanto quer apanhar. Somando mais de uma aula,
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

          <div
            className="filtro-combo"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setAberta(false);
            }}
          >
            <input
              ref={campo}
              type="text"
              role="combobox"
              className="filtro-busca"
              placeholder="Procure a aula e vá somando"
              aria-label="Procurar aula pelo nome"
              aria-expanded={aberta}
              aria-controls="sugestao-aulas"
              autoComplete="off"
              value={buscaModulo}
              onChange={(e) => {
                setBuscaModulo(e.target.value);
                setAberta(true);
              }}
              onFocus={() => setAberta(true)}
              onKeyDown={teclado}
            />
            {aberta && (
              <ul className="filtro-sugestoes" id="sugestao-aulas" role="listbox">
                {sugestoes.length === 0 ? (
                  <li className="filtro-vazio">
                    {modulosExistentes.length === modulos.length
                      ? 'você já somou todas as aulas que têm exercício'
                      : 'nenhuma aula com exercício por esse nome'}
                  </li>
                ) : (
                  sugestoes.map(([id, n], i) => (
                    <li key={id}>
                      <button
                        role="option"
                        aria-selected={i === destaque}
                        data-slot={slotDe(id)}
                        /* o mousedown tira o foco do campo antes do clique chegar, e aí
                           a lista fecha debaixo do dedo */
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => somar(id)}
                        ref={(el) => {
                          if (el && i === destaque) el.scrollIntoView({ block: 'nearest' });
                        }}
                      >
                        <i className="filtro-ponto" aria-hidden="true" />
                        {tituloDe(id)} <span>{n}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {modulos.length > 0 && (
            <div className="filtro-fichas filtro-escolhidas">
              {modulos.map((id) => (
                <button
                  key={id}
                  data-slot={slotDe(id)}
                  aria-pressed={true}
                  title="tirar esta aula do filtro"
                  onClick={() => alternar('modulos', modulos, id)}
                >
                  {tituloDe(id)} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          )}
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
