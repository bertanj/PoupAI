# PoupAI Backend — Pacote de Correções (Patch)

Este pacote contém **arquivos corrigidos** para o seu backend (.NET + Dapper + PostgreSQL).
Substitua os arquivos correspondentes no seu projeto e siga o passo a passo abaixo.

## O que foi ajustado
- Uso correto de **PostgreSQL** (`LIMIT/OFFSET`, `date_part`).
- Remoção de trechos `...` que impediam a compilação.
- Correção de inserção de usuário (`Senha` em vez de `SenhaHash`).
- `Program.cs` com **CORS** e **Swagger** ligados para testes.
- Repositórios e Controllers com **CRUD** prontos.

## Como aplicar
1. Faça backup do seu projeto atual.
2. Copie o conteúdo das pastas deste patch para o seu projeto, respeitando as pastas:
   - `Controllers/`
   - `Repositories/`
   - `Program.cs`
3. Ajuste a connection string em `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=poupai;Username=postgres;Password=root"
     }
   }
   ```
4. Crie o banco e as tabelas executando `Sql/database.sql` no seu PostgreSQL.
5. Rode o projeto:
   ```bash
   dotnet run
   ```
6. Teste no Swagger: `http://localhost:<porta>/swagger`

## Testes rápidos (ordem sugerida)
1. `POST /api/Usuario` (crie um usuário).
2. `POST /api/Categoria` (crie categorias).
3. `POST /api/Receita` e `POST /api/Despesa` (crie lançamentos).
4. `GET /api/Dashboard/resumo/{ano}/{mes}`.
5. `GET /api/Transacao/ultimas`.

> Se tiver problema com HTTPS em dev, **comente** `app.UseHttpsRedirection()` em `Program.cs` ou rode `dotnet dev-certs https --trust`.

Boa sorte e qualquer coisa me chame para revisar o **frontend React** e as chamadas! 🚀
