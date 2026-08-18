import { MDXProvider } from '@mdx-js/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { componentesMDX } from './components/mdx';
import { useAula, type ItemPilha } from './estado';
import Conceito, { PaginaConceito } from './pages/Conceito';
import Home from './pages/Home';

/**
 * O cromo da aula: topo com os modos, as rotas, e a pilha de painéis por cima.
 *
 * O painel é um componente na pilha, não mais um iframe com uma segunda rota
 * dentro. Por isso o modo, o tamanho da fonte e o estado das questões já valem
 * dentro dele sem ninguém sincronizar nada.
 */
export default function App() {
  const { modo, trocarModo, girarTamanho, pilha, fecharPainel, fecharTudo } = useAula();

  return (
    <MDXProvider components={componentesMDX}>
      <VoltarProTopo />
      <a className="pular" href="#conteudo">
        Pular pro conteúdo
      </a>

      <header className="topo">
        <Link to="/" className="marca">
          Pré-vestibular
        </Link>
        <span className="espaco" />
        <div className="barra-modo" role="group" aria-label="Modo de exibição">
          <button onClick={() => trocarModo('estudo')} aria-pressed={modo === 'estudo'}>
            Estudo
          </button>
          <button onClick={() => trocarModo('aula')} aria-pressed={modo === 'aula'}>
            Aula
          </button>
        </div>
        <button className="painel-botao" onClick={girarTamanho} title="Tamanho da fonte (Alt+Z)">
          A↕
        </button>
      </header>

      <main id="conteudo">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conceitos/:id" element={<PaginaConceito />} />
          <Route path="*" element={<NaoAchei />} />
        </Routes>
      </main>

      <div className="pilha-fundo" data-aberto={pilha.length ? 'sim' : 'nao'} onClick={fecharTudo} />

      {pilha.map((p, i) => (
        <Painel
          key={`${p.id}-${i}`}
          p={p}
          i={i}
          trilha={pilha.slice(0, i + 1)}
          fecharPainel={fecharPainel}
          fecharTudo={fecharTudo}
        />
      ))}
    </MDXProvider>
  );
}

/** O router não zera o scroll sozinho, então clicar num módulo do mapa do rodapé
 *  abria a página seguinte já no meio dela. */
function VoltarProTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

/**
 * Um painel da pilha. Ele toma o foco ao abrir e devolve pra quem chamou ao
 * fechar: sem isso o Esc e o leitor de tela continuavam na página de trás,
 * enquanto o que está na tela é o painel.
 */
function Painel({
  p,
  i,
  trilha,
  fecharPainel,
  fecharTudo,
}: {
  p: ItemPilha;
  i: number;
  trilha: ItemPilha[];
  fecharPainel: () => void;
  fecharTudo: () => void;
}): ReactNode {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const quemChamou = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => quemChamou?.focus?.();
  }, []);

  return (
    <aside
      ref={ref}
      className="painel"
      role="dialog"
      aria-modal="true"
      aria-label={p.titulo}
      tabIndex={-1}
      style={{ zIndex: 51 + i, right: Math.min(i, 4) * 14 }}
    >
      <div className="painel-topo">
        <span className="painel-trilha">
          Você está em:{' '}
          {trilha.map((q, k) => (
            <span key={k}>
              {k > 0 && ' › '}
              {k === trilha.length - 1 ? <b>{q.titulo}</b> : q.titulo}
            </span>
          ))}
        </span>
        <Link className="painel-botao" to={`/conceitos/${p.id}`} onClick={fecharTudo}>
          Abrir inteiro
        </Link>
        <button className="painel-botao" onClick={fecharPainel}>
          Fechar ✕
        </button>
      </div>
      <div className="painel-corpo">
        <Conceito id={p.id} dentroDePainel />
      </div>
    </aside>
  );
}

function NaoAchei() {
  return (
    <div className="folha">
      <article className="papel">
        <h1>Essa página não existe</h1>
        <p>
          <Link to="/">Voltar pro mapa</Link>
        </p>
      </article>
    </div>
  );
}
