using Microsoft.AspNetCore.Mvc;
using PoupAI.Repositories;

namespace PoupAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransacaoController : ControllerBase
    {
        private readonly TransacaoRepository _repo;
        public TransacaoController(TransacaoRepository repo) => _repo = repo;

        // GET /api/Transacao/ultimas/usuario/1?limit=10&offset=0
        [HttpGet("ultimas/usuario/{usuarioId:int}")]
        public async Task<IActionResult> GetUltimas(int usuarioId, [FromQuery] int limit = 10, [FromQuery] int offset = 0)
        {
            var lista = await _repo.GetUltimasTransacoes(usuarioId, limit, offset);
            return Ok(lista);
        }
    }
}
