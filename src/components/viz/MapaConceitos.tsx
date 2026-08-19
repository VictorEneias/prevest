import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { conceitos } from '../../conteudo';
import { calcularLayout, vizinhanca, type ConceitoBruto } from '../../lib/layout-grafo';
import type { Materia } from '../../lib/curriculo';

/** O aluno digita "distancia de ponto a reta", sem acento e em minúscula. */
const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * <MapaConceitos /> — o grafo de conceitos desenhado. Sem `foco` sai o
 * currículo inteiro, que é a home; com `foco` sai só a vizinhança daquele
 * conceito, que é o rodapé da página de conceito.
 *
 * O SVG desenha só os rótulos de área e as setas; os módulos são links de HTML
 * por cima, no mesmo sistema de coordenadas, porque texto em SVG não quebra
 * linha nem faz reticências e link de verdade dá foco, Tab e Enter de graça. O
 * pan e o zoom são um transform na camada que segura os dois.
 *
 * O pan, o zoom e o acender da cadeia mexem no DOM na mão, com classList, em vez
 * de virar estado do React: são 70 nós e um re-render a cada movimento do mouse
 * ficaria caro à toa.
 */

export interface MapaConceitosProps {
  foco?: string;
  raio?: number;
  /** Só o desenho, sem moldura, sem controle e sem arrasto: quem manda na
   *  câmera é quem chama. É o que a home usa pra pôr o grafo de fundo. */
  fundo?: boolean;
  /** Barra de busca, enquadramento e legenda. Só no mapa inteiro. */
  controles?: boolean;
  altura?: string;
}

