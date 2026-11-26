# begoat

Página pessoal de uma streamer, em português. A foto e a carta Rei de Copas abrem a página. O público encontra os links, a agenda semanal no horário de Brasília e os recados publicados pela streamer.

## Editar a página

1. Abra **Área da streamer** e entre com a conta ChatGPT autorizada.
2. Em **Perfil**, **Links**, **Lives** ou **Recados**, faça as alterações e selecione **Salvar alterações**. Links e recados podem ser reordenados.
3. Use **Ver página** para conferir o resultado. Os dados ficam no servidor e são compartilhados entre os dispositivos.

A agenda inicial é ilustrativa. Cadastre a programação real e desmarque **Identificar a agenda como exemplo**. Cartões sem URL mostram **Em breve**. A seção de recados aparece quando houver um recado publicado.

## Acesso

O responsável pelo site entra com o e-mail de sua conta ChatGPT cadastrado na variável secreta de servidor **BEGOAT_OWNER_EMAIL**. Na aba **Acesso**, pode cadastrar, trocar ou remover o e-mail da streamer. A streamer edita o conteúdo. Somente o responsável administra essa autorização. Em uma prévia privada, o compartilhamento da hospedagem também precisa permitir que a streamer visite o site.

O Worker usa a identidade validada pelo gateway do ChatGPT Sites. Em outra hospedagem, é necessário integrar um provedor de identidade que valide a sessão e substitua os cabeçalhos de identidade recebidos da internet antes de encaminhar pedidos ao Worker. A versão de avaliação solicita aos buscadores que não indexem as páginas.

## Desenvolvimento local

Requer Node.js 22.13 ou superior e npm. Execute os comandos abaixo na raiz do projeto.

~~~sh
npm ci
npm run build
npm run db:local
npm run dev
~~~

O terminal informa o endereço local. No perfil portátil em loopback, o login de desenvolvimento usa a identidade de teste do starter. Para testar o painel, defina **BEGOAT_OWNER_EMAIL=seedy@sites.test** em **.dev.vars** antes de iniciar o servidor. O arquivo é ignorado pelo Git. A hospedagem usa a autenticação real do ChatGPT.

## Verificação

~~~sh
npm run typecheck
npm run build
npm test
~~~

Os testes usam um D1 descartável para verificar leitura pública, edição autorizada, revogação de acesso, validação de URLs e conflito entre dois salvamentos. As fontes são hospedadas no projeto, com suas licenças em **public/fonts**.

## Implementação

React, TypeScript e Vinext no Cloudflare Workers. O vínculo D1 **DB** persiste o conteúdo e a conta autorizada. As migrações ficam em **drizzle/**. A publicação verifica a versão lida pelo editor para impedir sobrescritas entre abas.
