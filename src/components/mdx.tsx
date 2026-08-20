/**
 * Tudo daqui fica disponível em qualquer .mdx sem import.
 *
 * Quem entrega esses componentes pro MDX é o <MDXProvider> em App.tsx, e é por
 * isso que o conteúdo nunca escreve `import`. Componente novo entra nesta lista.
 *
 * A lista é curta de propósito: uma aula é prosa, título e figura. As camadas
 * retráteis (explicação, curiosidade, dica, resolução) saíram, porque cada uma
 * obrigava o texto a saber em que caixa ele morava.
 *
 * <Dicas>, <Dica> e <Resolucao> voltaram, e só valem pra exercício: ali a caixa
 * não é arquivamento, é função. A dica precisa abrir uma por vez e a resolução
 * precisa começar fechada, senão o aluno lê a resposta antes de tentar.
 */
import type { ComponentType } from 'react';
import C from './C';
import Par from './Par';
import Alem from './Alem';
import Dicas, { Dica } from './Dicas';
import Resolucao from './Resolucao';
import Juncao from './viz/Juncao';
import Setas from './viz/Setas';
import Reta from './viz/Reta';
import Plano from './viz/Plano';
import RetaZoom from './viz/RetaZoom';
import Caixas from './viz/Caixas';
import Conjunto from './viz/Conjunto';
import Retangulo from './viz/Retangulo';
import Barra from './viz/Barra';
import Esticar from './viz/Esticar';

export const componentesMDX: Record<string, ComponentType<any>> = {
  C,
  Par,
  Alem,
  Dicas,
  Dica,
  Resolucao,
  Juncao,
  Setas,
  Reta,
  Plano,
  RetaZoom,
  Caixas,
  Conjunto,
  Retangulo,
  Barra,
  Esticar,
};
