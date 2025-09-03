using Microsoft.AspNetCore.Mvc;
using PoupAI.Repositories;
using Api.Comum;

namespace PoupAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly UsuarioRepository _repo;

        public UsuarioController(UsuarioRepository repo) => _repo = repo;

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var usuario = await _repo.GetById(id);
            return usuario is null ? NotFound() : Ok(usuario);
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] Usuario usuario)
        {
            await _repo.AddValue(usuario);
            return Ok(usuario);
        }
    }
}
