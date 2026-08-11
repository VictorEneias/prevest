/**
 * npm run grafo
 *
 * Com 150 páginas interligadas, link morto é inevitável e invisível.
 * Este script é o que impede o grafo de apodrecer sem você perceber:
 *   · prereq apontando pra conceito que não existe
 *   · ciclo (A precisa de B, B precisa de A)
 *   · exercício apontando pra assunto inexistente
 *   · desbloqueia declarado sem o prereq recíproco
 *
 * Sai com código 1 se achar problema — dá pra plugar em pre-commit.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR_C = 'content/conceitos';
const DIR_E = 'content/exercicios';

const vermelho = (s) => `\x1b[31m${s}\x1b[0m`;
const amarelo = (s) => `\x1b[33m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const cinza = (s) => `\x1b[90m${s}\x1b[0m`;

function frontmatter(txt) {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const linha of m[1].split(/\r?\n/)) {
    const kv = linha.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    if (v.startsWith('[')) {
      out[k] = v
        .replace(/[[\]]/g, '')
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      out[k] = v.replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

async function ler(dir) {
  let nomes = [];
  try {
    nomes = (await readdir(dir)).filter((n) => n.endsWith('.mdx'));
  } catch {
    return new Map();
  }
  const mapa = new Map();
  for (const n of nomes) {
    const txt = await readFile(join(dir, n), 'utf8');
    mapa.set(n.replace(/\.mdx$/, ''), { fm: frontmatter(txt), corpo: txt, arquivo: join(dir, n) });
  }
  return mapa;
}

const conceitos = await ler(DIR_C);
const exercicios = await ler(DIR_E);
const erros = [];
const avisos = [];

/* --- prereqs e desbloqueia apontando pro vazio --- */
for (const [id, { fm, arquivo }] of conceitos) {
  for (const campo of ['prereqs', 'desbloqueia']) {
    for (const alvo of fm[campo] ?? []) {
      if (!conceitos.has(alvo)) {
        erros.push(`${arquivo}: ${campo} aponta pra "${alvo}", que não existe`);
      }
    }
  }
  /* --- <C id="..."> no corpo --- */
  const corpo = conceitos.get(id).corpo;
  for (const m of corpo.matchAll(/<C\s+id=["']([^"']+)["']/g)) {
    if (!conceitos.has(m[1])) {
      erros.push(`${arquivo}: <C id="${m[1]}"> não existe`);
    }
  }
}

/* --- reciprocidade: se A desbloqueia B, B deveria ter A em prereqs --- */
for (const [id, { fm, arquivo }] of conceitos) {
  for (const alvo of fm.desbloqueia ?? []) {
    const d = conceitos.get(alvo);
    if (d && !(d.fm.prereqs ?? []).includes(id)) {
      avisos.push(`${arquivo}: declara desbloquear "${alvo}", mas "${alvo}" não lista "${id}" em prereqs`);
    }
  }
}

/* --- ciclos --- */
const estado = new Map();
const caminho = [];
function visitar(id) {
  if (estado.get(id) === 'ok') return;
  if (estado.get(id) === 'andando') {
    erros.push(`Ciclo no grafo: ${[...caminho.slice(caminho.indexOf(id)), id].join(' → ')}`);
    return;
  }
  estado.set(id, 'andando');
  caminho.push(id);
  for (const p of conceitos.get(id)?.fm.prereqs ?? []) if (conceitos.has(p)) visitar(p);
  caminho.pop();
  estado.set(id, 'ok');
}
for (const id of conceitos.keys()) visitar(id);

/* --- exercícios --- */
for (const [, { fm, arquivo }] of exercicios) {
  for (const a of fm.assuntos ?? []) {
    if (!conceitos.has(a)) erros.push(`${arquivo}: assunto "${a}" não existe`);
  }
}

/* --- relatório --- */
const naoRevisados = [...conceitos.values()].filter((c) => c.fm.revisado !== 'true').length;
const orfaos = [...conceitos.keys()].filter(
  (id) => ![...conceitos.values()].some((c) => (c.fm.prereqs ?? []).includes(id))
);

console.log('');
console.log(`  ${conceitos.size} conceitos · ${exercicios.size} exercícios`);
console.log(cinza(`  ${naoRevisados} ainda em rascunho`));
if (orfaos.length && orfaos.length < conceitos.size) {
  console.log(cinza(`  folhas do grafo (ninguém depende): ${orfaos.join(', ')}`));
}
console.log('');
avisos.forEach((a) => console.log(`  ${amarelo('aviso')}  ${a}`));
erros.forEach((e) => console.log(`  ${vermelho('erro')}   ${e}`));
console.log('');

if (erros.length) {
  console.log(vermelho(`  ✗ ${erros.length} problema(s) no grafo\n`));
  process.exit(1);
}
console.log(verde('  ✓ grafo íntegro\n'));
