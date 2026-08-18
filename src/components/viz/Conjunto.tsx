/**
 * <Conjunto /> — o diagrama de conjunto, congelado.
 *
 * É a figura estática da família do <Setas /> e do <Reta />: sem controle, pros
 * exemplos em que o conjunto é fixo e o aluno só precisa ver quem está dentro de
 * quem. Ela existe porque a sintaxe (∈, ⊂, ∪, ∩) é o tipo de coisa que só entra
 * quando o símbolo e o desenho aparecem juntos, e porque o mesmo par de conjuntos
 * desenhado de dois jeitos é o que mostra que "C ⊂ A" e "A ⊃ C" dizem a mesma
 * coisa.
 *
 * Onde cada elemento cai sai da regra do layout, e não de coordenada escrita à
 * mão: no venn, quem está nos dois vai pro miolo sozinho. Assim eu mudo a lista
 * de elementos no .mdx sem ter que recalcular desenho nenhum.
 */

type Elemento = number | string;

export interface ConjuntoProps {
  /** um: só um conjunto. separados: lado a lado. venn: cruzados. aninhados: um dentro do outro. */
  layout?: 'um' | 'separados' | 'venn' | 'aninhados';
  /** Em aninhados, o primeiro é o de fora. */
  conjuntos: { nome: string; elementos: Elemento[] }[];
  /** Elementos em destaque, com a bolinha cheia. */
  destacar?: Elemento[];
  /** Elementos desenhados do lado de fora, pra o "não pertence" ter o que apontar. */
  fora?: Elemento[];
  /** Pinta a região da conta. */
  regiao?: 'intersecao' | 'uniao';
  /** Desenha um contorno em volta de tudo, com este nome. */
  envolver?: string;
  /** Metade da largura, dentro de um <Par>. Quem passa é o <Par>, não o .mdx. */
  compacto?: boolean;
  titulo?: string;
  legenda?: string;
}

/* Duas geometrias, e não uma escalada da outra: na metade da largura o desenho
   precisa de círculo proporcionalmente maior, senão as bolinhas não cabem e o
   texto de 14px vira 7px na tela. */
const GEO = {
  larga: {
    L: 720,
    um: { cx: 360, cy: 128, r: 108, altura: 252 },
    sep2: [
      { cx: 205, cy: 132, r: 100 },
      { cx: 515, cy: 132, r: 100 },
    ],
    sep3: [
      { cx: 132, cy: 128, r: 92 },
      { cx: 360, cy: 128, r: 92 },
      { cx: 588, cy: 128, r: 92 },
    ],
    sepAltura: 258,
    venn: { r: 120, cx1: 292, cx2: 428, cy: 148, rot: 74, desvio: 46, miolo: 62, altura: 300 },
    ani: { fx: 360, fy: 158, fr: 142, dx: 404, dy: 190, dr: 68, altura: 330 },
  },
  compacta: {
    L: 380,
    um: { cx: 190, cy: 142, r: 122, altura: 285 },
    sep2: [
      { cx: 102, cy: 140, r: 86 },
      { cx: 278, cy: 140, r: 86 },
    ],
    sep3: [
      { cx: 68, cy: 132, r: 58 },
      { cx: 190, cy: 132, r: 58 },
      { cx: 312, cy: 132, r: 58 },
    ],
    sepAltura: 268,
    venn: { r: 92, cx1: 144, cx2: 236, cy: 148, rot: 56, desvio: 34, miolo: 42, altura: 300 },
    ani: { fx: 190, fy: 156, fr: 124, dx: 214, dy: 186, dr: 58, altura: 300 },
  },
};

const R_ELEM = 15;

type Ponto = [number, number];

/** Espalha n bolinhas dentro da região, sem encostar uma na outra. Espiral do
 *  ângulo áureo com descarte: quem cai fora da região ou perto demais de uma já
 *  posta é pulado, e se não couber com folga eu aperto a folga em vez de vazar. */
