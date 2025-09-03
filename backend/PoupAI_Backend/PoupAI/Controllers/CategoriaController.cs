using Microsoft.AspNetCore.Mvc;
using PoupAI.Repositories;
using Api.Comum;
using System.Threading.Tasks;

namespace PoupAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriaController : ControllerBase
    {
        private readonly CategoriaRepository _repo;

        public CategoriaController(CategoriaRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _repo.GetAll());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Categoria categoria)
        {
            await _repo.AddValue(categoria);
            return Ok(categoria);
        }
    }
}
