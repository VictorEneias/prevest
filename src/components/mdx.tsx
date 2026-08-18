/**
 * Tudo daqui fica disponível em qualquer .mdx sem import.
 *
 * Quem entrega esses componentes pro MDX é o <MDXProvider> em App.tsx, e é por
 * isso que o conteúdo nunca escreve `import`. Componente novo entra nesta lista.
 *
 * A lista é curta de propósito: uma aula é prosa, título e figura. As camadas
 * retráteis (explicação, curiosidade, dica, resolução) saíram, porque cada uma
 * obrigava o texto a saber em que caixa ele morava.
 */
import type { ComponentType } from 'react';
import C from './C';
import Juncao from './viz/Juncao';
import Setas from './viz/Setas';
import Reta from './viz/Reta';
import RetaZoom from './viz/RetaZoom';
import Caixas from './viz/Caixas';
import Retangulo from './viz/Retangulo';
import Barra from './viz/Barra';
import Esticar from './viz/Esticar';

export const componentesMDX: Record<string, ComponentType<any>> = {
  C,
  Juncao,
  Setas,
  Reta,
  RetaZoom,
  Caixas,
  Retangulo,
  Barra,
  Esticar,
};
