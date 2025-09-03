using Dapper;
using Api.Comum;
using Npgsql;

namespace PoupAI.Repositories
{
    public class DespesaRepository
    {
        private readonly string _connectionString;
        public DespesaRepository(string connectionString) => _connectionString = connectionString;

        public async Task<IEnumerable<Despesa>> GetAll()
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"
                SELECT d.Id, d.Descricao, d.Valor, d.Data, d.usuarioId as UsuarioId, d.categoriaId as CategoriaId
                FROM Despesa d
                ORDER BY d.Data DESC, d.Id DESC";
            return await conn.QueryAsync<Despesa>(sql);
        }

        public async Task<Despesa?> GetById(int id)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<Despesa>(
                "SELECT * FROM Despesa WHERE Id = @Id", new { Id = id });
        }

        public async Task AddValue(Despesa despesa)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"INSERT INTO Despesa (Descricao, Valor, Data, usuarioId, categoriaId)
                        VALUES (@Descricao, @Valor, @Data, @usuarioId, @categoriaId)
                        RETURNING Id";
            despesa.Id = await conn.ExecuteScalarAsync<int>(sql, despesa);
        }

        public async Task UpdateValue(Despesa despesa)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"UPDATE Despesa 
                        SET Descricao = @Descricao, Valor = @Valor, Data = @Data, categoriaId = @categoriaId
                        WHERE Id = @Id";
            await conn.ExecuteAsync(sql, despesa);
        }

        public async Task DeleteValue(int id)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync("DELETE FROM Despesa WHERE Id = @Id", new { Id = id });
        }
    }
}
