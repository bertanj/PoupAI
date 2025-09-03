using Microsoft.AspNetCore.Mvc;
using PoupAI.Repositories;
using Api.Comum;

namespace PoupAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetaController : ControllerBase
    {
        private readonly MetaRepository _repo;
        public MetaController(MetaRepository repo) { _repo = repo; }

        [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _repo.GetAll());

        [HttpGet("usuario/{usuarioId:int}")]
        public async Task<IActionResult> GetByUsuario(int usuarioId) =>
            Ok(await _repo.GetByUsuario(usuarioId));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Meta meta)
        {
            if (meta.ValorAlvo <= 0) return BadRequest("ValorAlvo deve ser > 0.");
            meta.ValorAtual = 0;
            meta.atingida = false;
            await _repo.AddValue(meta);
            return Ok(meta);
        }

        [HttpPatch("{id:int}/valor")]
        public async Task<IActionResult> ApplyDelta([FromRoute] int id, [FromQuery] decimal delta)
        {
            var updated = await _repo.ApplyDelta(id, delta);
            if (updated is null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var rows = await _repo.Delete(id);
            if (rows == 0) return NotFound();
            return NoContent();
        }
    }
}
