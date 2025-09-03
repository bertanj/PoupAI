using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api.Comum
{
    [Table("Usuario")]
    public class Usuario
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; } = string.Empty;

        //relacao
        public ICollection<Receita> Receitas { get; set; } = new List<Receita>();
        public ICollection<Despesa> Despesas { get; set; } = new List<Despesa>();
        public ICollection<Meta> Metas { get; set; } = new List<Meta>();

    }
}
