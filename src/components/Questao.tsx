import { Children, isValidElement, useMemo, useRef, useState, type ReactNode } from 'react';
import katex from 'katex';

/**
 * <Questao /> — múltipla escolha com correção na hora. O aluno clica numa
 * alternativa, acertou fica verde e errou fica vermelho com a correta apontada,
 * e nos dois casos o gabarito abre embaixo.
 *
 * O enunciado e o gabarito chegam como children do MDX, então o LaTeX deles já
 * vem montado pelo KaTeX da compilação. As alternativas são string de prop, que
 * não passa pelo MDX, então essas eu renderizo aqui na mão: os trechos entre
 * $...$ vão pro KaTeX e o resto é texto escapado pelo próprio React.
 *
 * O gabarito respeita o portão de revisão, igual às camadas: some no Modo Aula
 * enquanto a página for `revisado: false`.
 */

const LETRAS = ['a', 'b', 'c', 'd', 'e'] as const;
type Letra = (typeof LETRAS)[number];

const NOME_LETRA: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' };

export interface QuestaoProps {
  /** Número mostrado no cabeçalho. */
  n?: number;
  /**
   * De 2 a 5 alternativas, na ordem a→e. Trechos entre $...$ viram LaTeX;
   * o resto é texto. Ex.: ["$-3$", "$3$", "Nenhuma das anteriores"]
   */
  alternativas: string[];
  /** Letra da correta, "a".."e". Apontar pra alternativa que não existe dá erro na cara. */
  correta: string;
  /** "FUVEST 2019 — Q42" ou "Autoral". Opcional. */
  fonte?: string;
  children?: ReactNode;
}

/** Os pedaços entre $...$ viram fórmula; o resto continua texto. */
function ComMatematica({ bruto }: { bruto: string }) {
  const pedacos = useMemo(
    () =>
      String(bruto)
        .split(/(\$[^$]*\$)/g)
        .map((seg, i) =>
          seg.length > 2 && seg.startsWith('$') && seg.endsWith('$') ? (
            <span
              key={i}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(seg.slice(1, -1), {
                  throwOnError: false,
                  strict: false,
                }),
              }}
            />
          ) : (
            <span key={i}>{seg}</span>
          ),
        ),
    [bruto],
  );
  return <>{pedacos}</>;
}

export default function Questao({ n, alternativas, correta, fonte, children }: QuestaoProps) {
  const [escolhida, setEscolhida] = useState<Letra | null>(null);
  const primeiraAlt = useRef<HTMLButtonElement>(null);

  /* Separo o gabarito do enunciado pelo slot, que é como o MDX já escreve hoje:
     <div slot="gabarito">…</div>. Assim o conteúdo não precisou mudar. */
  const filhos = Children.toArray(children);
  const ehGabarito = (f: ReactNode) =>
    isValidElement<{ slot?: string }>(f) && f.props.slot === 'gabarito';
  const enunciado = filhos.filter((f) => !ehGabarito(f));
  const gabarito = filhos.filter(ehGabarito);

  /* Gabarito errado em aula é o pior defeito possível, então erro de escrita
     aparece no lugar da questão em vez de passar batido. */
  const iCorreta = LETRAS.indexOf(String(correta).trim().toLowerCase() as Letra);
  const problema =
    !Array.isArray(alternativas) || alternativas.length < 2
      ? '<Questao> precisa de ao menos 2 alternativas.'
      : alternativas.length > LETRAS.length
        ? `<Questao> aceita no máximo ${LETRAS.length} alternativas (a–e).`
        : iCorreta < 0 || iCorreta >= alternativas.length
          ? `<Questao correta="${correta}"> aponta pra uma alternativa que não existe. ` +
            `Use uma letra entre "a" e "${LETRAS[alternativas.length - 1]}".`
          : null;

  if (problema) {
    return (
      <section className="questao questao-quebrada" role="alert">
        <b>Questão com defeito:</b> {problema}
      </section>
    );
  }

  const letraCorreta = LETRAS[iCorreta];
  const respondida = escolhida !== null;
  const acertou = escolhida === letraCorreta;

  const estadoDaAlt = (letra: Letra) => {
    if (!respondida) return undefined;
    if (letra === escolhida) return acertou ? 'certo' : 'errado';
    if (letra === letraCorreta) return 'era-esta';
    return undefined;
  };

  return (
    <section
      className="questao"
      data-correta={letraCorreta}
      data-respondida={respondida ? 'sim' : undefined}
      data-resultado={respondida ? (acertou ? 'certo' : 'errado') : undefined}
    >
      <header className="questao-topo">
        <span className="questao-n">{n ? `Questão ${n}` : 'Questão'}</span>
        {fonte && <span className="questao-fonte">{fonte}</span>}
      </header>

      <div className="questao-enunciado">{enunciado}</div>

      <ol className="alternativas">
        {alternativas.map((alt, i) => (
          <li key={i}>
            <button
              ref={i === 0 ? primeiraAlt : undefined}
              type="button"
              className="alt"
              data-letra={LETRAS[i]}
              data-estado={estadoDaAlt(LETRAS[i])}
              /* Não uso disabled porque o botão sairia da ordem de tabulação e o
                 aluno de teclado perderia a leitura das outras alternativas. */
              data-travado={respondida ? 'sim' : undefined}
              aria-pressed={escolhida === LETRAS[i]}
              onClick={() => !respondida && setEscolhida(LETRAS[i])}
            >
              <span className="alt-letra" aria-hidden="true">
                {LETRAS[i]}
              </span>
              <span className="alt-texto">
                <ComMatematica bruto={alt} />
              </span>
              <span className="alt-marca" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>

      <p className="questao-veredito" role="status" aria-live="polite">
        {respondida &&
          (acertou
            ? '✓ Isso aí. A resolução está aqui embaixo.'
            : `✗ Não é essa — a resposta é ${NOME_LETRA[letraCorreta]}. Acompanha a resolução.`)}
      </p>

      <div className="questao-gabarito" hidden={!respondida}>
        <div className="gabarito-topo">
          <span className="gabarito-rotulo">Resolução</span>
          <button
            type="button"
            className="questao-refazer"
            onClick={() => {
              setEscolhida(null);
              primeiraAlt.current?.focus();
            }}
          >
            responder de novo
          </button>
        </div>
        {gabarito}
      </div>
    </section>
  );
}
