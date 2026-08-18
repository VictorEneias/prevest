/**
 * npm run plano
 *
 * Escreve PLANO-DE-AULAS.md a partir do frontmatter das aulas. O documento
 * existe pra eu planejar a aula longe do site, e é gerado em vez de escrito
 * porque um segundo lugar com 762 tópicos copiados à mão desatualiza no
 * primeiro prereq que eu mexer.
 *
 * O que ele acrescenta ao que já está no .mdx: a profundidade de cada aula no
 * grafo, quem depende dela, uma ordem linear possível e o índice remissivo
 * invertido, tópico por tópico.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BLOCOS, ROTULO_BLOCO } from './blocos.mjs';
import { ehEsqueleto } from './tempo-aula.mjs';

const DIR = 'content/conceitos';
const SAIDA = 'PLANO-DE-AULAS.md';
const SAIDA_HTML = 'PLANO-DE-AULAS.html';

function frontmatter(txt) {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return [{}, ''];
  const out = {};
  let lista = null;
  for (const linha of m[1].split(/\r?\n/)) {
    const item = linha.match(/^\s+-\s+(.*)$/);
    if (item && lista) {
      out[lista].push(item[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    const kv = linha.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    lista = null;
    const [, k, v] = kv;
    if (v.startsWith('[')) {
      out[k] = v.replace(/[[\]]/g, '').split(',').map((s) => s.trim()).filter(Boolean);
    } else if (v === '') {
      out[k] = [];
      lista = k;
    } else {
      out[k] = v.replace(/^["']|["']$/g, '');
    }
  }
  return [out, m[2]];
}

const aulas = {};
for (const nome of (await readdir(DIR)).filter((n) => n.endsWith('.mdx')).sort()) {
  const id = nome.replace(/\.mdx$/, '');
  const [fm, corpo] = frontmatter(await readFile(join(DIR, nome), 'utf8'));
  const esqueleto = ehEsqueleto(corpo);
  aulas[id] = {
    id,
    ...fm,
    tempo: Number(fm.tempo_estimado),
    prereqs: fm.prereqs ?? [],
    topicos: fm.topicos ?? [],
    esqueleto,
    leitura: Number(fm.tempo_leitura ?? 0),
    /* o parágrafo "Quando for, ela vai cobrir…" e a linha de falta da seção 8.3 */
    previsao: (corpo.match(/Quando for, ela vai cobrir ([\s\S]*?)\n\n/) || [, ''])[1]
      .replace(/\s+/g, ' ').trim(),
    falta: (corpo.match(/^\*Falta(?: nesta página)?:?\s*([\s\S]*?)\*\s*$/m) || [, ''])[1]
      .replace(/\s+/g, ' ').trim(),
    titulos: (corpo.match(/^##+ .+$/gm) || []).map((t) => t.replace(/^#+\s*/, '')),
  };
}

const todas = Object.values(aulas);
const t = (id) => aulas[id]?.titulo ?? id;

/* profundidade = quantas aulas você atravessa até chegar nesta. É o y do mapa. */
const prof = {};
const calcular = (id) => {
  if (prof[id] !== undefined) return prof[id];
  prof[id] = 0;
  const p = aulas[id].prereqs.filter((x) => aulas[x]);
  prof[id] = p.length ? Math.max(...p.map((x) => calcular(x) + 1)) : 0;
  return prof[id];
};
todas.forEach((a) => { a.prof = calcular(a.id); });
todas.forEach((a) => { a.filhos = todas.filter((b) => b.prereqs.includes(a.id)).map((b) => b.id); });

/**
 * Uma ordem linear possível. Topológica, e entre as aulas liberadas eu prefiro
 * ficar na mesma área da anterior: o grafo não impõe fila nenhuma, mas pular de
 * geometria pra estatística a cada aula é ruim de dar. Empate desempata por
 * profundidade, depois por quantas aulas a escolha destrava.
 */
