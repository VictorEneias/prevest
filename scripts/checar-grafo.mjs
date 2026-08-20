/**
 * npm run grafo
 *
 * Com uma centena de páginas interligadas, elo morto é inevitável e invisível.
 * Este script é o que impede o grafo de apodrecer sem eu perceber. Ele acusa:
 * frontmatter inválido, prereq apontando pra aula que não existe, ciclo, prereq
 * redundante e matéria com mais de 5 áreas.
 *
 * A checagem de frontmatter era do Zod, no content.config.ts do Astro, e veio
 * pra cá quando o projeto saiu do Astro: eram dois validadores olhando os mesmos
 * arquivos, e agora é um.
 *
 * Sai com código 1 se achar problema, então dá pra plugar num pre-commit.
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
  let lista = null;
  for (const linha of m[1].split(/\r?\n/)) {
    /* item de lista em bloco, que é como os tópicos são escritos */
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
      out[k] = v
        .replace(/[[\]]/g, '')
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (v === '') {
      out[k] = [];
      lista = k;
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

/* --- frontmatter ---
   O parser aqui é de linha, então tudo chega como texto: número vira string e
   booleano também. Confiro forma e vocabulário, que é onde dá errado de verdade
   (materia escrita errado deixa o módulo cinza no mapa sem avisar ninguém). */
const MATERIAS = ['matematica', 'fisica'];
/* base é revisão de fundamental que ficou porque trava o resto; medio é
   conteúdo de ensino médio. O público do site já está no ensino médio. */
const NIVEIS = ['base', 'medio'];

const ehInteiroPositivo = (v) => /^\d+$/.test(String(v)) && Number(v) > 0;

for (const [, { fm, arquivo }] of conceitos) {
  const exigir = (campo) => {
    if (!fm[campo]) erros.push(`${arquivo}: falta o campo "${campo}" no frontmatter`);
  };
  exigir('titulo');
  exigir('resumo');
  if (!MATERIAS.includes(fm.materia)) {
    erros.push(`${arquivo}: materia "${fm.materia ?? ''}" — use ${MATERIAS.join(' ou ')}`);
  }
  if (!fm.bloco) erros.push(`${arquivo}: falta o campo "bloco" (a área do mapa)`);
  if (!NIVEIS.includes(fm.nivel)) {
    erros.push(`${arquivo}: nivel "${fm.nivel ?? ''}" — use um de ${NIVEIS.join(', ')}`);
  }
  if (fm.revisado !== 'true' && fm.revisado !== 'false') {
    erros.push(`${arquivo}: revisado tem que ser true ou false (nasce false, ver seção 8.1)`);
  }
  if (fm.tempo_estimado !== undefined && !ehInteiroPositivo(fm.tempo_estimado)) {
    erros.push(`${arquivo}: tempo_estimado tem que ser minuto inteiro positivo`);
  }
  if (fm.tempo_leitura !== undefined && !ehInteiroPositivo(fm.tempo_leitura)) {
    erros.push(`${arquivo}: tempo_leitura tem que ser minuto inteiro positivo`);
  }
  if (fm.itens_fuvest !== undefined && !/^\d+$/.test(String(fm.itens_fuvest))) {
    erros.push(`${arquivo}: itens_fuvest tem que ser número inteiro`);
  }
  if (fm.prereqs === undefined) {
    erros.push(`${arquivo}: falta o campo "prereqs" (use [] se for raiz do grafo)`);
  }
  if (!(fm.topicos ?? []).length) {
    erros.push(`${arquivo}: falta "topicos" — é por ele que o aluno acha o assunto na busca`);
  }
}

/* --- prereqs apontando pro vazio --- */
for (const [id, { fm, arquivo }] of conceitos) {
  for (const alvo of fm.prereqs ?? []) {
    if (!conceitos.has(alvo)) {
      erros.push(`${arquivo}: prereqs aponta pra "${alvo}", que não existe`);
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

/* --- prereq redundante ---
   Se X depende de A e de B, e A já é prereq de B, a seta A→X não acrescenta
   nada, porque quem chega em B já passou por A. O mapa desenha só o elo mais
   próximo, então a declaração extra fica invisível e só atrapalha na hora de
   editar. É aviso e não erro, porque às vezes eu quero manter por clareza. */
const ancestraisMemo = new Map();
function ancestrais(id) {
  if (ancestraisMemo.has(id)) return ancestraisMemo.get(id);
  const fora = new Set();
  ancestraisMemo.set(id, fora); // guarda contra ciclo
  for (const p of conceitos.get(id)?.fm.prereqs ?? []) {
    if (!conceitos.has(p)) continue;
    fora.add(p);
    for (const a of ancestrais(p)) fora.add(a);
  }
  return fora;
}
for (const [id, { fm, arquivo }] of conceitos) {
  const diretos = (fm.prereqs ?? []).filter((p) => conceitos.has(p));
  for (const p of diretos) {
    const via = diretos.find((q) => q !== p && ancestrais(q).has(p));
    if (via) {
      avisos.push(`${arquivo}: prereq "${p}" é redundante — já vem por "${via}". Pode remover`);
    }
  }
}

/* --- teto de 5 blocos por matéria ---
   Cinco é o limite medido da paleta: com azul e vermelho reservados pra sinal e
   o amarelo pro rascunho, nenhum sexto tom se separa dos outros pra daltônico.
   Do sexto bloco em diante a área vira cinza neutro. */
const blocosPorMateria = new Map();
for (const [, { fm }] of conceitos) {
  if (!fm.materia || !fm.bloco) continue;
  if (!blocosPorMateria.has(fm.materia)) blocosPorMateria.set(fm.materia, new Set());
  blocosPorMateria.get(fm.materia).add(fm.bloco);
}
for (const [materia, blocos] of blocosPorMateria) {
  if (blocos.size > 5) {
    avisos.push(
      `${materia} tem ${blocos.size} blocos (${[...blocos].join(', ')}). ` +
        `A paleta do mapa só distingue 5 — do sexto em diante vira cinza. Considere fundir.`,
    );
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

/* --- exercícios ---
   Os três eixos que o exercício declara, mais as duas amarras que a auditoria
   precisa: enunciado de prova sem fonte_url é enunciado que ninguém consegue
   conferir contra o original, e é exatamente ali que a transcrição erra. */
const NIVEIS_EX = ['basico', 'medio', 'desafio'];

for (const [id, { fm, corpo, arquivo }] of exercicios) {
  if (!fm.resumo) erros.push(`${arquivo}: falta "resumo" — é o que a busca mostra na lista`);
  if (!fm.fonte) erros.push(`${arquivo}: falta "fonte" (a banca, ou "Autoral")`);
  if (!NIVEIS_EX.includes(fm.nivel)) {
    erros.push(`${arquivo}: nivel "${fm.nivel ?? ''}" — use um de ${NIVEIS_EX.join(', ')}`);
  }
  if (fm.verificado !== 'true' && fm.verificado !== 'false') {
    erros.push(`${arquivo}: verificado tem que ser true ou false (nasce false)`);
  }
  const mods = fm.modulos ?? [];
  if (!mods.length) erros.push(`${arquivo}: falta "modulos" — sem isso o exercício não é achável`);
  for (const m of mods) {
    if (!conceitos.has(m)) erros.push(`${arquivo}: modulos aponta pra "${m}", que não existe`);
  }
  /* básico é o exercício do fim da aula, e ele cai numa aula só por definição:
     com dois módulos ele já é multidisciplinar, e a página calcula isso sozinha */
  if (fm.nivel === 'basico' && mods.length > 1) {
    erros.push(`${arquivo}: básico com ${mods.length} módulos — ou vira medio, ou fica com um só`);
  }
  const autoral = String(fm.fonte ?? '').toLowerCase() === 'autoral';
  if (!autoral && !fm.fonte_url) {
    erros.push(`${arquivo}: exercício de prova precisa de "fonte_url" pra auditoria conferir`);
  }
  if (!autoral && !fm.ano) {
    erros.push(`${arquivo}: exercício de prova precisa do "ano" da prova`);
  }
  if (!fm.resposta) avisos.push(`${arquivo}: sem "resposta" declarada no frontmatter`);
  if (!/<Resolucao/.test(corpo)) {
    avisos.push(`${arquivo}: não tem <Resolucao> — o aluno fica sem por onde conferir`);
  }
  if (!/<Dicas/.test(corpo) && fm.nivel !== 'basico') {
    avisos.push(`${arquivo}: sem <Dicas>, e ${fm.nivel} costuma precisar da escada`);
  }
  /* chaveUrl grava no hash da página, e a página de exercícios mostra vários de
     uma vez: dois exercícios com a mesma chave brigam pelo mesmo hash */
  for (const m of corpo.matchAll(/chaveUrl=["']([^"']+)["']/g)) {
    avisos.push(`${arquivo}: chaveUrl "${m[1]}" — a busca mostra vários exercícios juntos, tire`);
  }
  void id;
}

/* --- relatório --- */
const naoRevisados = [...conceitos.values()].filter((c) => c.fm.revisado !== 'true').length;
const orfaos = [...conceitos.keys()].filter(
  (id) => ![...conceitos.values()].some((c) => (c.fm.prereqs ?? []).includes(id))
);

console.log('');
const naoVerificados = [...exercicios.values()].filter((e) => e.fm.verificado !== 'true').length;

console.log(`  ${conceitos.size} aulas`);
console.log(cinza(`  ${naoRevisados} ainda em rascunho`));
console.log(`  ${exercicios.size} exercícios`);
console.log(cinza(`  ${naoVerificados} esperando auditoria`));
if (orfaos.length && orfaos.length < conceitos.size) {
  console.log(cinza(`  folhas do grafo (ninguém depende): ${orfaos.join(', ')}`));
}
console.log('');
avisos.forEach((a) => console.log(`  ${amarelo('aviso')}  ${a}`));
erros.forEach((e) => console.log(`  ${vermelho('erro')}   ${e}`));
console.log('');

if (erros.length) {
  console.log(vermelho(`  ✗ ${erros.length} problema(s) no conteúdo\n`));
  process.exit(1);
}
console.log(verde('  ✓ grafo íntegro\n'));
