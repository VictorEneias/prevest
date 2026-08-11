import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Site 100% estático. `npm run build` gera dist/ e `npm run aula` serve essa pasta.
// Nada de dev server na casa do aluno.
export default defineConfig({
  integrations: [mdx(), react()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { throwOnError: false, strict: false }]],
  },
  build: {
    format: 'directory',
  },
});
