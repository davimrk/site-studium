# Studium

1. Use Node.js 18 ou mais recente e rode `npm ci`.
2. Copie `.env.example` para `.env` e preencha os dados do banco `SiteStudium`. Gere uma chave para `JWT_SECRET` com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Rode `npm start` e abra http://localhost:3000.
4. Rode `npm test` para testar as rotas com dados simulados.

Para um banco vazio, crie `SiteStudium` e aplique `sql/schema.sql`. Para o banco existente, a coluna `usuarios.perfil` precisa aceitar `admin`. Rode o `ALTER TABLE` antes de promover a conta com o `UPDATE`. O cadastro público aceita apenas aluno ou professor.

O formulário publica atividades e provas, os dois tipos aceitos na tabela `atividades`. Materiais, avisos e entregas usam tabelas próprias no banco existente.

O `.env` antigo foi removido da branch. Rotacione a chave JWT e a credencial do banco que estavam no histórico.
