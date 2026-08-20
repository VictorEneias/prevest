import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ehBasico, exerciciosVisiveis, porId, type Exercicio } from '../conteudo';
import { slotDeCor } from '../lib/curriculo';
import { useTitulo } from '../estado';
import CartaoExercicio from '../components/CartaoExercicio';

/**
 * A busca de exercícios.
 *
 * Ela é uma página de filtro, e não uma lista: com o currículo inteiro coberto
 * são centenas de exercícios, e o aluno chega querendo "os básicos de fração" ou
 * "o que a FUVEST cobrou em 2024".
 *
 * São dois tipos de exercício, e quem separa é a fonte. O autoral é o básico da
 * aula, que cobra aquela aula e mais nada e fecha a página dela; todo o resto é
 * prova de vestibular. A dificuldade é outro eixo, e é por isso que "básico" e
 * "fácil" não são a mesma palavra: um básico de junção pode ser desafio, e uma
 * questão de prova pode sair na primeira leitura.
 *
 * Dificuldade é ficha que liga e desliga, porque são três. Aula e vestibular não:
 * são 84 aulas quando o currículo fechar, e a lista de bancas e anos só cresce.
 * Nesses dois eu procuro pelo nome e vou somando, e o que fica desenhado é só o
 * que já foi escolhido. O ano só aparece depois que tem vestibular escolhido,
 * senão ele é uma fileira de números sem dono.
 *
 * A ordem com vários módulos escolhidos é o tamanho da interseção: quem cobra
 * dois dos módulos que você marcou vem antes de quem cobra um.
 *
 * O estado inteiro mora na URL, então o filtro montado é um link: o Victor
 * manda "resolve estes" pro aluno sem precisar de lista de tarefa nenhuma.
 */

const NIVEIS = [
  ['facil', 'Fácil'],
  ['medio', 'Médio'],
  ['desafio', 'Desafio'],
] as const;

const AUTORAL = 'Autoral';

const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Lê um parâmetro que guarda lista, como ?modulos=juncao,fracoes */
const lista = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

const tituloDe = (id: string) => porId.get(id)?.titulo ?? id;
const slotDe = (id: string) =>
  slotDeCor(porId.get(id)?.materia ?? 'matematica', porId.get(id)?.bloco ?? '');

/* ---------- a busca que soma ---------- */

interface Opcao {
  valor: string;
  rotulo: string;
  /** quantos exercícios existem com essa opção, pro aluno não escolher o vazio */
  n: number;
  /** a cor da área, quando a opção tem uma. Vestibular não tem */
  slot?: number;
}

/**
 * Um campo que procura numa lista e vai somando o que você escolhe. É o mesmo
 * componente pra aula e pra vestibular, porque o problema é o mesmo: a lista
 * cresce com o currículo, e desenhar tudo de uma vez vira uma parede de botões.
 *
 * Ele nunca sugere o que já foi somado, senão o aluno clica na ficha que já
 * está ligada e nada acontece na tela.
 */
