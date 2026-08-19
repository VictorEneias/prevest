import { MDXProvider } from '@mdx-js/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { componentesMDX } from './components/mdx';
import { useAula, type ItemPilha } from './estado';
import Conceito, { PaginaConceito } from './pages/Conceito';
import Home from './pages/Home';
import Indice from './pages/Indice';

/**
 * O cromo do site: cabeçalho, rotas, rodapé e a pilha de painéis por cima.
 *
 * O painel é um componente na pilha, não mais um iframe com uma segunda rota
 * dentro. Por isso o modo, o tamanho da fonte e o tema já valem dentro dele sem
 * ninguém sincronizar nada.
 */
export default function App() {
  const { pilha, fecharPainel, fecharTudo } = useAula();

  return (
    <MDXProvider components={componentesMDX}>
      <VoltarProTopo />
      <a className="pular" href="#conteudo">
        Pular pro conteúdo
      </a>

      <Topo />

      <main id="conteudo">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/indice" element={<Indice />} />
          <Route path="/conceitos/:id" element={<PaginaConceito />} />
          <Route path="*" element={<NaoAchei />} />
        </Routes>
      </main>

      <Rodape />

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

/* ---------- cabeçalho ---------- */

const icoBusca = (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <circle cx="9" cy="9" r="5.5" />
    <path d="M13.2 13.2 17 17" />
  </svg>
);

const icoConta = (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <circle cx="10" cy="7" r="3.2" />
    <path d="M4 16.5c1.2-2.6 3.4-3.9 6-3.9s4.8 1.3 6 3.9" />
  </svg>
);

function Topo() {
  const navegar = useNavigate();
  const [busca, setBusca] = useState('');

  return (
    <header className="topo">
      <Link to="/" className="marca">
        Prevest
      </Link>
      <nav className="topo-nav" aria-label="Seções">
        <NavLink to="/" end>
          Mapa
        </NavLink>
        <NavLink to="/indice">Índice</NavLink>
      </nav>

      <form
        className="topo-busca"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          navegar(busca.trim() ? `/indice?q=${encodeURIComponent(busca.trim())}` : '/indice');
        }}
      >
        {icoBusca}
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Procurar um assunto"
          aria-label="Procurar um assunto"
        />
      </form>

      <span className="espaco" />
      <MenuDaConta />
    </header>
  );
}

/**
 * O menu do botão de conta. Hoje ele só guarda as três configurações de
 * exibição; conta de verdade precisa de backend, que este projeto não tem.
 * Os atalhos (Alt+1, Alt+2, Alt+Z) continuam sendo o caminho rápido — o menu
 * existe pra quem nunca vai descobrir que eles existem.
 */
function MenuDaConta() {
  const { modo, trocarModo, tamanho, trocarTamanho, tema, trocarTema } = useAula();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const foraOuEsc = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e.type === 'pointerdown' && ref.current?.contains(e.target as Node)) return;
      setAberto(false);
    };
    document.addEventListener('pointerdown', foraOuEsc);
    document.addEventListener('keydown', foraOuEsc);
    return () => {
      document.removeEventListener('pointerdown', foraOuEsc);
      document.removeEventListener('keydown', foraOuEsc);
    };
  }, [aberto]);

  return (
    <div className="conta" ref={ref}>
      <button
        className="conta-botao"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-label="Como a página aparece"
      >
        {icoConta}
      </button>

      {aberto && (
        <div className="conta-menu" role="menu">
          <p className="conta-secao">Como a página aparece</p>

          <div className="conta-linha">
            <span>
              Modo<span className="conta-atalho">Alt+1 / Alt+2</span>
            </span>
            <div className="seg" role="group" aria-label="Modo de exibição">
              <button onClick={() => trocarModo('estudo')} aria-pressed={modo === 'estudo'}>
                Estudo
              </button>
              <button onClick={() => trocarModo('aula')} aria-pressed={modo === 'aula'}>
                Aula
              </button>
            </div>
          </div>

          <div className="conta-linha">
            <span>
              Letra<span className="conta-atalho">Alt+Z</span>
            </span>
            <div className="seg" role="group" aria-label="Tamanho da letra">
              {(['normal', 'grande', 'enorme'] as const).map((t, i) => (
                <button
                  key={t}
                  onClick={() => trocarTamanho(t)}
                  aria-pressed={tamanho === t}
                  aria-label={t}
                  style={{ fontSize: `${0.6 + i * 0.12}rem` }}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div className="conta-linha">
            <span>Tema</span>
            <div className="seg" role="group" aria-label="Tema">
              <button onClick={() => trocarTema('claro')} aria-pressed={tema === 'claro'}>
                Claro
              </button>
              <button onClick={() => trocarTema('escuro')} aria-pressed={tema === 'escuro'}>
                Escuro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- rodapé ---------- */

function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-grade">
        <div className="rodape-col">
          <p className="rodape-marca">Prevest</p>
          <p className="rodape-frase">
            Aula particular de matemática, uma aula por conceito, na ordem em que um depende do
            outro.
          </p>
        </div>
        <div className="rodape-col">
          <p className="rodape-tit">O curso</p>
          <Link to="/">Mapa das aulas</Link>
          <Link to="/indice">Índice de assuntos</Link>
        </div>
        <div className="rodape-col">
          <p className="rodape-tit">Falar comigo</p>
          <a href="mailto:victor.eneias@gmail.com">victor.eneias@gmail.com</a>
        </div>
      </div>
      <div className="rodape-fim">
        <span>© {new Date().getFullYear()} Prevest</span>
        <span>Feito para aula 1-a-1, na mesa da casa do aluno.</span>
      </div>
    </footer>
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
