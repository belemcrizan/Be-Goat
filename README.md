# Nati Goat

A página da streamer **Nati Goat** usa o endereço **begoat**. Na capa, cada carta abre um destino. **K · Lives** reúne a próxima transmissão e os canais, **Q · Loja** abre a loja, **A · Agenda** mostra os dias e horários de Brasília e **J · Sobre** reúne o retrato, a carta Rei de Copas e os recados. Cada transmissão pode ser salva no calendário.

## Estúdio

Abra **Estúdio** (rota `/admin`) e entre com o usuário `admin` e a senha configurada na hospedagem. Na aba **Cartas**, cadastre um endereço HTTPS para substituir o destino de cada carta. Deixe o campo vazio para usar a página do próprio site. Enquanto o endereço da loja aguarda cadastro, a carta abre um aviso. O painel também permite editar a apresentação, ordenar e adicionar canais, programar lives e publicar recados. **Salvar alterações** publica uma nova revisão em D1. Horários ilustrativos podem ser marcados como exemplos e canais sem URL exibem **Em breve**.

A aplicação autentica o administrador por senha. A privacidade da prévia hospedada tem um controle adicional no provedor. O código do site também roda de forma independente em Workers com um banco D1.

## Rodar localmente

Requer Node.js 22.13 ou superior e npm.

~~~sh
npm ci
npm run admin:local
npm run build
npm run db:local
npm run dev
~~~

O configurador pede a senha sem eco e grava seu verificador em `.dev.vars`, ignorado pelo Git. O terminal informa o endereço do site. Para trocar a senha local, execute o configurador novamente e reinicie o servidor.

## Configuração de hospedagem

Use o vínculo D1 `DB`. As migrações estão em `drizzle/`. Para configurar ou trocar a senha do painel, execute `node scripts/admin-password.mjs --verifier` e salve o resultado como o segredo de runtime `BEGOAT_ADMIN_VERIFIER` no provedor. Em seguida, aplique a nova configuração. A troca desse valor invalida as sessões existentes. O repositório contém as fontes e suas licenças em `public/fonts/`.

## Verificar

~~~sh
npm run typecheck
npm run build
npm test
~~~

Os testes exercitam o Worker com um D1 descartável. Cobrem login, expiração e encerramento de sessão, edição, conflito entre abas, horários e exportação de calendário.
