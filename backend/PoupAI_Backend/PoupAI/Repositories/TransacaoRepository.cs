using Dapper;
using Npgsql;

namespace PoupAI.Repositories
{
    public class TransacaoRepository
    {
        private readonly string _connectionString;
        public TransacaoRepository(string connectionString) => _connectionString = connectionString;

        public async Task<IEnumerable<dynamic>> GetUltimasTransacoes(int usuarioId, int limit = 10, int offset = 0)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"
                SELECT Id, Descricao, Valor, Data, 'Receita'::text AS Tipo
                  FROM Receita
                 WHERE UsuarioId = @UsuarioId
                UNION ALL
                SELECT d.Id, d.Descricao, d.Valor, d.Data, c.Nome::text AS Tipo
                  FROM Despesa d
                  JOIN Categoria c ON d.CategoriaId = c.Id
                 WHERE d.usuarioId = @UsuarioId
                 ORDER BY Data DESC, Id DESC
                 LIMIT @Limit OFFSET @Offset";
            return await conn.QueryAsync(sql, new { UsuarioId = usuarioId, Limit = limit, Offset = offset });
        }
    }
}
