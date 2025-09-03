using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api.Comum
{
    [Table("Meta")]
    public class Meta
    {
        public int Id { get; set; }
        public string? Descricao { get; set; }
        public decimal ValorAlvo { get; set; }
        public decimal ValorAtual { get; set; }
        public DateTime Data { get; set; }
        public bool atingida { get; set; }

        //relacao
        public int UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }
    }
}