export default function MapaConceitos({
  foco,
  raio = 1,
  controles = false,
  altura,
  fundo = false,
}: MapaConceitosProps) {
  const molduraRef = useRef<HTMLDivElement>(null);
  const telaRef = useRef<HTMLDivElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);

  const { mapa, rotulosArea, caixas, pais, filhos, buscavel } = useMemo(() => {
    const todos: ConceitoBruto[] = conceitos.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      resumo: c.resumo,
      materia: c.materia,
      bloco: c.bloco,
      prereqs: c.prereqs,
      revisado: c.revisado,
    }));

    const conjunto = foco ? vizinhanca(todos, foco, raio) : todos;
    const mapa = calcularLayout(conjunto, { foco });

    /* Adjacência pro acender, já reduzida: é exatamente o que está desenhado. */
    const pais: Record<string, string[]> = {};
    const filhos: Record<string, string[]> = {};
    for (const n of mapa.nos) {
      pais[n.id] = mapa.arestas.filter((a) => a.para === n.id).map((a) => a.de);
      filhos[n.id] = mapa.arestas.filter((a) => a.de === n.id).map((a) => a.para);
    }

    /* Um rótulo por área, acima do módulo mais alto dela. */
    const rotulosArea = mapa.areas.map((a) => {
      const meus = mapa.nos.filter((n) => n.materia === a.materia && n.bloco === a.bloco);
      const topo = Math.min(...meus.map((n) => n.y));
      const noTopo = meus.filter((n) => n.y === topo);
      const x = noTopo.reduce((s, n) => s + n.x + n.w / 2, 0) / noTopo.length;
      return { ...a, rx: x, ry: topo - 16 };
    });

    /* Caixa de cada área, pros botões de enquadrar. */
    const caixas: Record<string, { x0: number; x1: number; y0: number; y1: number }> = {};
    for (const a of mapa.areas) {
      const seus = mapa.nos.filter((n) => n.materia === a.materia && n.bloco === a.bloco);
      if (!seus.length) continue;
      caixas[`${a.materia}/${a.bloco}`] = {
        x0: Math.min(...seus.map((n) => n.x)) - 30,
        x1: Math.max(...seus.map((n) => n.x + n.w)) + 30,
        y0: Math.min(...seus.map((n) => n.y)) - 40,
        y1: Math.max(...seus.map((n) => n.y + n.h)) + 30,
      };
    }

    /* O que a busca varre. Os tópicos são o motivo de isso existir: sem eles a
       busca só acha quem tem a palavra no título, e "distância de ponto a reta"
       não é título de aula nenhuma. */
    const buscavel: Record<string, string> = {};
    for (const c of conceitos) {
      buscavel[c.id] = semAcento([c.titulo, c.resumo ?? '', ...c.topicos].join(' · '));
    }

    return { mapa, rotulosArea, caixas, pais, filhos, buscavel };
  }, [foco, raio]);

  const vazio = mapa.nos.length === 0;

  /* Acender a cadeia vale nos dois modos: no mapa de sempre e no grafo de fundo
     da home, que continua clicável depois que a rolagem termina o zoom. */
  useEffect(() => {
    const tela = telaRef.current;
    if (vazio || !tela) return;
    const alvo: HTMLElement = molduraRef.current ?? tela;

    const nos = [...tela.querySelectorAll<HTMLElement>('[data-no]')];
    const arestas = [...tela.querySelectorAll<SVGPathElement>('.mapa-aresta')];

    /* ---------- acender a cadeia ----------
       Sobe pelos prereqs e desce pelos dependentes, apagando o resto: o aluno vê
       tudo que sustenta aquele módulo e tudo que sai dele. É o que torna um mapa
       de 70 módulos legível. */
    function cadeia(id: string) {
      const dentro = new Set([id]);
      const anda = (atual: string, campo: Record<string, string[]>) => {
        for (const v of campo[atual] ?? []) {
          if (dentro.has(v)) continue;
          dentro.add(v);
          anda(v, campo);
        }
      };
      anda(id, pais);
      anda(id, filhos);
      return dentro;
    }

    function acender(id: string | null) {
      if (!id) {
        nos.forEach((n) => n.classList.remove('acesa', 'apagada'));
        arestas.forEach((a) => a.classList.remove('acesa', 'apagada'));
        return;
      }
      const dentro = cadeia(id);
      nos.forEach((n) => {
        const sim = dentro.has(n.dataset.no!);
        n.classList.toggle('acesa', sim);
        n.classList.toggle('apagada', !sim);
      });
      arestas.forEach((a) => {
        const sim = dentro.has(a.dataset.de!) && dentro.has(a.dataset.para!);
        a.classList.toggle('acesa', sim);
        a.classList.toggle('apagada', !sim);
      });
    }

    const entradas = nos.map((n) => {
      const liga = () => acender(n.dataset.no!);
      n.addEventListener('pointerenter', liga);
      n.addEventListener('focus', liga);
      return { n, liga };
    });
    const apagar = () => acender(null);
    const aoSairFoco = (e: FocusEvent) => {
      if (!alvo.contains(e.relatedTarget as Node)) acender(null);
    };
    alvo.addEventListener('pointerleave', apagar);
    alvo.addEventListener('focusout', aoSairFoco as EventListener);


    return () => {
      alvo.removeEventListener('pointerleave', apagar);
      alvo.removeEventListener('focusout', aoSairFoco as EventListener);
      entradas.forEach(({ n, liga }) => {
        n.removeEventListener('pointerenter', liga);
        n.removeEventListener('focus', liga);
      });
    };
  }, [mapa, pais, filhos, vazio]);

  /* Pan, zoom, busca e enquadrar são da moldura. No fundo da home quem manda na
     câmera é a rolagem da página, então nada disso chega a ser atado. */
  useEffect(() => {
    const moldura = molduraRef.current;
    const tela = telaRef.current;
    if (fundo || vazio || !moldura || !tela) return;

    const nos = [...moldura.querySelectorAll<HTMLElement>('[data-no]')];

    /* ---------- pan / zoom ---------- */
    let escala = 1;
    let tx = 0;
    let ty = 0;
    const aplicar = () => {
      tela.style.transform = `translate(${tx}px, ${ty}px) scale(${escala})`;
    };

    /* `soPelaLargura` é o enquadramento de abertura. Espremer os 70 módulos numa
       moldura de 66vh dá 0.36 de escala e o título do módulo sai com 5px, então
       o aluno abre a home e vê um borrão de caixinhas. Pela largura dá 0.73, ele
       vê o começo do curso em tamanho de leitura e o resto está a um arrasto. O
       botão "Tudo" continua dando a visão de conjunto. */
    function enquadrar(x0: number, y0: number, x1: number, y1: number, soPelaLargura = false) {
      const cx = moldura!.clientWidth;
      const cy = moldura!.clientHeight;
      const m = 20;
      const cabeNaLargura = (cx - m * 2) / Math.max(1, x1 - x0);
      const cabeNaAltura = (cy - m * 2) / Math.max(1, y1 - y0);
      escala = Math.min(soPelaLargura ? cabeNaLargura : Math.min(cabeNaLargura, cabeNaAltura), 1.4);
      tx = m - x0 * escala + Math.max(0, (cx - m * 2 - (x1 - x0) * escala) / 2);
      ty = m - y0 * escala + Math.max(0, (cy - m * 2 - (y1 - y0) * escala) / 2);
      aplicar();
    }
    const tudo = () => enquadrar(0, 0, mapa.largura, mapa.altura);
    const abertura = () => enquadrar(0, 0, mapa.largura, mapa.altura, true);
    abertura();

    let arrastando = false;
    let px = 0;
    let py = 0;
    const aoDescer = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('[data-no]')) return;
      arrastando = true;
      px = e.clientX;
      py = e.clientY;
      moldura.dataset.arrastando = 'sim';
      moldura.setPointerCapture(e.pointerId);
    };
    const aoMover = (e: PointerEvent) => {
      if (!arrastando) return;
      tx += e.clientX - px;
      ty += e.clientY - py;
      px = e.clientX;
      py = e.clientY;
      aplicar();
    };
    const soltar = () => {
      arrastando = false;
      delete moldura.dataset.arrastando;
    };
    const aoRolar = (e: WheelEvent) => {
      e.preventDefault();
      const r = moldura.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const nova = Math.min(2.5, Math.max(0.08, escala * Math.exp(-e.deltaY * 0.0016)));
      tx = mx - ((mx - tx) * nova) / escala;
      ty = my - ((my - ty) * nova) / escala;
      escala = nova;
      aplicar();
    };

    moldura.addEventListener('pointerdown', aoDescer);
    moldura.addEventListener('pointermove', aoMover);
    moldura.addEventListener('pointerup', soltar);
    moldura.addEventListener('pointercancel', soltar);
    moldura.addEventListener('wheel', aoRolar, { passive: false });

    /* ---------- busca ---------- */
    const busca = buscaRef.current;
    const aoBuscar = () => {
      const q = semAcento((busca?.value ?? '').trim());
      if (!q) {
        nos.forEach((n) => n.classList.remove('apagada', 'acesa'));
        abertura();
        return;
      }
      const casam: HTMLElement[] = [];
      nos.forEach((n) => {
        const casa = (buscavel[n.dataset.no!] ?? '').includes(q);
        n.classList.toggle('apagada', !casa);
        n.classList.toggle('acesa', casa);
        if (casa) casam.push(n);
      });
      if (casam.length) {
        const xs = casam.map((n) => parseFloat(n.style.left));
        const ys = casam.map((n) => parseFloat(n.style.top));
        enquadrar(
          Math.min(...xs) - 180,
          Math.min(...ys) - 120,
          Math.max(...xs) + 340,
          Math.max(...ys) + 200,
        );
      }
    };
    busca?.addEventListener('input', aoBuscar);

    /* ---------- enquadrar por matéria ---------- */
    const botoes = [...moldura.parentElement!.querySelectorAll<HTMLElement>('[data-enquadrar]')];
    const cliques = botoes.map((b) => {
      const clique = () => {
        const alvo = b.dataset.enquadrar!;
        const c = caixas[alvo];
        if (alvo === 'tudo' || !c) tudo();
        else enquadrar(c.x0, c.y0, c.x1, c.y1);
      };
      b.addEventListener('click', clique);
      return { b, clique };
    });

    let redim: number | undefined;
    const observador = new ResizeObserver(() => {
      clearTimeout(redim);
      redim = window.setTimeout(abertura, 120);
    });
    observador.observe(moldura);

    return () => {
      moldura.removeEventListener('pointerdown', aoDescer);
      moldura.removeEventListener('pointermove', aoMover);
      moldura.removeEventListener('pointerup', soltar);
      moldura.removeEventListener('pointercancel', soltar);
      moldura.removeEventListener('wheel', aoRolar);
      busca?.removeEventListener('input', aoBuscar);
      cliques.forEach(({ b, clique }) => b.removeEventListener('click', clique));
      clearTimeout(redim);
      observador.disconnect();
    };
  }, [fundo, mapa, caixas, buscavel, vazio]);

  const desenho = (
  <div
    ref={telaRef}
    className="mapa-tela"
    style={{ width: mapa.largura, height: mapa.altura }}
  >
    <svg
      className="mapa-svg"
      width={mapa.largura}
      height={mapa.altura}
      viewBox={`0 0 ${mapa.largura} ${mapa.altura}`}
      aria-hidden="true"
    >
      <defs>
        <marker
          id="mapa-ponta"
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto"
        >
          <path d="M0,0 L7,3.5 L0,7 z" fill="var(--grafite)" />
        </marker>
      </defs>

      {mapa.arestas.map((a, i) => (
        <path
          key={i}
          className="mapa-aresta"
          data-de={a.de}
          data-para={a.para}
          d={a.d}
          markerEnd="url(#mapa-ponta)"
        />
      ))}

      {/* O rótulo é tinta e o traço embaixo é que carrega a cor da área:
          escrito na cor do bloco ele ficava em 1,9:1 sobre o papel no
          verde e no laranja, ilegível de longe. */}
      {rotulosArea.map((a) => {
        const meio = (a.rotulo.length * 7.2) / 2;
        return (
          <g key={`${a.materia}-${a.bloco}`} data-slot={a.slotCor}>
            <text className="mapa-area-rotulo" x={a.rx} y={a.ry} textAnchor="middle">
              {a.rotulo}
            </text>
            <line
              className="mapa-area-traco"
              x1={a.rx - meio}
              y1={a.ry + 6}
              x2={a.rx + meio}
              y2={a.ry + 6}
            />
          </g>
        );
      })}
    </svg>

    {mapa.nos.map((n) => (
      <Link
        key={n.id}
        className="mapa-no"
        data-no={n.id}
        data-slot={n.slotCor}
        data-revisado={n.revisado ? 'sim' : 'nao'}
        data-focado={n.focado ? 'sim' : undefined}
        to={`/conceitos/${n.id}`}
        style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
        aria-label={`${n.titulo}${n.revisado ? '' : ' (rascunho)'}`}
      >
        <span className="mapa-no-titulo">{n.titulo}</span>
      </Link>
    ))}
  </div>
  );

  /* No fundo da home o desenho sai sozinho, no tamanho natural: quem enquadra é
     a folha de rolagem que está por fora. */
  if (fundo) return vazio ? null : desenho;

  return (
    <div
      className="mapa"
      style={altura ? ({ '--mapa-altura': altura } as React.CSSProperties) : undefined}
    >
      {controles && !vazio && (
        <div className="mapa-controles">
          <input
            ref={buscaRef}
            type="search"
            className="mapa-busca"
            placeholder="Buscar módulo…"
            aria-label="Buscar módulo no mapa"
          />
          {/* Os botões de área são a legenda também: a bolinha diz a cor e o
              clique enquadra. Com 84 aulas, ver uma área de cada vez é o que
              torna o mapa navegável. */}
          <div className="mapa-botoes" role="group" aria-label="Enquadrar uma área">
            <button type="button" data-enquadrar="tudo">
              Tudo
            </button>
            {mapa.areas.map((a) => (
              <button
                key={`${a.materia}-${a.bloco}`}
                type="button"
                data-enquadrar={`${a.materia}/${a.bloco}`}
                data-slot={a.slotCor}
              >
                <span className="mapa-legenda-cor" aria-hidden="true" />
                {a.rotulo}
              </button>
            ))}
          </div>
        </div>
      )}

      {vazio ? (
        <p className="mapa-vazio">Nenhum módulo pra desenhar ainda.</p>
      ) : (
        <>
          <div
            ref={molduraRef}
            className="mapa-moldura"
            tabIndex={0}
            role="group"
            aria-label="Mapa de módulos — arraste pra mover, role pra aproximar"
          >
            {desenho}
          </div>

          {controles && (
            <ul className="mapa-legenda">
              <li className="mapa-legenda-rascunho">
                <span className="mapa-legenda-cor" aria-hidden="true" />
                contorno tracejado é aula em rascunho
              </li>
            </ul>
          )}
        </>
      )}
    </div>
  );
}
