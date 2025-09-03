using Dapper;
using Npgsql;

namespace PoupAI.Services
{
    public class SaldoService
    {
        private readonly string _connectionString;

        public SaldoService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<decimal> GetSaldoUsuarioAsync(int usuarioId)
        {
            using var conexao = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT 
                    COALESCE((SELECT SUM(r.Valor) FROM Receita r WHERE r.UsuarioId = @UsuarioId), 0)
                  - COALESCE((SELECT SUM(d.Valor) FROM Despesa d WHERE d.usuarioId = @UsuarioId), 0)
                AS Saldo;";

            return await conexao.ExecuteScalarAsync<decimal>(sql, new { UsuarioId = usuarioId });
        }
    }
}
