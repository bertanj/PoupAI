using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api.Comum
{
    [Table("Despesa")]
    public class Despesa
    {
        public int Id { get; set; }
        public string? Descricao { get; set; }
        public decimal Valor { get; set; }
        public DateTime Data { get; set; }
        public string? Categoria { get; set; }

        //relacao
        public int usuarioId { get; set; }
        public Usuario Usuario { get; set; }

        public int categoriaId { get; set; }
        public Categoria CategoriaNav { get; set; }
    }
}
