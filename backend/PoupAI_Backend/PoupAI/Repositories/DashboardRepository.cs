using Dapper;
using Npgsql;

namespace PoupAI.Repositories
{
    public class DashboardRepository
    {
        private readonly string _connectionString;
        public DashboardRepository(string connectionString) => _connectionString = connectionString;

        public async Task<dynamic> GetResumoMensal(int ano, int mes, int usuarioId)
        {
            using var conn = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT 
                  COALESCE(r.total, 0) AS totalreceitas,
                  COALESCE(d.total, 0) AS totaldespesas,
                  COALESCE(r.total, 0) - COALESCE(d.total, 0) AS saldo
                FROM
                  (SELECT SUM(Valor) AS total
                     FROM Receita
                    WHERE date_part('year', Data)  = @Ano
                      AND date_part('month', Data) = @Mes
                      AND UsuarioId                = @UsuarioId) r,
                  (SELECT SUM(Valor) AS total
                     FROM Despesa
                    WHERE date_part('year', Data)  = @Ano
                      AND date_part('month', Data) = @Mes
                      AND usuarioId                = @UsuarioId) d;";

            return await conn.QueryFirstAsync(sql, new { Ano = ano, Mes = mes, UsuarioId = usuarioId });
        }

        public async Task<IEnumerable<dynamic>> GetGastosPorCategoria(int ano, int mes, int usuarioId)
        {
            using var conn = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT c.Nome AS Categoria, SUM(d.Valor) AS Total
                  FROM Despesa d
                  JOIN Categoria c ON d.CategoriaId = c.Id
                 WHERE date_part('year', d.Data)  = @Ano
                   AND date_part('month', d.Data) = @Mes
                   AND d.usuarioId                = @UsuarioId
                 GROUP BY c.Nome
                 ORDER BY Total DESC;";

            return await conn.QueryAsync(sql, new { Ano = ano, Mes = mes, UsuarioId = usuarioId });
        }
    }
}
