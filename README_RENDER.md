# Como hospedar este projeto na Render

Este projeto foi ajustado para rodar na Render como um serviço **Node.js/Next.js standalone** com **Prisma** e **SQLite**. Antes, ele continha scripts do ambiente da Z.ai que não combinavam bem com o fluxo padrão da Render, principalmente por dependerem de empacotamento customizado, Caddy/Bun e caminhos de banco diferentes.

## Configuração recomendada na Render

Ao criar o serviço na Render, selecione **Web Service** e conecte o repositório deste projeto. Use as configurações abaixo.

| Campo na Render | Valor |
|---|---|
| Runtime | `Node` |
| Build Command | `npm install && npm run render:build` |
| Start Command | `npm run render:start` |
| Node Version | `22` |

## Variáveis de ambiente

Configure as seguintes variáveis em **Environment** na Render.

| Variável | Valor sugerido | Observação |
|---|---|---|
| `DATABASE_URL` | `file:./data/custom.db` | Funciona para publicar, mas o SQLite pode perder dados em reinícios/redeploys porque não há disco persistente. |
| `HUBPAGUE_TOKEN` | seu token real da HubPague | Necessário para a rota de pagamento Pix funcionar. |
| `NODE_VERSION` | `22` | Garante compatibilidade com Next.js/React usados no projeto. |

> Para produção real, o ideal é usar um **Disk persistente** na Render e mudar `DATABASE_URL` para `file:/var/data/custom.db`, com o disco montado em `/var/data`. Sem disco persistente, a aplicação sobe, mas cadastros e pagamentos salvos no SQLite podem ser perdidos quando a Render recriar a instância.

## Arquivos importantes adicionados ou ajustados

| Arquivo | O que foi ajustado |
|---|---|
| `package.json` | Foram adicionados os scripts `render:build`, `render:start`, `build:next` e a versão recomendada de Node.js. |
| `build.sh` | Agora define `DATABASE_URL` padrão, cria a pasta do SQLite, gera o Prisma Client, aplica o schema e compila o Next.js. |
| `start-render.sh` | Agora prepara o banco antes de iniciar e obriga o servidor a escutar em `0.0.0.0`, que é necessário na Render. |
| `render.yaml` | Blueprint opcional para facilitar deploy automático na Render. |
| `.env.example` | Atualizado com exemplos corretos para Render. |
| `.nvmrc` | Define Node.js 22. |

## Passo a passo simples

1. Suba este projeto corrigido para um repositório no GitHub.
2. Na Render, crie um **New Web Service** a partir desse repositório.
3. Preencha os comandos exatamente como indicado: `npm install && npm run render:build` no build e `npm run render:start` no start.
4. Em **Environment Variables**, cadastre `DATABASE_URL`, `HUBPAGUE_TOKEN` e `NODE_VERSION`.
5. Clique em **Deploy Web Service**.

## Teste local realizado

O projeto foi testado localmente com os comandos equivalentes aos da Render. O build Next.js foi concluído, o Prisma criou o banco SQLite e o endpoint `/api` respondeu corretamente com:

```json
{"status":"ok","service":"Economia Energy API"}
```

## Observação sobre SQLite

SQLite funciona para projetos pequenos, testes e MVPs. Porém, para uma aplicação comercial de pagamentos, recomendo trocar futuramente para PostgreSQL, porque ele é mais adequado para produção, persistência e concorrência. Essa troca exige alterar o `provider` do Prisma e fazer migração do schema.
