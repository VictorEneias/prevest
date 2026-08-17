import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Um comando só: `npm run dev` é o que eu uso pra escrever e pra dar aula.
// `npm run build` existe pra subir na nuvem, e não faz parte do fluxo de aula.
//
// O MDX é compilado aqui, então o KaTeX roda na compilação e o navegador só
// recebe a fórmula já montada. providerImportSource é o que deixa o .mdx usar
// <Setas />, <Questao /> e companhia sem nenhum import: quem entrega esses
// componentes é o MDXProvider em src/components/mdx.tsx.
export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkMath],
        rehypePlugins: [[rehypeKatex, { throwOnError: false, strict: false }]],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
});
