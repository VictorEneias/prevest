import { conceitos, exercicios } from '../conteudo';
import MapaConceitos from '../components/viz/MapaConceitos';

export default function Home() {
  const revisados = conceitos.filter((c) => c.revisado).length;

  return (
    <div className="folha folha-larga">
      <h1 style={{ fontSize: '2.2rem', marginBottom: 'calc(var(--u)*0.25)' }}>Pré-vestibular</h1>
      <p style={{ color: 'var(--tinta-media)', maxWidth: '62ch', marginBottom: 'var(--u)' }}>
        Cada caixa é um módulo e cada seta é um pré-requisito, apontando do que vem antes pro que
        vem depois. Quanto mais embaixo, mais coisa você precisa ter atravessado pra chegar ali — a
        ordem é de dependência, não de ano escolar. Passe o mouse num módulo pra acender a cadeia
        inteira que sustenta ele. <b>Nada aqui está bloqueado</b>: você pode abrir qualquer página
        quando quiser.
      </p>

      <MapaConceitos controles altura="66vh" />

      <div className="ficha" style={{ marginTop: 'var(--u)' }}>
        <span>
          <b>{conceitos.length}</b> conceitos
        </span>
        <span>
          <b>{revisados}</b> revisados
        </span>
        <span>
          <b>{exercicios.length}</b> exercícios
        </span>
      </div>
    </div>
  );
}
