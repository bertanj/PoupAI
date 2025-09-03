using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api.Comum
{
    [Table("Categoria")]
    public class Categoria
    {
        private int id;
        private string? nome;

        public int Id { get => id; set => id = value; }
        public string? Nome { get => nome; set => nome = value; }

        //relacao
        public ICollection<Despesa> Despesas { get; set; } = new List<Despesa>();
    }
}
