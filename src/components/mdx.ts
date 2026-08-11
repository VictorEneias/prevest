/**
 * Tudo aqui fica disponível em QUALQUER arquivo .mdx sem import.
 * Ao criar um componente novo de visualização, registre-o aqui.
 */
import C from './C.astro';
import Explicacao from './camadas/Explicacao.astro';
import Dica from './camadas/Dica.astro';
import Resolucao from './camadas/Resolucao.astro';
import Pensamento from './camadas/Pensamento.astro';
import Erros from './camadas/Erros.astro';
import Curiosidade from './camadas/Curiosidade.astro';
import Juncao from './viz/Juncao.astro';
import Setas from './viz/Setas.astro';

export const componentesMDX = {
  C, Explicacao, Dica, Resolucao, Pensamento, Erros, Curiosidade, Juncao, Setas,
};
