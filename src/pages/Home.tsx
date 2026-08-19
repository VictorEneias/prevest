import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { conceitos } from '../conteudo';
import { ordenarAreas, rotuloBloco, slotDeCor, type Materia } from '../lib/curriculo';
import { useTitulo } from '../estado';
import MapaConceitos from '../components/viz/MapaConceitos';

/**
 * A home é uma cinemática de uma tela só: o grafo entra como fundo da página e a
 * rolagem é a câmera. No primeiro tanto de rolagem o texto sobe e apaga enquanto
 * o mapa cresce até caber na largura da tela; daí em diante a rolagem vira
 * normal, o mapa desce e entrega no rodapé.
 *
 * Todo o trabalho deste componente é escrever duas variáveis CSS: --p, que é o
 * quanto do zoom já andou, e --q, que é o quanto da descida. O CSS calcula o
 * resto em cima delas.
 *
 * Isso já foi feito com animation-timeline: scroll(), que é mais bonito e é só
 * Chrome — no Firefox as animações caíam na linha do tempo normal, com duração
 * zero, e a página abria direto no estado final. Ouvinte de rolagem escrevendo
 * uma variável funciona em qualquer navegador, e como só transform e opacity
 * mudam por quadro, o navegador resolve no compositor do mesmo jeito.
 */
export default function Home() {
  useTitulo();
  const raiz = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);

  /* A porta de entrada é a raiz que destrava mais coisa, e não a primeira da
     lista: por id, "Ângulos" vem antes de "A reta numérica" e o site convidava
     o aluno a começar por um galho lateral. */
  const comeco = useMemo(() => {
    const filhos = new Map<string, string[]>();
    for (const c of conceitos) {
      for (const p of c.prereqs) filhos.set(p, [...(filhos.get(p) ?? []), c.id]);
    }
    const alcance = (id: string) => {
      const vistos = new Set([id]);
      const fila = [id];
      while (fila.length) {
        for (const f of filhos.get(fila.shift()!) ?? []) {
          if (!vistos.has(f)) {
            vistos.add(f);
            fila.push(f);
          }
        }
      }
      return vistos.size;
    };
    return conceitos
      .filter((c) => c.prereqs.length === 0)
      .sort((a, b) => alcance(b.id) - alcance(a.id))[0];
  }, []);
  const areas = ordenarAreas([...new Set(conceitos.map((c) => `${c.materia}/${c.bloco}`))]);

  useEffect(() => {
    const eu = raiz.current;
    const cena = palco.current;
    if (!eu || !cena) return;

    /* Tela estreita não tem onde pôr o texto ao lado do grafo, e quem pede menos
       movimento não quer câmera nenhuma: nos dois casos a abertura vira uma
       página comum, e é o CSS que faz isso — aqui eu só paro de escrever. */
    const semCinema = window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 900px)');

    let zoomPx = 1;
    let panPx = 0;

    /* Os dois números que o CSS não tem como descobrir: a escala em que o mapa
       cabe na largura e quanto ele ainda precisa descer depois disso. Em 1440px
       dá 0,69 e 527px; em 1920px, 0,92 e 820px. */
    const medir = () => {
      /* a cópia nítida, e não a primeira que aparecer: no layout estreito a
         desfocada some com display:none e mede zero, e aí a medição inteira
         abortava e o mapa ficava na escala de reserva */
      const tela = cena.querySelector<HTMLElement>('.abertura-mapa .mapa-tela');
      if (!tela) return;
      const largura = tela.offsetWidth;
      const altura = tela.offsetHeight;
      if (!largura || !altura) return;

      const larguraPalco = cena.clientWidth || window.innerWidth;
      const alturaPalco = semCinema.matches ? window.innerHeight : cena.clientHeight;
      const escFim = larguraPalco / largura;
      /* A câmera para abaixo do cabeçalho, mais um respiro: encostada nele, a
         primeira fileira de módulos e o rótulo da área ficam grudados na barra.
         O respiro é proporcional à tela pra não sumir em monitor grande. */
      const cabecalho = document.querySelector<HTMLElement>('.topo')?.offsetHeight ?? 58;
      const yFim = cabecalho + Math.round(window.innerHeight * 0.07);

      zoomPx = Math.max(1, Math.round(window.innerHeight * 0.8));
      panPx = Math.max(0, Math.round(altura * escFim + yFim - alturaPalco));

      const e = eu.style;
      e.setProperty('--esc-fim', String(escFim));
      e.setProperty('--esc-ini', String(escFim * 0.66));
      e.setProperty('--x-ini', `${Math.round(larguraPalco * 0.21)}px`);
      e.setProperty('--y-ini', `${Math.round(window.innerHeight * 0.05)}px`);
      e.setProperty('--y-fim', `${yFim}px`);
      e.setProperty('--pan', `${panPx}px`);
      e.setProperty('--alt-mapa', String(Math.round(altura * escFim)));
    };

    const entre = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    let pendente = 0;

    const pintar = () => {
      pendente = 0;
      if (semCinema.matches) {
        eu.style.setProperty('--p', '0');
        eu.style.setProperty('--q', '0');
        delete eu.dataset.fase;
        return;
      }
      const y = window.scrollY - eu.offsetTop;
      const p = entre(y / zoomPx);
      const q = entre((y - zoomPx) / Math.max(1, panPx));
      eu.style.setProperty('--p', p.toFixed(4));
      eu.style.setProperty('--q', q.toFixed(4));
      /* Três fases: na abertura o clique no grafo vale como rolagem; passada a
         metade ele sai da frente, senão roubaria o clique dos módulos, que a
         partir dali são links; e no fim o texto sai da tela de vez. */
      eu.dataset.fase = p < 0.5 ? 'abertura' : p < 0.999 ? 'meio' : 'mapa';
    };

    const agendar = () => {
      if (!pendente) pendente = requestAnimationFrame(pintar);
    };
    const remedir = () => {
      medir();
      agendar();
    };

    medir();
    pintar();
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', remedir);
    semCinema.addEventListener('change', remedir);

    return () => {
      if (pendente) cancelAnimationFrame(pendente);
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', remedir);
      semCinema.removeEventListener('change', remedir);
    };
  }, []);

  /* Clicar no grafo não teleporta: rola até o fim do zoom. Como a coreografia
     está amarrada na rolagem, o que se vê é a mesma cinemática, só que rápida. */
  const irProMapa = useCallback(() => {
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alvo = (raiz.current?.offsetTop ?? 0) + window.innerHeight * 0.82;
    window.scrollTo({ top: alvo, behavior: suave ? 'smooth' : 'auto' });
  }, []);

  return (
    <div className="abertura" ref={raiz}>
      <div className="abertura-palco" ref={palco}>
        <div className="abertura-halo" />

        {/* a cópia desfocada existe só dentro da bolha do texto; inert porque é
            decoração e não pode receber Tab nem clique */}
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
          <div className="abertura-pan">
            <div className="abertura-cam">
              <MapaConceitos fundo />
            </div>
          </div>
        </div>

        <div className="abertura-pluma" />
        <div className="abertura-veu" />

        <div className="abertura-parede">
          <div className="abertura-parede-i" />
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
