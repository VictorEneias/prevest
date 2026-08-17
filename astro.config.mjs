import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Site 100% estático. `npm run build` gera dist/ e `npm run aula` serve essa pasta.
// Nada de dev server na casa do aluno.

// Build e dev não podem dividir a mesma pasta de cache do Vite. Rodar o build
// com o dev server aberto reescrevia node_modules/.vite com a versão de
// produção do React, e aí o jsx-dev-runtime servido pro navegador virava um
// stub sem jsxDEV: toda ilha React aparecia por meio segundo, quebrava na
// hidratação e sumia da tela.
const cacheDir = process.argv.includes('build') ? 'node_modules/.vite-build' : 'node_modules/.vite-dev';

export default defineConfig({
  integrations: [mdx(), react()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { throwOnError: false, strict: false }]],
  },
  build: {
    format: 'directory',
  },
  vite: { cacheDir },
});
