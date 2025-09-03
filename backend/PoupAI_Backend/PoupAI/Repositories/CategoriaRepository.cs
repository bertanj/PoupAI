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
            var sql = "INSERT INTO Categoria (Nome) VALUES (@Nome)";
            await conn.ExecuteAsync(sql, categoria);
        }
    }
}
