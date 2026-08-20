import type { Plugin } from 'vite';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * O plugin que deixa a página /revisar mexer nos arquivos de exercício.
 *
 * Ele existe porque a auditoria não pode ser "acha o arquivo certo entre mil na
 * pasta": com 300 exercícios, trocar um `false` por `true` no VS Code custa mais
 * tempo do que ler a resolução. Aqui o Victor lê o exercício renderizado, aprova
 * no botão e corrige o texto na própria página.
 *
 * Isto **não** é um backend. É middleware do servidor de desenvolvimento do
 * Vite, monta só quando o comando é `serve`, e some no `npm run build`: o site
 * publicado continua sendo HTML e JS estático, sem nada que escreva em disco.
 *
 * Por isso mesmo ele é rústico de propósito: escreve o arquivo inteiro, sem
 * histórico e sem trava. O histórico é o git, que é onde ele já mora.
 */

const DIR = 'content/exercicios';
/* id é nome de arquivo, então nada de barra, ponto-ponto ou acento: sem isso o
   ../../ do corpo de um POST escreveria em qualquer lugar da máquina */
const ID_OK = /^[a-z0-9-]+$/;

type Pedido = import('node:http').IncomingMessage;

const lerCorpo = (req: Pedido) =>
  new Promise<string>((ok, erro) => {
    let txt = '';
    req.on('data', (p) => {
      txt += p;
      if (txt.length > 512_000) erro(new Error('corpo grande demais'));
    });
    req.on('end', () => ok(txt));
    req.on('error', erro);
  });

export default function revisar(): Plugin {
  return {
    name: 'prevest-revisar',
    apply: 'serve',
    configureServer(servidor) {
      servidor.middlewares.use('/__revisar', async (req, res) => {
        const responder = (codigo: number, dados: unknown) => {
          res.statusCode = codigo;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(dados));
        };

        try {
          const url = new URL(req.url ?? '/', 'http://x');
          const id = url.searchParams.get('id') ?? '';

          if (req.method === 'GET' && url.pathname === '/lista') {
            const nomes = await readdir(DIR);
            const ids = nomes.filter((n) => n.endsWith('.mdx')).map((n) => n.replace(/\.mdx$/, ''));
            return responder(200, { ids });
          }

          if (!ID_OK.test(id)) return responder(400, { erro: 'id inválido' });
          const arquivo = join(DIR, `${id}.mdx`);

          if (req.method === 'GET') {
            return responder(200, { id, texto: await readFile(arquivo, 'utf8') });
          }

          if (req.method === 'POST') {
            const corpo = JSON.parse(await lerCorpo(req)) as {
              texto?: string;
              verificado?: boolean;
            };

            let texto = corpo.texto ?? (await readFile(arquivo, 'utf8'));

            /* aprovar é reescrever uma linha do frontmatter, e não o arquivo
               inteiro: assim o botão continua funcionando se o campo mudar de
               lugar, e não some se o Victor tiver escrito algo depois dele */
            if (corpo.verificado !== undefined) {
              const linha = `verificado: ${corpo.verificado}`;
              texto = /^verificado:.*$/m.test(texto)
                ? texto.replace(/^verificado:.*$/m, linha)
                : texto.replace(/^---\n/, `---\n${linha}\n`);
            }

            await writeFile(arquivo, texto, 'utf8');
            return responder(200, { id, texto });
          }

          return responder(405, { erro: 'método não aceito' });
        } catch (e) {
          return responder(500, { erro: (e as Error).message });
        }
      });
    },
  };
}
