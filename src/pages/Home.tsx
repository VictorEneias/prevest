import { Link } from 'react-router-dom';
import { conceitos, exercicios } from '../conteudo';
import { useTitulo } from '../estado';
import MapaConceitos from '../components/viz/MapaConceitos';

export default function Home() {
  useTitulo();
  /* A raiz do grafo é a porta de entrada. Sem ela em algum lugar com nome, quem
     abre a home fica olhando 70 caixas sem saber por qual começar. */
  const comeco = conceitos.find((c) => c.prereqs.length === 0);

  return (
    <div className="folha folha-larga">
      <h1 style={{ fontSize: '2.2rem', marginBottom: 'calc(var(--u)*0.75)' }}>Pré-vestibular</h1>

      <div className="abertura">
        <p>
          Até aqui você se virou com todas as suas técnicas e artimanhas para se livrar de
          conceitos que de primeira pareciam difíceis de lidar. E <b>elas funcionaram</b>!! Porém…
          o nível subiu, e essas técnicas que serviram de muleta pra você esse tempo todo na
          verdade te fizeram esquecer como anda. Agora chegou a hora de dar esse passo pra trás.
          Olhar para esses conceitos, dessa vez explicados de maneira mais simples e intuitiva, e
          realmente aprender a matemática. Com isso, <b>eu te prometo</b> que aos poucos, aquela
          matéria que você tinha certeza que não era pra você, e que você simplesmente era ruim
          nela (o que muitas vezes pode ter feito você criar aversões ou até ódio à matemática),
          vai acabar se tornando aos poucos cada vez mais suportável e, quem sabe, pode até virar
          algo que você goste.
        </p>

        <p>
          Sei que parece uma realidade muito distante, mas não é! Aqui você vai aprender
          matemática, dessa vez de verdade, e entender a linguagem que a natureza fala com a
          gente.
        </p>

        <p>
          Por último, você, aluno que já está no ensino médio, talvez esteja pensando que tudo
          isso não valha a pena: <i>"pra que eu vou voltar lá do início da matemática, já estou
          tão longe"</i>. Você não terá que ir tão longe para começar a ver os efeitos que
          realmente reaprender os básicos, ou até mesmo as matérias que você está vendo agora (só
          que dessa vez de verdade), fazem nas coisas que você será capaz de fazer em pouco tempo.
          Dê essa chance a si mesmo, você não irá se arrepender.
        </p>
      </div>

      {comeco && (
        <p className="comecar">
          <Link to={`/conceitos/${comeco.id}`}>
            Começar por {comeco.titulo} <span aria-hidden="true">→</span>
          </Link>
          {comeco.resumo && <span>{comeco.resumo}</span>}
        </p>
      )}

      <p className="nota-secao" style={{ maxWidth: '62ch' }}>
        Cada caixa é um módulo e cada seta é um pré-requisito. Quanto mais embaixo, mais coisa
        você atravessa pra chegar ali, porque a ordem é de dependência. Passe o mouse num módulo
        pra acender a cadeia que sustenta ele, arraste pra andar pelo mapa e role pra aproximar.
        <b> Nada aqui está bloqueado.</b>
      </p>

      <MapaConceitos controles altura="66vh" />

      <div className="ficha" style={{ marginTop: 'var(--u)' }}>
        <span>
          <b>{conceitos.length}</b> módulos
        </span>
        <span>
          <b>{exercicios.length}</b> exercícios
        </span>
      </div>
    </div>
  );
}
