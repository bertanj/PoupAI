using Microsoft.AspNetCore.Mvc;
using PoupAI.Repositories;

namespace PoupAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardRepository _repo;
        public DashboardController(DashboardRepository repo) => _repo = repo;

        // GET /api/Dashboard/resumo/2025/8/usuario/1
        [HttpGet("resumo/{ano:int}/{mes:int}/usuario/{usuarioId:int}")]
        public async Task<IActionResult> GetResumo(int ano, int mes, int usuarioId)
        {
            var dados = await _repo.GetResumoMensal(ano, mes, usuarioId);
            return Ok(dados);
        }

        // GET /api/Dashboard/gastosPorCategoria/2025/8/usuario/1
        [HttpGet("gastosPorCategoria/{ano:int}/{mes:int}/usuario/{usuarioId:int}")]
        public async Task<IActionResult> GetGastosPorCategoria(int ano, int mes, int usuarioId)
        {
            var lista = await _repo.GetGastosPorCategoria(ano, mes, usuarioId);
            return Ok(lista);
        }
    }
}
