import { MDXProvider } from '@mdx-js/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { componentesMDX } from './components/mdx';
import { useAula, type ItemPilha } from './estado';
import Conceito, { PaginaConceito } from './pages/Conceito';
import EmBreve from './pages/EmBreve';
import Home from './pages/Home';
import Indice from './pages/Indice';
import Sobre from './pages/Sobre';

/**
 * O cromo do site: cabeçalho, rotas, rodapé e a pilha de painéis por cima.
 *
 * O painel é um componente na pilha, não um iframe com uma segunda rota dentro.
 * Por isso o modo, o tamanho da letra e o tema já valem dentro dele sem ninguém
 * sincronizar nada.
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
          <Route path="/sobre" element={<Sobre />} />
          <Route
            path="/exercicios"
            element={
              <EmBreve titulo="Exercícios">
                Os exercícios saíram do site em agosto, junto com as camadas, enquanto o currículo
                era refeito. Quando voltarem, cada um vem com a escada de dicas, a resolução e o
                raciocínio antes da conta.
              </EmBreve>
            }
          />
          <Route
            path="/entrar"
            element={
              <EmBreve titulo="Entrar">
                Ainda não existe conta neste site. Por enquanto o que você ajusta (modo, tamanho da
                letra e tema) fica guardado no seu próprio navegador.
              </EmBreve>
            }
          />
          <Route
            path="/criar-conta"
            element={
              <EmBreve titulo="Criar conta">
                Ainda não existe conta neste site. Por enquanto o que você ajusta fica guardado no
                seu próprio navegador.
              </EmBreve>
            }
          />
          <Route
            path="/perfil"
            element={<EmBreve titulo="Meu perfil">Ainda não existe conta neste site.</EmBreve>}
          />
          <Route
            path="/termos"
            element={<EmBreve titulo="Termos de uso">Ainda não escrevi esta página.</EmBreve>}
          />
          <Route
            path="/privacidade"
            element={
              <EmBreve titulo="Privacidade">
                O site não coleta nada. Não tem conta, não tem servidor e não tem rastreador: o que
                você ajusta fica no seu navegador e não sai dele.
              </EmBreve>
            }
          />
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

/* ---------- ícones ----------
   Traçados na mão numa grade de 20px, na espessura do texto de interface. */

const icoBusca = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="9" r="5.5" />
    <path d="M13.2 13.2 17 17" />
  </svg>
);

const icoConta = (
  <svg
    width="17"
    height="17"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="10" cy="7" r="3.2" />
    <path d="M4 16.5c1.2-2.6 3.4-3.9 6-3.9s4.8 1.3 6 3.9" />
  </svg>
);

/* ---------- cabeçalho ---------- */

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
        <NavLink to="/exercicios">Exercícios</NavLink>
        <NavLink to="/indice">Índice</NavLink>
      </nav>

      {/* O campo daqui não procura: ele leva o texto pro índice, que é onde a
          busca de verdade mora. Duas implementações de busca no mesmo site é o
          jeito mais rápido de uma delas ficar pra trás. */}
      <form
        className="topo-busca"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = busca.trim();
          navegar(q ? `/indice?q=${encodeURIComponent(q)}` : '/indice');
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

      <span className="topo-espaco" />
      <MenuDaConta />
    </header>
  );
}

/**
 * O menu do botão de conta. Entrar e criar conta estão aqui como porta que ainda
 * não abre: conta de verdade é backend, banco e autenticação, e este projeto não
 * tem nada disso. O que funciona são as três configurações de exibição.
 *
 * Os atalhos (Alt+1, Alt+2, Alt+Z) continuam sendo o caminho rápido; o menu
 * existe pra quem nunca vai descobrir que eles existem, e é por isso que cada
 * atalho está escrito ao lado do controle.
 */
function MenuDaConta() {
  const { modo, trocarModo, tamanho, trocarTamanho, tema, trocarTema } = useAula();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e.type === 'pointerdown' && ref.current?.contains(e.target as Node)) return;
      setAberto(false);
    };
    document.addEventListener('pointerdown', fechar);
    document.addEventListener('keydown', fechar);
    return () => {
      document.removeEventListener('pointerdown', fechar);
      document.removeEventListener('keydown', fechar);
    };
  }, [aberto]);

  return (
    <div className="conta" ref={ref}>
      <button
        className="conta-botao"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-label="Conta e configurações"
      >
        {icoConta}
      </button>

      {aberto && (
        <div className="conta-menu" role="menu">
          <Link className="conta-item" to="/entrar" onClick={() => setAberto(false)}>
            Entrar
          </Link>
          <Link className="conta-item" to="/criar-conta" onClick={() => setAberto(false)}>
            Criar conta
          </Link>

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
                  aria-label={`Letra ${t}`}
                  style={{ fontSize: `${0.6 + i * 0.13}rem` }}
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
            Uma apostila de matemática pra estudar sozinho: um conceito por página, explicado com
            calma, na ordem em que um depende do outro.
          </p>
        </div>
        <div className="rodape-col">
          <p className="rodape-tit">O curso</p>
          <Link to="/">Mapa das aulas</Link>
          <Link to="/indice">Índice de assuntos</Link>
          <Link to="/exercicios">Exercícios</Link>
          <Link to="/sobre">Sobre o projeto</Link>
        </div>
        <div className="rodape-col">
          <p className="rodape-tit">Falar comigo</p>
          <a href="mailto:victor.eneias@gmail.com">victor.eneias@gmail.com</a>
          <a href="mailto:victor.eneias@gmail.com?subject=Aula%20de%20matem%C3%A1tica">
            Marcar uma aula
          </a>
        </div>
        <div className="rodape-col">
          <p className="rodape-tit">Miudezas</p>
          <Link to="/termos">Termos de uso</Link>
          <Link to="/privacidade">Privacidade</Link>
        </div>
      </div>
      <div className="rodape-fim">
        <span>© {new Date().getFullYear()} Prevest</span>
        <span>Pra ler no seu tempo, quantas vezes precisar.</span>
      </div>
    </footer>
  );
}

/** O router não zera o scroll sozinho, então clicar num módulo do mapa abria a
 *  página seguinte já no meio dela. */
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
    <div className="simples">
      <h1>Essa página não existe</h1>
      <p>Talvez o endereço tenha mudado, ou o link esteja quebrado.</p>
      <Link className="simples-volta" to="/">
        <span aria-hidden="true">←</span> Voltar pro mapa
      </Link>
    </div>
  );
}
