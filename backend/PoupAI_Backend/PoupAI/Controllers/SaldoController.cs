using Microsoft.AspNetCore.Mvc;
using PoupAI.Services;

namespace PoupAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SaldoController : ControllerBase
    {
        private readonly SaldoService _service;

        public SaldoController(SaldoService service)
        {
            _service = service;
        }

        [HttpGet("{usuarioId:int}")]
        public async Task<IActionResult> Get(int usuarioId)
        {
            var saldo = await _service.GetSaldoUsuarioAsync(usuarioId);
            return Ok(new { usuarioId, saldo });
        }
    }
}
