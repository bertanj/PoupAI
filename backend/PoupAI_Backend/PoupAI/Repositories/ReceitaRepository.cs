using Dapper;
using Api.Comum;
using Npgsql;

namespace PoupAI.Repositories
{
    public class ReceitaRepository
    {
        private readonly string _connectionString;
        public ReceitaRepository(string connectionString) => _connectionString = connectionString;

        public async Task<IEnumerable<Receita>> GetAll()
        {
            using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<Receita>("SELECT * FROM Receita ORDER BY Data DESC, Id DESC");
        }

        public async Task<Receita?> GetById(int id)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<Receita>(
                "SELECT * FROM Receita WHERE Id = @Id", new { Id = id });
        }

        public async Task AddValue(Receita receita)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"INSERT INTO Receita (Descricao, Valor, Data, UsuarioId)
                        VALUES (@Descricao, @Valor, @Data, @UsuarioId)
                        RETURNING Id";
            receita.Id = await conn.ExecuteScalarAsync<int>(sql, receita);
        }

        public async Task UpdateValue(Receita receita)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"UPDATE Receita 
                        SET Descricao = @Descricao, Valor = @Valor, Data = @Data 
                        WHERE Id = @Id";
            await conn.ExecuteAsync(sql, receita);
        }

        public async Task DeleteValue(int id)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync("DELETE FROM Receita WHERE Id = @Id", new { Id = id });
        }
    }
}
