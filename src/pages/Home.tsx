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

    /* Os elementos que mudam por quadro, achados uma vez só. Escrever direto no
       style deles é o que evita a revalidação de estilo da subárvore inteira:
       uma variável CSS num ancestral invalidaria os 84 módulos do mapa, duas
       vezes, a cada quadro de rolagem. */
    const cams = [...cena.querySelectorAll<HTMLElement>('.abertura-cam')];
    const pans = [...cena.querySelectorAll<HTMLElement>('.abertura-pan')];
    const texto = cena.querySelector<HTMLElement>('.abertura-texto');
    const bruma = cena.querySelector<HTMLElement>('.abertura-bruma');
    const parede = cena.querySelector<HTMLElement>('.abertura-parede');
    const desfocado = cena.querySelector<HTMLElement>('.abertura-mapa-b');
    const chamado = cena.querySelector<HTMLElement>('.abertura-chamado');
    const legenda = cena.querySelector<HTMLElement>('.abertura-legenda');
    const clique = cena.querySelector<HTMLElement>('.abertura-clique');
    const animados = [...cams, ...pans, texto, bruma, parede, desfocado, chamado, legenda, clique];

    let escIni = 0.46;
    let escFim = 0.7;
    let xIni = 300;
    let yIni = 40;
    let yFim = 58;
    let zoomPx = 1;
    let panPx = 0;

    /* Os números que o CSS não tem como descobrir: a escala em que o mapa cabe
       na largura e quanto ele ainda precisa descer depois disso. Em 1440px dá
       0,69 e 527px; em 1920px, 0,92 e 820px. */
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
      /* A câmera para abaixo do cabeçalho, mais um respiro: encostada nele, a
         primeira fileira de módulos e o rótulo da área ficam grudados na barra. */
      const cabecalho = document.querySelector<HTMLElement>('.topo')?.offsetHeight ?? 58;

      escFim = larguraPalco / largura;
      escIni = escFim * 0.66;
      xIni = Math.round(larguraPalco * 0.21);
      yIni = Math.round(window.innerHeight * 0.05);
      yFim = cabecalho + Math.round(window.innerHeight * 0.07);
      zoomPx = Math.max(1, Math.round(window.innerHeight * 0.8));
      panPx = Math.max(0, Math.round(altura * escFim + yFim - alturaPalco));

      /* o CSS usa estes pra pintar o primeiro quadro e pra montar o layout
         achatado; do movimento em diante quem manda é o style inline */
      const e = eu.style;
      e.setProperty('--esc-fim', String(escFim));
      e.setProperty('--esc-ini', String(escIni));
      e.setProperty('--x-ini', `${xIni}px`);
      e.setProperty('--y-ini', `${yIni}px`);
      e.setProperty('--pan', `${panPx}px`);
      e.setProperty('--alt-mapa', String(Math.round(altura * escFim)));
    };

    const entre = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    let pendente = 0;

    /* Modo leve: eu não tenho como testar aqui em cima de GPU de verdade, e a
       conta muda com a densidade da tela — numa tela de densidade 2 cada camada
       do tamanho da janela custa quatro vezes mais pixels. Então o site mede o
       próprio zoom: se os quadros estiverem passando de 34ms (menos de 30 por
       segundo) no primeiro trecho de movimento, ele desliga a cópia desfocada e
       congela o papel de parede pelo resto da sessão. Prefiro animação mais
       simples do que animação picotada. */
    const quadros: number[] = [];
    let leve = false;
    let decidido = false;
    const medirQuadro = (agora: number) => {
      if (leve || decidido) return;
      quadros.push(agora);
      /* seis amostras, e não vinte: numa máquina entregando nove quadros por
         segundo o zoom inteiro tem catorze, e exigir mais é esperar a cinemática
         passar picotada antes de decidir que ela está picotando */
      if (quadros.length < 6) return;
      const gaps = quadros.slice(1).map((t, i) => t - quadros[i]).sort((a, b) => a - b);
      decidido = true;
      if (gaps[Math.floor(gaps.length / 2)] > 34) {
        leve = true;
        eu.dataset.leve = 'sim';
      }
    };

    const pintar = (agora = performance.now()) => {
      pendente = 0;

      if (semCinema.matches) {
        /* style inline vence folha de estilo, então no layout achatado eu limpo
           o que escrevi e devolvo o comando pro CSS */
        for (const el of animados) el?.removeAttribute('style');
        delete eu.dataset.fase;
        return;
      }

      const y = window.scrollY - eu.offsetTop;
      const p = entre(y / zoomPx);
      const q = entre((y - zoomPx) / Math.max(1, panPx));
      /* começa a medir depois de 8% do zoom: os primeiros quadros de qualquer
         máquina são lentos por causa da primeira pintura, e medir ali daria
         falso positivo em computador bom */
      if (p > 0.08 && p < 0.98) medirQuadro(agora);

      const escala = escIni + (escFim - escIni) * p;
      const tx = Math.round(xIni * (1 - p));
      const ty = Math.round(yIni + (yFim - yIni) * p);
      for (const c of cams) c.style.transform = `translate(${tx}px, ${ty}px) scale(${escala})`;
      for (const pn of pans) pn.style.transform = `translateY(${-Math.round(panPx * q)}px)`;

      if (texto) {
        texto.style.opacity = String(entre(1 - p * 1.45));
        texto.style.transform = `translateY(${Math.round(p * -72)}px)`;
      }
      /* a bruma segura até quase o fim do zoom: é ela que impede um módulo
         nítido de cruzar uma linha de texto que ainda dá pra ler */
      if (bruma) bruma.style.opacity = String(entre((0.88 - p) * 1.8));
      if (parede) parede.style.opacity = String(1 - 0.72 * p);
      if (desfocado) desfocado.style.opacity = String(Math.min(0.55, entre((0.85 - p) * 1.1)));
      if (chamado) chamado.style.opacity = String(entre(1 - p * 3));
      if (legenda) legenda.style.opacity = String(entre((p - 0.55) * 2.6) * (1 - q * 0.9));
      if (clique) clique.style.opacity = String(entre(1 - p));

      /* Três fases: na abertura o clique no grafo vale como rolagem; passada a
         metade ele sai da frente, senão roubaria o clique dos módulos, que a
         partir dali são links; e no fim o texto e as camadas de véu saem da
         composição, o que deixa a descida com uma camada só se movendo. */
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

        <div className="abertura-bruma" />

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
