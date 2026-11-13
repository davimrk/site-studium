# Studium

## Executar localmente

1. Use Node.js 18 ou mais recente e execute `npm ci`.
2. Crie um banco MySQL vazio e aplique `sql/schema.sql` nele. O arquivo inicializa tabelas novas.
3. Copie `.env.example` para `.env`. Configure o banco e gere uma chave JWT exclusiva com `openssl rand -hex 32`.
4. Execute `npm start` e abra `http://localhost:3000` ou a porta configurada. Em produção, configure HTTPS para o cookie de sessão.
5. Execute `npm test` para testar as rotas HTTP com uma camada de dados simulada.

Para usar o login administrativo da página inicial, conceda `usuarios.admin = 1` a uma conta existente por meio do MySQL, com acesso administrativo ao banco. O perfil escolar continua em `usuarios.perfil`. O cadastro público aceita apenas aluno e professor.

### Banco existente

O commit base não inclui um dump ou migrações. Antes de apontar o servidor para um banco existente, compare o resultado de `SHOW CREATE TABLE` de cada tabela com `sql/schema.sql`. Confira principalmente `usuarios.admin`, `turmas.professor_id`, a unicidade de email, nome de disciplina, código e matrícula, os valores de `atividades.tipo` e a possibilidade de deixar `data_entrega` nula. Se faltar o vínculo do professor, recupere os responsáveis pelas turmas antes de preencher a coluna e impor a restrição. As instruções `CREATE TABLE IF NOT EXISTS` preservam tabelas já criadas e exigem que a migração do esquema existente seja feita à parte.

## Diagnóstico da base `35d61fc`

| Problema | Correção |
| --- | --- |
| O login administrativo verificava o campo `admin`, enquanto as rotas e o navegador esperavam `perfil = admin`. | O servidor consulta o indicador atual no banco a cada requisição protegida e mantém o perfil escolar. |
| A sessão expirada podia gerar erro 500 nas rotas do aluno. | As rotas autenticadas usam a mesma verificação de sessão e retornam 401 para JWT inválido ou expirado. |
| Dois scripts declaravam `form` e `modo` na home. Alguns scripts também referenciavam rotas Express no navegador ou arquivos ausentes. | O formulário da home usa `modal.js`. Os scripts obsoletos e referências inválidas foram removidos. |
| O painel simulava turmas e atividades em memória. A rota usava variáveis indefinidas e não respondia em caso de sucesso. | O painel consulta e grava pelo Express. A publicação valida o formulário e grava apenas em turma vinculada ao professor autenticado. |
| O Git rastreava o `.env`, com configurações de banco e autenticação. | A branch passa a rastrear somente `.env.example`. Os valores antigos continuam no histórico. Rotacione a credencial do banco e a chave JWT que estavam no arquivo. |

A integração com o esquema MySQL existente ficou pendente. O teste HTTP cobre login, logout, expiração, revogação de acesso administrativo, criação de turma, publicação e leitura por aluno matriculado. A camada de dados simulada permite verificar as rotas sem usar credenciais do projeto.
