/**
 * npm run paginas
 *
 * Renderiza toda página do site no node, com o mesmo pipeline do Vite, e avisa
 * qual quebrou. É o substituto do build do Astro: antes, componente escrito
 * errado no MDX derrubava o build e eu descobria na hora; agora o Vite compila
 * sem reclamar e o erro só apareceria no navegador, na hora da aula.
 *
 * O que ele pega: componente que não está no mdx.tsx, JSX torto no conteúdo,
 * prop obrigatória faltando.
 */
import { createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const vermelho = (s) => `\x1b[31m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const cinza = (s) => `\x1b[90m${s}\x1b[0m`;

const quebradas = [];

try {
  /* React e o router vêm pelo import do node, e não pelo ssrLoadModule: o Vite
     externaliza dependência de node_modules, então assim o App e este script
     ficam com a mesma cópia do React, que é o que os hooks exigem. */
  const { createElement: h } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { MemoryRouter } = await import('react-router-dom');
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  const { ProvedorAula } = await vite.ssrLoadModule('/src/estado.tsx');
  const { conceitos } = await vite.ssrLoadModule('/src/conteudo.ts');

  const rotas = ['/', '/indice', ...conceitos.map((c) => `/conceitos/${c.id}`)];

  console.log('');
  for (const rota of rotas) {
    try {
      const html = renderToString(
        h(MemoryRouter, { initialEntries: [rota] }, h(ProvedorAula, null, h(App, null))),
      );
      /* Cifrão sobrando quase sempre é LaTeX com delimitador desbalanceado. */
      const semSvg = html.replace(/<svg[\s\S]*?<\/svg>/g, '');
      if (semSvg.includes('$')) {
        quebradas.push([rota, 'sobrou cifrão no texto — LaTeX desbalanceado?']);
      }
    } catch (e) {
      quebradas.push([rota, e.message.split('\n')[0]]);
    }
  }

  console.log(cinza(`  ${rotas.length} páginas renderizadas`));
} catch (e) {
  console.error(vermelho('\n  o app não levantou:'), e.message);
  process.exitCode = 1;
} finally {
  await vite.close();
}

console.log('');
for (const [rota, erro] of quebradas) {
  console.log(`  ${vermelho('quebrou')} ${rota}\n          ${erro}`);
}
console.log('');

if (quebradas.length) {
  console.log(vermelho(`  ✗ ${quebradas.length} página(s) com problema\n`));
  process.exit(1);
}
if (!process.exitCode) console.log(verde('  ✓ todas as páginas renderizam\n'));
