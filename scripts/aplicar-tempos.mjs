/**
 * npm run tempos
 *
 * Reescreve o tempo_estimado de todas as aulas usando o modelo do
 * tempo-aula.mjs: aula escrita é medida na própria página, esqueleto sai da
 * régua por tópicos ajustada nas escritas.
 *
 * Existe porque os 84 números eram chute meu, um por um, e chute não dá pra
 * revisar: ninguém consegue olhar "45 min" e dizer se está certo. Número que sai
 * de conta, dá.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  medirPagina,
  tempoDeAula,
  tempoDeLeitura,
  ehEsqueleto,
  reguaPorTopicos,
} from './tempo-aula.mjs';

const DIR = 'content/conceitos';
const cinza = (s) => `\x1b[90m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const amarelo = (s) => `\x1b[33m${s}\x1b[0m`;

const arquivos = (await readdir(DIR)).filter((n) => n.endsWith('.mdx')).sort();
const aulas = [];

for (const nome of arquivos) {
  const bruto = await readFile(join(DIR, nome), 'utf8');
  const m = bruto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) continue;
  const [, fm, corpo] = m;
  const topicos = (fm.match(/^\s+-\s+.*$/gm) || []).length;
  const antes = Number((fm.match(/^tempo_estimado:\s*(\d+)/m) || [])[1] ?? 0);
  aulas.push({
    nome,
    bruto,
    corpo,
    topicos,
    antes,
    esqueleto: ehEsqueleto(corpo),
    antesLeitura: Number((fm.match(/^tempo_leitura:\s*(\d+)/m) || [])[1] ?? 0),
    medida: medirPagina(corpo),
  });
}

const escritas = aulas.filter((a) => !a.esqueleto);
escritas.forEach((a) => {
  a.depois = tempoDeAula(a.medida);
  a.leitura = tempoDeLeitura(a.medida);
});

const regua = reguaPorTopicos(escritas.map((a) => ({ topicos: a.topicos, minutos: a.depois })));
aulas
  .filter((a) => a.esqueleto)
  .forEach((a) => {
    a.depois = regua(a.topicos);
    /* esqueleto não tem página pra medir a leitura, e as duas taxas do modelo são
       uma o dobro da outra, então a leitura dele é metade do tempo planejado */
    a.leitura = Math.max(1, Math.round(a.depois / 2));
  });

let mexidas = 0;
for (const a of aulas) {
  if (a.antes === a.depois && a.antesLeitura === a.leitura) continue;
  mexidas++;
  const comAula = a.bruto.replace(/^tempo_estimado:\s*\d+/m, `tempo_estimado: ${a.depois}`);
  /* o tempo_leitura entra logo abaixo do de aula, e é escrito por aqui do mesmo
     jeito: os dois saem da mesma conta e não fazia sentido manter um à mão */
  const comLeitura = /^tempo_leitura:/m.test(comAula)
    ? comAula.replace(/^tempo_leitura:\s*\d+/m, `tempo_leitura: ${a.leitura}`)
    : comAula.replace(
        /^(tempo_estimado:\s*\d+)$/m,
        `$1\ntempo_leitura: ${a.leitura}`,
      );
  await writeFile(join(DIR, a.nome), comLeitura);
}

console.log('');
console.log('  aulas escritas, medidas na página:');
for (const a of escritas) {
  const seta = a.antes === a.depois ? cinza('=') : amarelo(`${a.antes} →`);
  console.log(
    `    ${a.nome.replace('.mdx', '').padEnd(22)} ${seta} ${a.depois} min de aula` +
      cinza(`  (${a.medida.prosa} palavras, ${a.medida.figuras} figuras, ` +
        `${a.medida.interativos} interativo${a.medida.interativos === 1 ? '' : 's'}` +
        `, ${a.leitura} min de leitura em casa)`),
  );
}
const soma = aulas.reduce((s, a) => s + a.depois, 0);
console.log('');
console.log(
  cinza(
    `  ${aulas.length - escritas.length} esqueletos pela régua de tópicos, ` +
      `e ${mexidas} arquivo(s) mudaram. Curso inteiro: ${Math.floor(soma / 60)}h${String(soma % 60).padStart(2, '0')}.`,
  ),
);
console.log(verde('\n  ✓ tempos aplicados\n'));