const trilha = [];
const feitas = new Set();
let areaAtual = null;
while (trilha.length < todas.length) {
  const livres = todas.filter((a) => !feitas.has(a.id) && a.prereqs.every((p) => feitas.has(p)));
  livres.sort((x, y) =>
    x.prof - y.prof ||
    (x.bloco === areaAtual ? 0 : 1) - (y.bloco === areaAtual ? 0 : 1) ||
    y.filhos.length - x.filhos.length ||
    BLOCOS.indexOf(x.bloco) - BLOCOS.indexOf(y.bloco) ||
    x.id.localeCompare(y.id, 'pt-BR'));
  const esc = livres[0];
  feitas.add(esc.id);
  areaAtual = esc.bloco;
  trilha.push(esc);
}
trilha.forEach((a, i) => { a.n = i + 1; });

const hm = (min) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
const soma = (l) => l.reduce((s, a) => s + a.tempo, 0);
const L = [];
const p = (...s) => L.push(...s);

p('# Plano de aulas — Matemática', '');
p(`${todas.length} aulas, ${todas.reduce((s, a) => s + a.topicos.length, 0)} tópicos declarados, ` +
  `${hm(soma(todas))} de aula. Gerado por \`npm run plano\` a partir do frontmatter de ` +
  `\`content/conceitos/\`; **não edite este arquivo à mão**, edite a aula e rode o script de novo.`, '');

p('## Como ler uma ficha', '');
p('- **Nível** é a profundidade no grafo: quantas aulas você atravessa até chegar nesta. Nível 0 não depende de nada.');
p('- **Precisa de** são os pré-requisitos diretos declarados. Só o mais próximo aparece: se A já é pré-requisito de B, a aula que pede B não repete A.');
p('- **Destrava** é o inverso, calculado — quem trava se esta aula não for dada.');
p('- **Tópicos** é o que a aula cobre por dentro, e é promessa: se a aula não cobrir, ou o tópico sai ou a nota de falta diz que aquela parte não foi escrita.');
p('- **Escrita / esqueleto** diz se o `.mdx` já tem a aula ou só o contrato dela.');
p('- **Tempo** não é chute: sai de `npm run tempos`. Aula escrita é medida na própria página, ' +
  'contando prosa, fórmula, tabela, figura e interativo; esqueleto sai de uma régua por tópicos ' +
  'ajustada nas escritas. A aula roda a 65 palavras por minuto e a leitura do aluno em casa a 130, ' +
  'que são as taxas de "muitos conceitos novos" do estimador de carga do Wake Forest (Barre e ' +
  'Esarey), pros objetivos de engajar e de entender. O detalhe está em `scripts/tempo-aula.mjs`.', '');

p('## Panorama por área', '');
p('| Área | Aulas | Tópicos | Tempo |', '|---|---:|---:|---:|');
for (const b of BLOCOS) {
  const l = todas.filter((a) => a.bloco === b);
  p(`| ${ROTULO_BLOCO[b]} | ${l.length} | ${l.reduce((s, a) => s + a.topicos.length, 0)} | ${hm(soma(l))} |`);
}
p(`| **Total** | **${todas.length}** | **${todas.reduce((s, a) => s + a.topicos.length, 0)}** | **${hm(soma(todas))}** |`, '');

const base = todas.filter((a) => a.nivel === 'base');
p(`Por nível declarado: **${base.length} de base** (revisão de fundamental que trava o resto, ${hm(soma(base))}) ` +
  `e **${todas.length - base.length} de médio** (${hm(soma(todas) - soma(base))}).`, '');
const escritas = todas.filter((a) => !a.esqueleto);
p(`Por estado: **${escritas.length} escritas** (${escritas.map((a) => a.titulo).join(', ')}) e ` +
  `**${todas.length - escritas.length} esqueletos**, que já têm título, resumo, tópicos e prereqs, mas nenhum texto.`, '');

