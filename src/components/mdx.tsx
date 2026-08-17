/**
 * Tudo daqui fica disponível em qualquer .mdx sem import.
 *
 * Quem entrega esses componentes pro MDX é o <MDXProvider> em App.tsx, e é por
 * isso que o conteúdo nunca escreve `import`. Componente novo entra nesta lista.
 */
import type { ComponentType } from 'react';
import C from './C';
import Questao from './Questao';
import Explicacao from './camadas/Explicacao';
import Dica from './camadas/Dica';
import Resolucao from './camadas/Resolucao';
import Pensamento from './camadas/Pensamento';
import Erros from './camadas/Erros';
import Curiosidade from './camadas/Curiosidade';
import Juncao from './viz/Juncao';
import Setas from './viz/Setas';
import Reta from './viz/Reta';
import RetaZoom from './viz/RetaZoom';

export const componentesMDX: Record<string, ComponentType<any>> = {
  C,
  Explicacao,
  Dica,
  Resolucao,
  Pensamento,
  Erros,
  Curiosidade,
  Questao,
  Juncao,
  Setas,
  Reta,
  RetaZoom,
};