const espalhar = (n: number, cx: number, cy: number, rMax: number, dentro: (p: Ponto) => boolean) => {
  for (const dist of [40, 34, 28, 23]) {
    const pts: Ponto[] = [];
    for (let i = 0; i < 900 && pts.length < n; i++) {
      const t = i * 2.39996;
      const rad = rMax * Math.sqrt(i / 900);
      const p: Ponto = [cx + rad * Math.cos(t), cy + rad * Math.sin(t)];
      if (!dentro(p)) continue;
      if (pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < dist)) continue;
      pts.push(p);
    }
    if (pts.length >= n) return pts;
  }
  return [];
};

const dentroDe = (cx: number, cy: number, r: number) => (p: Ponto) =>
  Math.hypot(p[0] - cx, p[1] - cy) <= r - R_ELEM - 6;

const fmt = (e: Elemento) => String(e).replace(/-/g, '−');

export default function Conjunto({
  layout = 'um',
  conjuntos,
  destacar = [],
  fora = [],
  regiao,
  envolver,
  titulo,
  legenda,
  compacto = false,
}: ConjuntoProps) {
  const g = compacto ? GEO.compacta : GEO.larga;
  const L = g.L;
  const [a, b] = conjuntos;
  const ehDestaque = (e: Elemento) => destacar.some((d) => String(d) === String(e));

  const circulos: { nome: string; cx: number; cy: number; r: number; rotX: number; rotY: number }[] =
    [];
  const postos: { e: Elemento; p: Ponto }[] = [];
  let altura = 250;

  if (layout === 'um') {
    const c = g.um;
    circulos.push({ ...c, nome: a.nome, rotX: c.cx, rotY: c.cy - c.r - 12 });
    espalhar(a.elementos.length, c.cx, c.cy, c.r, dentroDe(c.cx, c.cy, c.r)).forEach((p, i) =>
      postos.push({ e: a.elementos[i], p }),
    );
    altura = c.altura;
  }

  if (layout === 'separados') {
    /* dois cabem grandes; três só cabem se encolherem, e três é o teto */
    const cs = conjuntos.length >= 3 ? g.sep3 : g.sep2;
    conjuntos.slice(0, 3).forEach((cj, k) => {
      const c = cs[k];
      circulos.push({ ...c, nome: cj.nome, rotX: c.cx, rotY: c.cy - c.r - 12 });
      espalhar(cj.elementos.length, c.cx, c.cy, c.r, dentroDe(c.cx, c.cy, c.r)).forEach((p, i) =>
        postos.push({ e: cj.elementos[i], p }),
      );
    });
    altura = g.sepAltura;
  }

  if (layout === 'venn') {
    const v = g.venn;
    const rA = v.r;
    const rB = v.r;
    const cA = { cx: v.cx1, cy: v.cy, r: rA };
    const cB = { cx: v.cx2, cy: v.cy, r: rB };
    circulos.push({ ...cA, nome: a.nome, rotX: cA.cx - v.rot, rotY: cA.cy - rA - 12 });
    circulos.push({ ...cB, nome: b.nome, rotX: cB.cx + v.rot, rotY: cB.cy - rB - 12 });

    const noA = (e: Elemento) => a.elementos.some((x) => String(x) === String(e));
    const noB = (e: Elemento) => b.elementos.some((x) => String(x) === String(e));
    const todos = [...a.elementos, ...b.elementos.filter((e) => !noA(e))];

    const soA = todos.filter((e) => noA(e) && !noB(e));
    const soB = todos.filter((e) => !noA(e) && noB(e));
    const nos2 = todos.filter((e) => noA(e) && noB(e));

    const emA = dentroDe(cA.cx, cA.cy, rA);
    const emB = dentroDe(cB.cx, cB.cy, rB);
    /* a folga extra do miolo evita a bolinha encostando na borda de dentro */
    const noMiolo = (p: Ponto) =>
      Math.hypot(p[0] - cA.cx, p[1] - cA.cy) <= rA - R_ELEM - 10 &&
      Math.hypot(p[0] - cB.cx, p[1] - cB.cy) <= rB - R_ELEM - 10;

    espalhar(soA.length, cA.cx - v.desvio, cA.cy, rA - 40, (p) => emA(p) && !emB(p)).forEach(
      (p, i) => postos.push({ e: soA[i], p }),
    );
    espalhar(soB.length, cB.cx + v.desvio, cB.cy, rB - 40, (p) => emB(p) && !emA(p)).forEach(
      (p, i) => postos.push({ e: soB[i], p }),
    );
    espalhar(nos2.length, (cA.cx + cB.cx) / 2, cA.cy, v.miolo, noMiolo).forEach((p, i) =>
      postos.push({ e: nos2[i], p }),
    );
    altura = v.altura;
  }

  if (layout === 'aninhados') {
    const cFora = { cx: g.ani.fx, cy: g.ani.fy, r: g.ani.fr };
    const cDentro = { cx: g.ani.dx, cy: g.ani.dy, r: g.ani.dr };
    circulos.push({ ...cFora, nome: a.nome, rotX: cFora.cx, rotY: cFora.cy - cFora.r - 12 });
    circulos.push({
      ...cDentro,
      nome: b.nome,
      rotX: cDentro.cx + cDentro.r + 18,
      rotY: cDentro.cy - cDentro.r + 4,
    });

    const noB = (e: Elemento) => b.elementos.some((x) => String(x) === String(e));
    const anel = a.elementos.filter((e) => !noB(e));
    const emFora = dentroDe(cFora.cx, cFora.cy, cFora.r);
    const longeDoDentro = (p: Ponto) =>
      Math.hypot(p[0] - cDentro.cx, p[1] - cDentro.cy) >= cDentro.r + R_ELEM + 6;

    espalhar(anel.length, cFora.cx - 40, cFora.cy - 20, cFora.r - 20, (p) => emFora(p) && longeDoDentro(p)).forEach(
      (p, i) => postos.push({ e: anel[i], p }),
    );
    espalhar(
      b.elementos.length,
      cDentro.cx,
      cDentro.cy,
      cDentro.r,
      dentroDe(cDentro.cx, cDentro.cy, cDentro.r),
    ).forEach((p, i) => postos.push({ e: b.elementos[i], p }));
    altura = g.ani.altura;
  }

  /* os de fora ficam numa fileira no rodapé, que é onde sobra espaço em todo layout */
  const foraPostos: { e: Elemento; p: Ponto }[] = fora.map((e, i) => [
    e,
    [L / 2 + (i - (fora.length - 1) / 2) * 46, altura - 28] as Ponto,
  ]).map(([e, p]) => ({ e: e as Elemento, p: p as Ponto }));

  const caixa = (() => {
    if (!envolver || circulos.length === 0) return null;
    const x0 = Math.min(...circulos.map((c) => c.cx - c.r)) - 22;
    const x1 = Math.max(...circulos.map((c) => c.cx + c.r)) + 22;
    const y0 = Math.min(...circulos.map((c) => c.cy - c.r)) - 18;
    const y1 = Math.max(...circulos.map((c) => c.cy + c.r)) + 18;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  })();

  const aria =
    conjuntos
      .map((c) => `conjunto ${c.nome} com os elementos ${c.elementos.map(fmt).join(', ')}`)
      .join('; ') +
    (destacar.length ? `. Em destaque: ${destacar.map(fmt).join(', ')}` : '') +
    (fora.length ? `. Fora do conjunto: ${fora.map(fmt).join(', ')}` : '') +
    (regiao === 'intersecao' ? '. A região comum aos dois está pintada' : '') +
    (regiao === 'uniao' ? '. Os dois conjuntos inteiros estão pintados' : '') +
    (envolver ? `. Tudo isso está dentro do conjunto ${envolver}` : '') +
    '.';

  return (
    <figure className="cj">
      {titulo && <figcaption className="cj-titulo">{titulo}</figcaption>}
      {legenda && <div className="cj-legenda">{legenda}</div>}

      <svg className="cj-svg" viewBox={`0 0 ${L} ${altura}`} role="img" aria-label={aria}>
        <defs>
          {layout === 'venn' && circulos.length === 2 && (
            <clipPath id={`cj-clip-${circulos[0].cx}-${circulos[1].cx}`}>
              <circle cx={circulos[0].cx} cy={circulos[0].cy} r={circulos[0].r} />
            </clipPath>
          )}
        </defs>

        {caixa && (
          <g>
            <rect
              x={caixa.x}
              y={caixa.y}
              width={caixa.w}
              height={caixa.h}
              rx={Math.min(caixa.h / 2, 120)}
              className="cj-envolver"
            />
            <text x={caixa.x + 16} y={caixa.y + 22} className="cj-nome envolver">
              {envolver}
            </text>
          </g>
        )}

        {regiao === 'uniao' &&
          circulos.map((c, i) => (
            <circle key={`u${i}`} cx={c.cx} cy={c.cy} r={c.r} className="cj-pintado" />
          ))}

        {regiao === 'intersecao' && circulos.length === 2 && (
          <circle
            cx={circulos[1].cx}
            cy={circulos[1].cy}
            r={circulos[1].r}
            className="cj-pintado"
            clipPath={`url(#cj-clip-${circulos[0].cx}-${circulos[1].cx})`}
          />
        )}

        {circulos.map((c, i) => (
          <g key={`c${i}`}>
            <circle cx={c.cx} cy={c.cy} r={c.r} className="cj-borda" />
            <text x={c.rotX} y={c.rotY} className="cj-nome">
              {c.nome}
            </text>
          </g>
        ))}

        {postos.map(({ e, p }, i) => (
          <g key={`e${i}`} className={ehDestaque(e) ? 'cj-elem destaque' : 'cj-elem'}>
            <circle cx={p[0]} cy={p[1]} r={R_ELEM} />
            <text x={p[0]} y={p[1] + 5}>
              {fmt(e)}
            </text>
          </g>
        ))}

        {foraPostos.map(({ e, p }, i) => (
          <g key={`f${i}`} className="cj-elem fora">
            <circle cx={p[0]} cy={p[1]} r={R_ELEM} />
            <text x={p[0]} y={p[1] + 5}>
              {fmt(e)}
            </text>
          </g>
        ))}
      </svg>

      <style>{`
        .cj {
          margin: calc(var(--u) * 1.25) 0;
          padding: calc(var(--u) * 0.75);
          background: var(--papel);
          border: 1px solid var(--linha);
          border-radius: var(--raio);
          box-shadow: var(--sombra);
          font-family: var(--f-ui);
        }
        .cj-titulo {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--tinta-fraca);
          margin-bottom: calc(var(--u) * 0.4);
        }
        .cj-legenda {
          font-size: 0.95rem; color: var(--tinta-media);
          margin-bottom: calc(var(--u) * 0.2);
        }
        .cj-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .cj-borda { fill: none; stroke: var(--grafite); stroke-width: 2; }
        .cj-pintado { fill: var(--azul-fraco); stroke: none; }
        .cj-envolver {
          fill: none; stroke: var(--tinta); stroke-width: 2; stroke-dasharray: 8 5;
        }
        .cj-nome {
          font-family: var(--f-ui); font-size: 19px; font-weight: 700;
          fill: var(--grafite); text-anchor: middle;
        }
        .cj-nome.envolver { fill: var(--tinta); text-anchor: start; }
        .cj-elem circle { fill: var(--papel); stroke: var(--tinta-fraca); stroke-width: 1.5; }
        .cj-elem text {
          font-family: var(--f-ui); font-size: 14px; font-weight: 600;
          fill: var(--tinta); text-anchor: middle;
        }
        .cj-elem.destaque circle { fill: var(--azul); stroke: var(--azul); }
        .cj-elem.destaque text { fill: var(--papel); }
        /* quem está fora fica com o traço interrompido, que é o mesmo jeito que o
           mapa usa pra dizer "isto não está no lugar de dentro" */
        .cj-elem.fora circle {
          fill: var(--papel-fundo); stroke: var(--tinta-fraca); stroke-dasharray: 4 3;
        }
        .cj-elem.fora text { fill: var(--tinta-fraca); }
      `}</style>
    </figure>
  );
}