p('## Os gargalos', '');
p('As aulas que mais destravam outras. Se o aluno chega no meio do ano, é por aqui que se decide o que não dá pra pular.', '');
p('| Aula | Destrava | Quem |', '|---|---:|---|');
for (const a of [...todas].sort((x, y) => y.filhos.length - x.filhos.length).slice(0, 12)) {
  p(`| ${a.titulo} | ${a.filhos.length} | ${a.filhos.map(t).join(', ')} |`);
}
p('');
const folhas = todas.filter((a) => a.filhos.length === 0);
p(`**Fim de linha** (não destravam ninguém, então dá pra deixar por último ou cortar sem estragar o resto): ` +
  `${folhas.map((a) => a.titulo).join(', ')}.`, '');

p('## Uma ordem possível', '');
p('O grafo declara dependência, não fila. Esta é uma ordem que respeita todos os pré-requisitos e ' +
  'sobe camada por camada do mapa, ficando na mesma área enquanto dá; a ordem real é oportunista, guiada pelo que o aluno está vendo na escola.', '');
p('| # | Aula | Área | Nível | Min | Acum. |', '|---:|---|---|---:|---:|---:|');
let acc = 0;
for (const a of trilha) {
  acc += a.tempo;
  p(`| ${a.n} | ${a.titulo} | ${ROTULO_BLOCO[a.bloco]} | ${a.prof} | ${a.tempo} | ${hm(acc)} |`);
}
p('');

p('## As fichas', '');
for (const b of BLOCOS) {
  const l = todas.filter((a) => a.bloco === b).sort((x, y) => x.n - y.n);
  p(`### ${ROTULO_BLOCO[b]}`, '');
  p(`${l.length} aulas, ${hm(soma(l))}.`, '');
  for (const a of l) {
    p(`#### ${a.n}. ${a.titulo}`, '');
    if (a.subtitulo) p(`*${a.subtitulo}*`, '');
    p(a.resumo, '');
    p(`\`${a.id}\` · nível ${a.prof} · ${a.nivel} · **${a.tempo} min de aula** ` +
      `e ${a.leitura} min de leitura em casa ` +
      `(${a.esqueleto ? 'planejado pelos tópicos' : 'medido na página'}) · ` +
      `${a.topicos.length} tópicos`, '');
    p(`**Precisa de:** ${a.prereqs.length ? a.prereqs.map(t).join(', ') : 'nada, é porta de entrada'}  `);
    p(`**Destrava:** ${a.filhos.length ? a.filhos.map(t).join(', ') : 'ninguém, é fim de linha'}`, '');
    p('**O que a aula cobre:**', '');
    for (const x of a.topicos) p(`- ${x}`);
    p('');
    if (!a.esqueleto && a.titulos.length) p(`**Seções já escritas:** ${a.titulos.join(' · ')}`, '');
    if (a.previsao) p(`**Recorte previsto:** ${a.previsao}`, '');
    if (a.falta) p(`**Falta:** ${a.falta}`, '');
  }
}

p('## Índice remissivo', '');
p('Todo tópico de toda aula, em ordem alfabética. É o mesmo conteúdo da página `/indice` do site.', '');
const idx = [];
for (const a of todas) for (const x of a.topicos) idx.push([x, a]);
idx.sort((x, y) => x[0].localeCompare(y[0], 'pt-BR'));
let inicial = '';
for (const [x, a] of idx) {
  const c = x[0].toLocaleUpperCase('pt-BR').normalize('NFD')[0];
  if (c !== inicial) { inicial = c; p('', `**${c}**`, ''); }
  p(`- ${x} → ${a.titulo} (#${a.n})`);
}
p('');



/* ---------- a versão pra tela ---------- */

