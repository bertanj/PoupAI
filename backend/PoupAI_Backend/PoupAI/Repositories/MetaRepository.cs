using Dapper;
using Api.Comum;
using Npgsql;

namespace PoupAI.Repositories
{
    public class MetaRepository
    {
        private readonly string _connectionString;
        public MetaRepository(string connectionString) => _connectionString = connectionString;

        public async Task<IEnumerable<Meta>> GetAll()
        {
            using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<Meta>("SELECT * FROM Meta ORDER BY Id DESC");
        }

        public async Task<IEnumerable<Meta>> GetByUsuario(int usuarioId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"SELECT * FROM Meta WHERE UsuarioId = @usuarioId ORDER BY Id DESC";
            return await conn.QueryAsync<Meta>(sql, new { usuarioId });
        }

        public async Task AddValue(Meta meta)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"
                INSERT INTO Meta (Descricao, ValorAlvo, ValorAtual, Data, atingida, UsuarioId)
                VALUES (@Descricao, @ValorAlvo, @ValorAtual, @Data, @atingida, @UsuarioId)";
            await conn.ExecuteAsync(sql, meta);
        }

        public async Task<int> Delete(int id)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"DELETE FROM Meta WHERE Id = @id";
            return await conn.ExecuteAsync(sql, new { id });
        }

        public async Task<Meta?> ApplyDelta(int id, decimal delta)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"
                UPDATE Meta
                   SET ValorAtual = GREATEST(0, LEAST(ValorAlvo, ValorAtual + @delta)),
                       atingida   = (ValorAtual + @delta) >= ValorAlvo
                 WHERE Id = @id
             RETURNING Id, Descricao, ValorAlvo, ValorAtual, Data, atingida, UsuarioId;";
            return await conn.QueryFirstOrDefaultAsync<Meta>(sql, new { id, delta });
        }
    }
}
