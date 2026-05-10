using Dapper;
using Api.Comum;
using System.Collections.Generic;
using Npgsql;
using System.Threading.Tasks;

namespace PoupAI.Repositories
{
    public class CategoriaRepository
    {
        private readonly string _connectionString;
        public CategoriaRepository(string connectionString) => _connectionString = connectionString;

        public async Task<IEnumerable<Categoria>> GetAll()
        {
            using var conn = new NpgsqlConnection(_connectionString);
            return await conn.QueryAsync<Categoria>("SELECT * FROM Categoria");
        }

        public async Task AddValue(Categoria categoria)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = "INSERT INTO Categoria (Nome) VALUES (@Nome) RETURNING Id";
            categoria.Id = await conn.ExecuteScalarAsync<int>(sql, categoria);
        }

        public async Task Update(Categoria categoria)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync("UPDATE Categoria SET Nome=@Nome WHERE Id=@Id", categoria);
        }

        public async Task Delete(int id)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            await conn.ExecuteAsync("DELETE FROM Categoria WHERE Id=@Id", new { Id = id });
        }
    }
}
