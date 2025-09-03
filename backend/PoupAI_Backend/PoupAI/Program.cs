using PoupAI.Repositories;
using PoupAI.Services;

namespace PoupAI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins(
                            "http://192.168.1.8:5177",   
                            "exp://192.168.1.8:8081",    
                            "http://localhost:5177",     
                            "http://127.0.0.1:5177",     
                            "http://localhost:8081",     
                            "http://127.0.0.1:8081"      
                        )
                        .AllowAnyHeader()            
                        .AllowAnyMethod());           
            });

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddScoped<UsuarioRepository>(_ => new UsuarioRepository(connectionString));
            builder.Services.AddScoped<ReceitaRepository>(_ => new ReceitaRepository(connectionString));
            builder.Services.AddScoped<DespesaRepository>(_ => new DespesaRepository(connectionString));
            builder.Services.AddScoped<CategoriaRepository>(_ => new CategoriaRepository(connectionString));
            builder.Services.AddScoped<MetaRepository>(_ => new MetaRepository(connectionString));
            builder.Services.AddScoped<DashboardRepository>(_ => new DashboardRepository(connectionString));
            builder.Services.AddScoped<TransacaoRepository>(_ => new TransacaoRepository(connectionString));
            builder.Services.AddScoped<SaldoService>(_ => new SaldoService(connectionString));

            var app = builder.Build();

            app.UseSwagger();
            app.UseSwaggerUI();

  

            app.UseCors("AllowFrontend");

            app.UseAuthorization();
            app.MapControllers();

            app.Urls.Add("http://0.0.0.0:5177");

            app.Run();
        }
    }
}
