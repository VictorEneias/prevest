import { Link } from 'react-router-dom';
import { conceitos } from '../conteudo';
import { useTitulo } from '../estado';

/**
 * A conversa inteira do Victor com o aluno.
 *
 * Este texto abria a home e não cabia lá sem espremer o grafo: a abertura ficou
 * com o resumo dele e o original inteiro veio pra cá.
 */
export default function Sobre() {
  useTitulo('Sobre');
  const topicos = conceitos.reduce((s, c) => s + c.topicos.length, 0);

  return (
    <div className="simples">
      <p className="aula-etiqueta">sobre</p>
      <h1>Por que este site existe</h1>

      <p>
        Até aqui você se virou com todas as suas técnicas e artimanhas para se livrar de conceitos
        que de primeira pareciam difíceis de lidar. E <b>elas funcionaram</b>!! Porém… o nível
        subiu, e essas técnicas que serviram de muleta pra você esse tempo todo na verdade te
        fizeram esquecer como anda. Agora chegou a hora de dar esse passo pra trás. Olhar para esses
        conceitos, dessa vez explicados de maneira mais simples e intuitiva, e realmente aprender a
        matemática. Com isso, <b>eu te prometo</b> que aos poucos, aquela matéria que você tinha
        certeza que não era pra você, e que você simplesmente era ruim nela (o que muitas vezes pode
        ter feito você criar aversões ou até ódio à matemática), vai acabar se tornando aos poucos
        cada vez mais suportável e, quem sabe, pode até virar algo que você goste.
      </p>

      <p>
        Sei que parece uma realidade muito distante, mas não é! Aqui você vai aprender matemática,
        dessa vez de verdade, e entender a linguagem que a natureza fala com a gente.
      </p>

      <p>
        Por último, você, aluno que já está no ensino médio, talvez esteja pensando que tudo isso
        não valha a pena: <i>"pra que eu vou voltar lá do início da matemática, já estou tão
        longe"</i>. Você não terá que ir tão longe para começar a ver os efeitos que realmente
        reaprender os básicos, ou até mesmo as matérias que você está vendo agora (só que dessa vez
        de verdade), fazem nas coisas que você será capaz de fazer em pouco tempo. Dê essa chance a
        si mesmo, você não irá se arrepender.
      </p>

      <hr className="regua" />

      <h2>Como o curso está organizado</h2>

      <p>
        Isto aqui é uma apostila: você lê sozinho, no seu tempo, quantas vezes precisar. O que ela
        tem de diferente é o tamanho da explicação, porque em vez de te entregar a regra pronta ela
        para pra dizer de onde a regra veio, e as figuras daqui você mexe com a mão pra ver o que
        muda.
      </p>

      <p>
        São <b>{conceitos.length} aulas</b> e <b>{topicos} tópicos</b>. Cada aula é um conceito, e a
        ordem entre elas é de dependência: uma aula aponta para as que você precisa ter visto antes,
        e é isso que o mapa desenha. Quanto mais embaixo no mapa, mais coisa você atravessa pra
        chegar ali.
      </p>

      <p>
        <b>Nada está bloqueado.</b> Se você já sabe o nome do que está travando, o{' '}
        <Link to="/indice">índice de assuntos</Link> leva direto na aula que cobre — ele lista o que
        cada aula tem por dentro, e não só os títulos, porque quem chega com "distância de ponto a
        reta" na cabeça não sabe que isso mora numa aula chamada "A reta no plano".
      </p>

      <p>
        A página de cada aula tem dois modos, e o seu é o <b>Estudo</b>, que mostra tudo. O outro,
        o <b>Aula</b>, esconde a prosa e deixa só os títulos, as fórmulas e as figuras: ele é pra
        quem está com a página projetada explicando pra alguém, e serve de esqueleto enquanto a
        explicação vem falada. Os dois trocam no menu do canto, ou no Alt+1 e Alt+2.
      </p>

      <Link className="simples-volta" to="/">
        <span aria-hidden="true">←</span> Voltar pro mapa
      </Link>
    </div>
  );
}
