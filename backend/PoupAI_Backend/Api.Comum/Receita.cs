using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api.Comum
{
    [Table("Receita")]
    public class Receita
    {
        public int Id { get; set; }
        public string? Descricao { get; set; }
        public decimal Valor { get; set; }
        public DateTime Data { get; set; }

        //relacao
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; }
    }
}
