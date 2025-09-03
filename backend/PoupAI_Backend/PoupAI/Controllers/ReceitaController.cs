using Microsoft.AspNetCore.Mvc;
using PoupAI.Repositories;
using Api.Comum;

namespace PoupAI.Controllers
{
    public record ReceitaCreateDto(string? Descricao, decimal Valor, DateTime Data, int UsuarioId);
    public record ReceitaUpdateDto(string? Descricao, decimal Valor, DateTime Data);

    [ApiController]
    [Route("api/[controller]")]
    public class ReceitaController : ControllerBase
    {
        private readonly ReceitaRepository _repo;

        public ReceitaController(ReceitaRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAll());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var receita = await _repo.GetById(id);
            return receita is null ? NotFound() : Ok(receita);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReceitaCreateDto dto)
        {
            var receita = new Receita
            {
                Descricao = dto.Descricao,
                Valor = dto.Valor,
                Data = dto.Data,
                UsuarioId = dto.UsuarioId
            };

            await _repo.AddValue(receita);
            return CreatedAtAction(nameof(GetById), new { id = receita.Id }, receita);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReceitaUpdateDto dto)
        {
            var atual = await _repo.GetById(id);
            if (atual is null) return NotFound();

            atual.Descricao = dto.Descricao;
            atual.Valor = dto.Valor;
            atual.Data = dto.Data;

            await _repo.UpdateValue(atual);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteValue(id);
            return NoContent();
        }
    }
}
