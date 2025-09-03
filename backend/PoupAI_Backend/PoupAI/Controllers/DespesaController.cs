using Microsoft.AspNetCore.Mvc;
using PoupAI.Repositories;
using Api.Comum;

namespace PoupAI.Controllers
{
    public record DespesaCreateDto(string? Descricao, decimal Valor, DateTime Data, int UsuarioId, int CategoriaId);
    public record DespesaUpdateDto(string? Descricao, decimal Valor, DateTime Data, int CategoriaId);

    [ApiController]
    [Route("api/[controller]")]
    public class DespesaController : ControllerBase
    {
        private readonly DespesaRepository _repo;

        public DespesaController(DespesaRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAll());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var despesa = await _repo.GetById(id);
            return despesa is null ? NotFound() : Ok(despesa);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DespesaCreateDto dto)
        {
            var despesa = new Despesa
            {
                Descricao = dto.Descricao,
                Valor = dto.Valor,
                Data = dto.Data,
                usuarioId = dto.UsuarioId,
                categoriaId = dto.CategoriaId
            };

            await _repo.AddValue(despesa);
            return CreatedAtAction(nameof(GetById), new { id = despesa.Id }, despesa);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] DespesaUpdateDto dto)
        {
            var atual = await _repo.GetById(id);
            if (atual is null) return NotFound();

            atual.Descricao = dto.Descricao;
            atual.Valor = dto.Valor;
            atual.Data = dto.Data;
            atual.categoriaId = dto.CategoriaId;

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
