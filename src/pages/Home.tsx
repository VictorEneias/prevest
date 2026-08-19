import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { conceitos } from '../conteudo';
import { ordenarAreas, rotuloBloco, slotDeCor, type Materia } from '../lib/curriculo';
import { useTitulo } from '../estado';
import MapaConceitos from '../components/viz/MapaConceitos';

/**
 * A home é uma cinemática de uma tela só: o grafo entra como fundo da página e a
 * rolagem é a câmera. Nos primeiros 80vh o texto sobe e apaga enquanto o mapa
 * cresce até caber na largura da tela; daí em diante a rolagem vira normal, o
 * mapa desce e entrega no rodapé.
 *
 * Quem anima é o CSS, amarrado na rolagem de verdade (animation-timeline). O
 * único trabalho do JS aqui é medir: a escala em que o mapa cabe e quanto ele
 * ainda precisa descer dependem do tamanho da janela, e são os dois números que
 * o CSS não tem como descobrir sozinho.
 */
export default function Home() {
  useTitulo();
  const palco = useRef<HTMLDivElement>(null);

  const comeco = conceitos.find((c) => c.prereqs.length === 0);
  const areas = ordenarAreas([...new Set(conceitos.map((c) => `${c.materia}/${c.bloco}`))]);

  /* --esc-fim é a escala em que o mapa cabe na largura e --pan é o que sobra
     pra ele descer depois. Em 1440px dá 0,69 e 527px; em 1920px, 0,92 e 820px. */
  useEffect(() => {
    const medir = () => {
      const no = palco.current;
      const tela = no?.querySelector<HTMLElement>('.mapa-tela');
      if (!no || !tela) return;
      const largura = tela.offsetWidth;
      const altura = tela.offsetHeight;
      if (!largura || !altura) return;

      const escFim = no.clientWidth / largura;
      const estilo = no.parentElement!.style;
      estilo.setProperty('--esc-fim', String(escFim));
      estilo.setProperty('--esc-ini', String(escFim * 0.66));
      estilo.setProperty('--x-ini', `${Math.round(no.clientWidth * 0.21)}px`);
      estilo.setProperty('--y-ini', `${Math.round(no.clientHeight * 0.05)}px`);
      estilo.setProperty('--pan', `${Math.max(0, Math.round(altura * escFim - no.clientHeight))}px`);
      estilo.setProperty('--alt-mapa', String(Math.round(altura * escFim)));
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  /* Clicar no grafo não teleporta: rola até o fim do zoom. Como a animação está
     amarrada na rolagem, o que se vê é a mesma cinemática, só que rápida. */
  const irProMapa = useCallback(() => {
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: window.innerHeight * 0.82, behavior: suave ? 'smooth' : 'auto' });
  }, []);

  return (
    <div className="abertura">
      <div className="abertura-palco" ref={palco}>
        <div className="abertura-parede" />
        <div className="abertura-halo" />

        {/* a cópia desfocada existe só dentro do recorte do texto; inert porque
            ela é decoração e não pode receber Tab nem clique */}
        <div className="abertura-mapa-b" aria-hidden="true" inert>
          <div className="abertura-recorte-b">
            <div className="abertura-pan">
              <div className="abertura-cam">
                <MapaConceitos fundo />
              </div>
            </div>
          </div>
        </div>

        <div className="abertura-mapa">
          <div className="abertura-recorte">
            <div className="abertura-pan">
              <div className="abertura-cam">
                <MapaConceitos fundo />
              </div>
            </div>
          </div>
        </div>

        <button className="abertura-clique" onClick={irProMapa} aria-label="Ver o mapa inteiro" />

        <section className="abertura-texto">
          <p className="abertura-et">Matemática · {conceitos.length} aulas</p>
          <h1>
            Aprender a<br />
            matemática
            <br />
            de verdade
          </h1>
          <p>
            Até aqui você se virou com todas as suas técnicas e artimanhas para se livrar de
            conceitos que de primeira pareciam difíceis de lidar. E <b>elas funcionaram</b>!! Porém…
            o nível subiu, e essas técnicas que serviram de muleta pra você esse tempo todo na
            verdade te fizeram esquecer como anda.
          </p>
          <p>Agora chegou a hora de dar esse passo pra trás, e realmente aprender a matemática.</p>
          {comeco && (
            <Link className="abertura-porta" to={`/conceitos/${comeco.id}`}>
              Começar por {comeco.titulo} <span aria-hidden="true">→</span>
            </Link>
          )}
        </section>

        <p className="abertura-chamado">
          <span aria-hidden="true">↓</span>
          <span>
            role, ou <b>clique no mapa</b>, pra ele vir pra frente
          </span>
        </p>

        <ul className="abertura-legenda">
          {areas.map((chave) => {
            const [materia, bloco] = chave.split('/') as [Materia, string];
            return (
              <li key={chave} data-slot={slotDeCor(materia, bloco)}>
                <i aria-hidden="true" />
                {rotuloBloco(bloco)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