function BuscaQueSoma({
  dica,
  aria,
  opcoes,
  escolhidos,
  somar,
  tirar,
}: {
  dica: string;
  aria: string;
  opcoes: Opcao[];
  escolhidos: string[];
  somar: (v: string) => void;
  tirar: (v: string) => void;
}) {
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState(false);
  const [destaque, setDestaque] = useState(0);
  const campo = useRef<HTMLInputElement>(null);

  const porValor = useMemo(() => new Map(opcoes.map((o) => [o.valor, o])), [opcoes]);

  const sugestoes = useMemo(() => {
    const q = semAcento(busca.trim());
    return opcoes.filter(
      (o) => !escolhidos.includes(o.valor) && (!q || semAcento(o.rotulo).includes(q)),
    );
  }, [busca, escolhidos.join(), opcoes]);

  useEffect(() => setDestaque(0), [busca, escolhidos.join()]);

  const escolher = (v: string) => {
    somar(v);
    setBusca('');
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
      if (alvo) escolher(alvo.valor);
    } else if (e.key === 'Escape') {
      setAberta(false);
    } else if (e.key === 'Backspace' && !busca && escolhidos.length) {
      /* apagar com o campo vazio tira o último somado, que é o que a mão tenta
         antes de procurar o × */
      tirar(escolhidos[escolhidos.length - 1]);
    }
  };

  return (
    <>
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
          placeholder={dica}
          aria-label={aria}
          aria-expanded={aberta}
          autoComplete="off"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setAberta(true);
          }}
          onFocus={() => setAberta(true)}
          onKeyDown={teclado}
        />
        {aberta && (
          <ul className="filtro-sugestoes" role="listbox" aria-label={aria}>
            {sugestoes.length === 0 ? (
              <li className="filtro-vazio">
                {escolhidos.length === opcoes.length ? 'você já somou tudo que tem' : 'nada com esse nome'}
              </li>
            ) : (
              sugestoes.map((o, i) => (
                <li key={o.valor}>
                  <button
                    role="option"
                    aria-selected={i === destaque}
                    data-slot={o.slot}
                    /* o mousedown tira o foco do campo antes do clique chegar, e aí
                       a lista fecha debaixo do dedo */
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => escolher(o.valor)}
                    ref={(el) => {
                      if (el && i === destaque) el.scrollIntoView({ block: 'nearest' });
                    }}
                  >
                    {o.slot !== undefined && <i className="filtro-ponto" aria-hidden="true" />}
                    {o.rotulo} <span>{o.n}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {escolhidos.length > 0 && (
        <div className="filtro-fichas filtro-escolhidas">
          {escolhidos.map((v) => (
            <button
              key={v}
              data-slot={porValor.get(v)?.slot}
              aria-pressed={true}
              title="tirar do filtro"
              onClick={() => tirar(v)}
            >
              {porValor.get(v)?.rotulo ?? v} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- a página ---------- */

export default function Exercicios() {
  useTitulo('Exercícios');
  const [parametros, setParametros] = useSearchParams();

  const niveis = lista(parametros.get('nivel'));
  const fontes = lista(parametros.get('fonte'));
  const anos = lista(parametros.get('ano'));
  const modulos = lista(parametros.get('modulos'));
  const soPendentes = parametros.get('pendentes') === 'sim';

  const bancasEscolhidas = fontes.filter((f) => f !== AUTORAL);
  const comBasicos = fontes.includes(AUTORAL);

  /* Escrever um filtro é reescrever a URL inteira, com replace: assim o botão
     de voltar do navegador não vira um desfazer de clique em clique. */
  const escrever = (mudancas: Record<string, string[] | boolean>) => {
    const p = new URLSearchParams(parametros);
    for (const [chave, valor] of Object.entries(mudancas)) {
      const vazio = Array.isArray(valor) ? valor.length === 0 : !valor;
      if (vazio) p.delete(chave);
      else p.set(chave, Array.isArray(valor) ? valor.join(',') : 'sim');
    }
    setParametros(p, { replace: true });
  };
  const alternar = (chave: string, atual: string[], v: string) =>
    escrever({ [chave]: atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v] });

  /* Os filtros só oferecem o que existe: banca sem exercício nenhum na lista é
     um botão que só sabe devolver "nada encontrado". */
  const { bancas, modulosExistentes, quantosBasicos, pendentes } = useMemo(() => {
    const porBanca = new Map<string, number>();
    const porModulo = new Map<string, number>();
    for (const e of exerciciosVisiveis) {
      if (!ehBasico(e)) porBanca.set(e.fonte, (porBanca.get(e.fonte) ?? 0) + 1);
      for (const m of e.modulos) porModulo.set(m, (porModulo.get(m) ?? 0) + 1);
    }
    return {
      bancas: [...porBanca.entries()]
        .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
        .map(([f, n]): Opcao => ({ valor: f, rotulo: f, n })),
      modulosExistentes: [...porModulo.entries()]
        .sort((a, b) => tituloDe(a[0]).localeCompare(tituloDe(b[0]), 'pt-BR'))
        .map(([id, n]): Opcao => ({ valor: id, rotulo: tituloDe(id), n, slot: slotDe(id) })),
      quantosBasicos: exerciciosVisiveis.filter(ehBasico).length,
      pendentes: exerciciosVisiveis.filter((e) => !e.verificado).length,
    };
  }, []);

  /* O ano é do vestibular escolhido, e não do acervo inteiro: 2019 da FUVEST e
     2019 da UNICAMP são provas diferentes, e oferecer um ano que a banca marcada
     não tem é oferecer o vazio. */
  const anosDisponiveis = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of exerciciosVisiveis) {
      if (ehBasico(e) || !e.ano) continue;
      if (bancasEscolhidas.length && !bancasEscolhidas.includes(e.fonte)) continue;
      const a = String(e.ano);
      m.set(a, (m.get(a) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [bancasEscolhidas.join()]);

  /* Trocar a banca poda o ano junto: sem isso um ?ano=2018 sobrava na URL
     filtrando escondido, porque a fileira de anos some quando não tem banca. */
  const trocarFontes = (novas: string[]) => {
    const bancasNovas = novas.filter((f) => f !== AUTORAL);
    if (!bancasNovas.length) return escrever({ fonte: novas, ano: [] });
    const existem = new Set(
      exerciciosVisiveis
        .filter((e) => !ehBasico(e) && e.ano && bancasNovas.includes(e.fonte))
        .map((e) => String(e.ano)),
    );
    escrever({ fonte: novas, ano: anos.filter((a) => existem.has(a)) });
  };

  const achados = useMemo(() => {
    const filtrados = exerciciosVisiveis.filter((e) => {
      if (niveis.length && !niveis.includes(e.nivel)) return false;
      if (fontes.length && !fontes.includes(ehBasico(e) ? AUTORAL : e.fonte)) return false;
      if (anos.length && !(e.ano && anos.includes(String(e.ano)))) return false;
      if (soPendentes && e.verificado) return false;
      if (modulos.length && !e.modulos.some((m) => modulos.includes(m))) return false;
      return true;
    });

    const ordem = { facil: 0, medio: 1, desafio: 2 };
    const juntos = (e: Exercicio) => e.modulos.filter((m) => modulos.includes(m)).length;
    return filtrados.sort(
      (a, b) => juntos(b) - juntos(a) || ordem[a.nivel] - ordem[b.nivel] || a.id.localeCompare(b.id),
    );
  }, [niveis.join(), fontes.join(), anos.join(), modulos.join(), soPendentes]);

  const filtrando =
    niveis.length > 0 || fontes.length > 0 || anos.length > 0 || modulos.length > 0 || soPendentes;

  return (
    <div className="folha folha-larga">
      <p className="aula-etiqueta">exercícios</p>
      <h1>Praticar</h1>
      <p className="nota-secao">
        Os básicos são os do fim de cada aula: cobram aquela aula e mais nada, e servem pra você
        ver se entendeu. O resto é vestibular, e ali dá pra escolher a prova e o ano. Somando mais
        de uma aula, os exercícios que cobram as duas juntas aparecem primeiro.
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

        <div className="filtro-grupo filtro-modulos">
          <p className="filtro-rot">
            Aulas
            {modulos.length > 0 && (
              <button className="filtro-limpar" onClick={() => escrever({ modulos: [] })}>
                limpar
              </button>
            )}
          </p>
          <BuscaQueSoma
            dica="Procure a aula e vá somando"
            aria="Procurar aula pelo nome"
            opcoes={modulosExistentes}
            escolhidos={modulos}
            somar={(v) => escrever({ modulos: [...modulos, v] })}
            tirar={(v) => alternar('modulos', modulos, v)}
          />
        </div>

        <div className="filtro-grupo filtro-fontes">
          <p className="filtro-rot">
            De onde vem
            {(fontes.length > 0 || anos.length > 0) && (
              <button className="filtro-limpar" onClick={() => escrever({ fonte: [], ano: [] })}>
                limpar
              </button>
            )}
          </p>

          {quantosBasicos > 0 && (
            <div className="filtro-fichas">
              <button
                aria-pressed={comBasicos}
                onClick={() =>
                  trocarFontes(
                    comBasicos ? fontes.filter((f) => f !== AUTORAL) : [...fontes, AUTORAL],
                  )
                }
                title="os autorais do fim de cada aula"
              >
                Básicos da aula <span>{quantosBasicos}</span>
              </button>
            </div>
          )}

          <p className="filtro-sub">Vestibular</p>
          {bancas.length === 0 ? (
            <p className="filtro-nota">as provas vão aparecendo aqui conforme entrarem</p>
          ) : (
            <>
              <BuscaQueSoma
                dica="Procure o vestibular e vá somando"
                aria="Procurar vestibular pelo nome"
                opcoes={bancas}
                escolhidos={bancasEscolhidas}
                somar={(v) => trocarFontes([...fontes, v])}
                tirar={(v) => trocarFontes(fontes.filter((f) => f !== v))}
              />
              {bancasEscolhidas.length > 0 && (
                <>
                  <p className="filtro-sub">Ano da prova</p>
                  <div className="filtro-fichas">
                    {anosDisponiveis.map(([a, n]) => (
                      <button
                        key={a}
                        aria-pressed={anos.includes(a)}
                        onClick={() => alternar('ano', anos, a)}
                      >
                        {a} <span>{n}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Só aparece em npm run dev, porque em produção não existe exercício não
            verificado pra listar. É a mesa de auditoria enquanto não tem conta. */}
        {import.meta.env.DEV && pendentes > 0 && (
          <div className="filtro-grupo">
            <p className="filtro-rot">Auditoria</p>
            <div className="filtro-fichas">
              <button
                aria-pressed={soPendentes}
                onClick={() => escrever({ pendentes: !soPendentes })}
              >
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
