using Api.Comum;
using Dapper;
using Npgsql;

namespace PoupAI.Repositories
{
    public class UsuarioRepository
    {
        private readonly string _connectionString;
        public UsuarioRepository(string connectionString) => _connectionString = connectionString;

        public async Task<Usuario?> GetById(int id)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryFirstOrDefaultAsync<Usuario>(
                "SELECT * FROM Usuario WHERE Id = @Id", new { Id = id });
        }

        public async Task AddValue(Usuario usuario)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"INSERT INTO Usuario (Nome, Email, Senha)
                        VALUES (@Nome, @Email, @Senha)";
            await conn.ExecuteAsync(sql, usuario);
        }
    }
}