const CORES = {
  aritmetica: ['#1baf7a', '#35c894'],
  algebra: ['#eb6834', '#ff8a5c'],
  funcoes: ['#4a3aa7', '#9d90ff'],
  geometria: ['#8a5a00', '#d99b1f'],
  estatistica: ['#b5327f', '#f070b6'],
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function paginaHtml() {
  const areas = BLOCOS.map((b) => {
    const l = todas.filter((a) => a.bloco === b);
    return { b, l, min: soma(l), top: l.reduce((s, a) => s + a.topicos.length, 0) };
  });
  const maiorArea = Math.max(...areas.map((x) => x.min));
  const totalTop = todas.reduce((s, a) => s + a.topicos.length, 0);

  const ficha = (a) => `
  <article class="ficha" id="a-${a.id}" data-area="${a.bloco}" data-busca="${esc([a.titulo, a.subtitulo, a.id, a.resumo, ...a.topicos].join(' ').toLocaleLowerCase('pt-BR'))}">
    <header>
      <span class="n">${a.n}</span>
      <h3>${esc(a.titulo)}</h3>
      ${a.subtitulo ? `<p class="sub">${esc(a.subtitulo)}</p>` : ''}
    </header>
    <p class="resumo">${esc(a.resumo)}</p>
    <p class="meta"><code>${a.id}</code> · nível ${a.prof} · ${a.nivel} · ${a.tempo} min · ${a.topicos.length} tópicos${a.esqueleto ? ' · <span class="selo">esqueleto</span>' : ' · <span class="selo pronta">escrita</span>'}</p>
    <dl class="elos">
      <dt>Precisa de</dt><dd>${a.prereqs.length ? a.prereqs.map((p) => `<a href="#a-${p}">${esc(t(p))}</a>`).join(', ') : '<i>nada, é porta de entrada</i>'}</dd>
      <dt>Destrava</dt><dd>${a.filhos.length ? a.filhos.map((f) => `<a href="#a-${f}">${esc(t(f))}</a>`).join(', ') : '<i>ninguém, é fim de linha</i>'}</dd>
    </dl>
    <ul class="topicos">${a.topicos.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    ${a.previsao ? `<p class="nota"><b>Recorte previsto.</b> ${esc(a.previsao)}</p>` : ''}
    ${!a.esqueleto && a.titulos.length ? `<p class="nota"><b>Seções escritas.</b> ${a.titulos.map(esc).join(' · ')}</p>` : ''}
    ${a.falta ? `<p class="nota falta"><b>Falta.</b> ${esc(a.falta)}</p>` : ''}
  </article>`;

  return `<title>Plano de aulas do Prevest</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Space+Grotesk:wght@400;500;600;700&display=swap">
<style>
:root {
  --u: 24px;
  --papel: #fcfcfa; --fundo: #f4f5f2; --grade: #d9e2e0; --linha: #e2e4e0;
  --tinta: #14181f; --tinta-media: #454d59; --tinta-fraca: #666e7a;
  --marca: #f5cf4d; --marca-fraco: #fdf5d9;
  --sombra: 0 1px 2px rgba(20,24,31,.05), 0 4px 16px rgba(20,24,31,.05);
${BLOCOS.map((b, i) => `  --a${i + 1}: ${CORES[b][0]};`).join('\n')}
  --f-ui: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --f-texto: 'Source Serif 4', ui-serif, Georgia, serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --papel: #1b2027; --fundo: #14181f; --grade: #232a33; --linha: #2b333d;
    --tinta: #eef1f4; --tinta-media: #b3bcc7; --tinta-fraca: #8d97a3;
    --marca: #f5cf4d; --marca-fraco: #33301f;
    --sombra: 0 1px 2px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.25);
${BLOCOS.map((b, i) => `    --a${i + 1}: ${CORES[b][1]};`).join('\n')}
  }
}
:root[data-theme="dark"] {
  --papel: #1b2027; --fundo: #14181f; --grade: #232a33; --linha: #2b333d;
  --tinta: #eef1f4; --tinta-media: #b3bcc7; --tinta-fraca: #8d97a3;
  --marca: #f5cf4d; --marca-fraco: #33301f;
  --sombra: 0 1px 2px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.25);
${BLOCOS.map((b, i) => `  --a${i + 1}: ${CORES[b][1]};`).join('\n')}
}
* { box-sizing: border-box; }
body {
  margin: 0; color: var(--tinta); background-color: var(--fundo);
  background-image: linear-gradient(var(--grade) 1px, transparent 1px), linear-gradient(90deg, var(--grade) 1px, transparent 1px);
  background-size: var(--u) var(--u); background-position: -1px -1px;
  font-family: var(--f-texto); font-size: 17px; line-height: 1.62;
  -webkit-font-smoothing: antialiased;
}
.folha { max-width: 74rem; margin: 0 auto; padding: calc(var(--u) * 2) var(--u) calc(var(--u) * 4); }
h1, h2, h3, .n, .rotulo, th, .selo, code, .chip, input { font-family: var(--f-ui); }
h1 { font-size: 2.6rem; line-height: 1.05; margin: 0; letter-spacing: -.03em; text-wrap: balance; }
h2 { font-size: 1.5rem; letter-spacing: -.02em; margin: 0 0 .4rem; text-wrap: balance; }
h3 { font-size: 1.12rem; letter-spacing: -.015em; margin: 0; text-wrap: balance; }
p { margin: 0 0 .7rem; }
a { color: inherit; text-decoration-color: var(--linha); text-underline-offset: 2px; }
a:hover { text-decoration-color: currentColor; }
:focus-visible { outline: 2px solid var(--tinta); outline-offset: 2px; }
code { font-size: .8em; color: var(--tinta-fraca); }
.rotulo { font-size: .72rem; text-transform: uppercase; letter-spacing: .14em; color: var(--tinta-fraca); font-weight: 600; }
section { margin-top: calc(var(--u) * 2.5); }
.cartao { background: var(--papel); border: 1px solid var(--linha); border-radius: 3px; box-shadow: var(--sombra); padding: var(--u); }

/* topo */
header.capa { border-bottom: 2px solid var(--tinta); padding-bottom: var(--u); }
header.capa p.desc { font-size: 1.15rem; color: var(--tinta-media); max-width: 60ch; margin-top: .6rem; }
.numeros { display: flex; flex-wrap: wrap; gap: var(--u); margin-top: var(--u); }
.numeros div { display: flex; flex-direction: column; }
.numeros b { font-family: var(--f-ui); font-size: 1.9rem; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.numeros span { font-size: .74rem; text-transform: uppercase; letter-spacing: .12em; color: var(--tinta-fraca); margin-top: .35rem; }

/* panorama */
.areas { display: grid; gap: 2px; }
.areas .l { display: grid; grid-template-columns: 12rem 3.5rem 4rem 4.5rem 1fr; gap: .8rem; align-items: center; padding: .35rem 0; border-bottom: 1px solid var(--linha); font-variant-numeric: tabular-nums; font-size: .95rem; }
.areas .nome { font-family: var(--f-ui); font-weight: 500; display: flex; align-items: center; gap: .5rem; }
.pt { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.barra { height: 8px; border-radius: 2px; }
.areas .num { color: var(--tinta-media); font-size: .85rem; }

/* tabelas */
.rolagem { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: .92rem; }
th { text-align: left; font-size: .72rem; text-transform: uppercase; letter-spacing: .1em; color: var(--tinta-fraca); font-weight: 600; padding: .4rem .6rem; border-bottom: 1px solid var(--tinta); white-space: nowrap; }
td { padding: .3rem .6rem; border-bottom: 1px solid var(--linha); vertical-align: top; }
td.n, td.d { text-align: right; font-family: var(--f-ui); font-variant-numeric: tabular-nums; color: var(--tinta-media); white-space: nowrap; }
tbody tr:hover { background: var(--papel); }
.aula-cel { display: flex; align-items: center; gap: .5rem; }

/* busca */
.busca { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin-bottom: var(--u); position: sticky; top: 0; z-index: 2; background: var(--fundo); padding: .6rem 0; }
input[type=search] { flex: 1 1 16rem; font-size: .95rem; padding: .5rem .7rem; border: 1px solid var(--linha); border-radius: 3px; background: var(--papel); color: var(--tinta); }
.chip { font-size: .78rem; padding: .35rem .7rem; border: 1px solid var(--linha); border-radius: 999px; background: var(--papel); color: var(--tinta-media); cursor: pointer; }
.chip[aria-pressed=true] { background: var(--tinta); color: var(--papel); border-color: var(--tinta); }
.contagem { font-family: var(--f-ui); font-size: .78rem; color: var(--tinta-fraca); font-variant-numeric: tabular-nums; }

/* fichas */
.fichas { display: grid; grid-template-columns: repeat(auto-fill, minmax(23rem, 1fr)); gap: var(--u); align-items: start; }
.ficha { background: var(--papel); border: 1px solid var(--linha); border-left: 4px solid var(--cor); border-radius: 3px; box-shadow: var(--sombra); padding: calc(var(--u) * .8) var(--u); scroll-margin-top: 4rem; }
.ficha[hidden] { display: none; }
.ficha .n { font-size: .78rem; font-weight: 600; color: var(--cor); font-variant-numeric: tabular-nums; }
.ficha .sub { font-family: var(--f-texto); font-style: italic; color: var(--tinta-media); margin: .15rem 0 0; font-size: .95rem; }
.ficha .resumo { margin-top: .6rem; }
.ficha .meta { font-family: var(--f-ui); font-size: .76rem; color: var(--tinta-fraca); margin-bottom: .6rem; }
.selo { border: 1px solid var(--marca); background: var(--marca-fraco); border-radius: 2px; padding: 0 .3rem; color: var(--tinta-media); }
.selo.pronta { border-color: var(--cor); background: transparent; color: var(--cor); }
.elos { display: grid; grid-template-columns: 6.2rem 1fr; gap: .15rem .6rem; margin: 0 0 .7rem; font-size: .86rem; }
.elos dt { font-family: var(--f-ui); font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; color: var(--tinta-fraca); padding-top: .18rem; }
.elos dd { margin: 0; color: var(--tinta-media); }
.topicos { display: flex; flex-wrap: wrap; gap: .3rem; list-style: none; padding: 0; margin: 0 0 .6rem; }
.topicos li { font-family: var(--f-ui); font-size: .78rem; background: var(--fundo); border: 1px solid var(--linha); border-radius: 2px; padding: .1rem .4rem; color: var(--tinta-media); }
.nota { font-size: .88rem; color: var(--tinta-media); margin: .5rem 0 0; padding-left: .7rem; border-left: 2px solid var(--linha); }
.nota b { font-family: var(--f-ui); font-size: .74rem; text-transform: uppercase; letter-spacing: .08em; color: var(--tinta-fraca); }
.nota.falta { border-left-color: var(--marca); }
.grupo { margin-top: calc(var(--u) * 1.6); }
.grupo h2 { display: flex; align-items: baseline; gap: .6rem; }
.grupo h2 .num { font-family: var(--f-ui); font-size: .78rem; font-weight: 500; color: var(--tinta-fraca); letter-spacing: 0; text-transform: none; }

/* índice */
.indice { columns: 4 15rem; column-gap: var(--u); font-size: .88rem; }
.indice div { break-inside: avoid; }
.indice .letra { font-family: var(--f-ui); font-weight: 600; font-size: .8rem; color: var(--tinta-fraca); border-bottom: 1px solid var(--linha); margin: .8rem 0 .2rem; }
.indice a { display: block; text-decoration: none; color: var(--tinta-media); }
.indice a:hover { color: var(--tinta); text-decoration: underline; }
.indice a .aula { color: var(--tinta-fraca); font-size: .8em; }
.indice a[hidden] { display: none; }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
</style>

<div class="folha">
<header class="capa">
  <p class="rotulo">Pré-vestibular · Matemática</p>
  <h1>Plano de aulas</h1>
  <p class="desc">Todo módulo do currículo com o que ele cobre por dentro, de quem depende e quem depende dele. Gerado do frontmatter das ${todas.length} aulas em <code>content/conceitos/</code>.</p>
  <div class="numeros">
    <div><b>${todas.length}</b><span>aulas</span></div>
    <div><b>${totalTop}</b><span>tópicos</span></div>
    <div><b>${hm(soma(todas))}</b><span>de aula</span></div>
    <div><b>${escritas.length}</b><span>escritas</span></div>
    <div><b>${todas.length - escritas.length}</b><span>esqueletos</span></div>
    <div><b>${Math.max(...todas.map((a) => a.prof)) + 1}</b><span>camadas</span></div>
  </div>
</header>

<section>
  <h2>Por área</h2>
  <p class="rotulo">largura da barra = tempo de aula</p>
  <div class="areas">
  ${areas.map((x, i) => `<div class="l">
    <span class="nome"><span class="pt" style="background:var(--a${i + 1})"></span>${ROTULO_BLOCO[x.b]}</span>
    <span class="num">${x.l.length} aulas</span>
    <span class="num">${x.top} tóp.</span>
    <span class="num">${hm(x.min)}</span>
    <span class="barra" style="width:${Math.round((x.min / maiorArea) * 100)}%;background:var(--a${i + 1})"></span>
  </div>`).join('\n  ')}
  </div>
  <p style="margin-top:1rem;color:var(--tinta-media)">${base.length} aulas são de <b>base</b> (revisão de fundamental que trava o resto, ${hm(soma(base))}) e ${todas.length - base.length} são de <b>médio</b> (${hm(soma(todas) - soma(base))}).</p>
</section>

<section>
  <h2>Os gargalos</h2>
  <p style="color:var(--tinta-media);max-width:60ch">As aulas que mais destravam outras. Se o aluno chega no meio do ano, é por aqui que se decide o que não dá pra pular.</p>
  <div class="rolagem"><table>
    <thead><tr><th>Aula</th><th class="d">Destrava</th><th>Quem</th></tr></thead>
    <tbody>${[...todas].sort((x, y) => y.filhos.length - x.filhos.length).slice(0, 10).map((a) => `
      <tr><td><a href="#a-${a.id}">${esc(a.titulo)}</a></td><td class="d">${a.filhos.length}</td><td>${a.filhos.map((f) => esc(t(f))).join(', ')}</td></tr>`).join('')}
    </tbody>
  </table></div>
  <p style="margin-top:1rem;color:var(--tinta-media)"><b>Fim de linha</b>, não destravam ninguém: ${folhas.map((a) => `<a href="#a-${a.id}">${esc(a.titulo)}</a>`).join(', ')}.</p>
</section>

<section>
  <h2>Uma ordem possível</h2>
  <p style="color:var(--tinta-media);max-width:60ch">O grafo declara dependência, não fila. Esta ordem respeita todos os pré-requisitos e sobe camada por camada, ficando na mesma área enquanto dá; a ordem real é oportunista, guiada pelo que o aluno está vendo na escola.</p>
  <div class="rolagem"><table>
    <thead><tr><th class="d">#</th><th>Aula</th><th>Área</th><th class="d">Camada</th><th class="d">Min</th><th class="d">Acumulado</th></tr></thead>
    <tbody>${(() => { let s = 0; return trilha.map((a) => { s += a.tempo; const i = BLOCOS.indexOf(a.bloco) + 1; return `
      <tr><td class="n">${a.n}</td><td><span class="aula-cel"><span class="pt" style="background:var(--a${i})"></span><a href="#a-${a.id}">${esc(a.titulo)}</a></span></td><td>${ROTULO_BLOCO[a.bloco]}</td><td class="d">${a.prof}</td><td class="d">${a.tempo}</td><td class="d">${hm(s)}</td></tr>`; }).join(''); })()}
    </tbody>
  </table></div>
</section>

<section id="fichas">
  <h2>As fichas</h2>
  <div class="busca">
    <input type="search" id="q" placeholder="Buscar aula ou tópico: bhaskara, apótema, dízima…" aria-label="Buscar aula ou tópico">
    <button class="chip" data-area="" aria-pressed="true">todas</button>
    ${BLOCOS.map((b) => `<button class="chip" data-area="${b}" aria-pressed="false">${ROTULO_BLOCO[b]}</button>`).join('\n    ')}
    <span class="contagem" id="contagem">${todas.length} aulas</span>
  </div>
  ${BLOCOS.map((b, i) => {
    const l = todas.filter((a) => a.bloco === b).sort((x, y) => x.n - y.n);
    return `<div class="grupo" data-grupo="${b}" style="--cor:var(--a${i + 1})">
    <h2>${ROTULO_BLOCO[b]} <span class="num">${l.length} aulas · ${hm(soma(l))}</span></h2>
    <div class="fichas">${l.map(ficha).join('')}</div>
  </div>`;
  }).join('\n  ')}
</section>

<section>
  <h2>Índice remissivo</h2>
  <p style="color:var(--tinta-media);max-width:60ch">Os ${idx.length} tópicos em ordem alfabética, cada um apontando pra aula onde ele é ensinado. A busca lá de cima também filtra esta lista.</p>
  <div class="indice">${(() => {
    let letra = '';
    const out = [];
    for (const [x, a] of idx) {
      const c = x[0].toLocaleUpperCase('pt-BR').normalize('NFD')[0];
      if (c !== letra) { letra = c; out.push(`<div class="letra">${esc(c)}</div>`); }
      out.push(`<div><a href="#a-${a.id}" data-busca="${esc((x + ' ' + a.titulo).toLocaleLowerCase('pt-BR'))}" data-area="${a.bloco}">${esc(x)} <span class="aula">${esc(a.titulo)}</span></a></div>`);
    }
    return out.join('');
  })()}</div>
</section>
</div>

<script>
const q = document.getElementById('q');
const chips = [...document.querySelectorAll('.chip')];
const fichas = [...document.querySelectorAll('.ficha')];
const linhasIdx = [...document.querySelectorAll('.indice a')];
const contagem = document.getElementById('contagem');
let area = '';

/* sem acento dos dois lados, senão buscar "apotema" não acha "apótema" */
const chave = (s) => s.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');

function filtrar() {
  const termo = chave(q.value.trim().toLocaleLowerCase('pt-BR'));
  let n = 0;
  for (const f of fichas) {
    const ok = (!area || f.dataset.area === area) && (!termo || chave(f.dataset.busca).includes(termo));
    f.hidden = !ok;
    if (ok) n++;
  }
  for (const g of document.querySelectorAll('.grupo')) {
    g.hidden = ![...g.querySelectorAll('.ficha')].some((f) => !f.hidden);
  }
  for (const l of linhasIdx) {
    l.hidden = (area && l.dataset.area !== area) || (termo && !chave(l.dataset.busca).includes(termo));
  }
  contagem.textContent = n === fichas.length ? n + ' aulas' : n + ' de ' + fichas.length + ' aulas';
}

q.addEventListener('input', filtrar);
for (const c of chips) {
  c.addEventListener('click', () => {
    area = c.dataset.area;
    for (const o of chips) o.setAttribute('aria-pressed', String(o === c));
    filtrar();
  });
}
</script>`;
}

await writeFile(SAIDA, L.join('\n'));

/* A versão pra ler na tela, com busca. Mesmos dados, e por isso sai do mesmo
   script: dois documentos escritos à mão divergem na primeira semana. */
await writeFile(SAIDA_HTML, paginaHtml());
console.log(`${SAIDA}: ${todas.length} aulas, ${idx.length} tópicos, ${L.length} linhas.`);
console.log(`${SAIDA_HTML}: mesma coisa, com busca.`);
