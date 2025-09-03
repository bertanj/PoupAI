PoupAI

App de finanças pessoais para gerenciar gastos, receitas e metas, com frontend em Expo React Native e backend em ASP.NET Core + Dapper + PostgreSQL.

✨ Objetivo

Registrar receitas e despesas 

Visualizar transações recentes, filtrar por entradas/saídas e agrupar por dia.

Tela Home com resumo mensal (entradas, saídas, saldo) e gastos por categoria.

Tela Metas para criar metas, adicionar/remover valor (entrada/saída na meta), ver progresso (%) e quanto falta.

Tudo persistido no backend.

📦 Tech Stack

Frontend

Expo (React Native)

Expo Router

@tanstack/react-query

react-native-chart-kit

Axios

Backend

ASP.NET Core Web API

Dapper

Npgsql (PostgreSQL)

Banco de Dados

PostgreSQL

🗂️ Estrutura (resumo)
/poupai
  ├─ app_expo_poupai/                 # App Expo
  │   ├─ app/                  # Telas (login, register, home, transactions, goals)
  │   └─ src/
  │       └─lib/
  │           ├─ api.ts        # Axios baseURL
  │       └─ services/
  │           ├─ dashboard.ts  # Resumo / Gastos por categoria
  │           ├─ despesa.ts   # Despesas (get/create/alterar/remover)
  │           ├─ meta.ts      # Metas (get/create/alterar/remover)
  │           └─ transacao.ts  # Últimas transações
  └─ backend/
      └─ PoupAi_Backend/       # API ASP.NET Core
          ├─Api.Comum
            ├─ Categoria.cs
            └─ Despesa.cs
            └─ Meta.cs
            └─ Receita.cs
            └─ Usuario.cs
          ├─PoupAi  
            ├─ Controllers/
            │   ├─ CategoriaController.cs
            │   └─ DashboardController.cs 
            │   └─ DespesardController.cs 
            │   └─ MetaController.cs
            │   └─ ReceitaController.cs 
            │   └─ SaldoController.cs 
            │   └─ TransacaoController.cs 
            │   └─ UsuarioController.cs 
            ├─ Repositories/
            │   └─ CategoriaRepository.cs
            │   └─ DashboardRepository.cs
            │   └─ DespesaRepository.cs
            │   └─ MetaRepository.cs
            │   └─ ReceitaRepository.cs
            │   └─ TransacaoRepository.cs
            │   └─ UsuarioRepository.cs
            ├─ Services/
              └─ SaldoService.cs
            ├─ appsettings.json
            └─ Program.cs


⚙️ Pré-requisitos

Node.js LTS (18+)

Expo CLI

.NET 8 SDK

PostgreSQL rodando e acessível

Dispositivo físico na mesma rede do backend ou emulador configurado

🛢️ Banco de Dados

Crie o banco e a tabela Meta (ajuste nomes conforme suas colunas). Exemplo mínimo:

CREATE TABLE meta (
  id SERIAL PRIMARY KEY,
  descricao TEXT NOT NULL,
  valoralvo NUMERIC(14,2) NOT NULL,
  valoratual NUMERIC(14,2) NOT NULL DEFAULT 0,
  data DATE NOT NULL,
  atingida BOOLEAN NOT NULL DEFAULT FALSE,
  usuarioid INT NOT NULL
);

Coloque sua connection string no appsettings.Development.json do backend, por exemplo:

{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=poupai;Username=postgres;Password=SUASENHA"
  }
}

🚀 Subir o Backend

Na pasta do backend:

cd backend/PoupAi_Backend/PoupAI
dotnet restore
dotnet run


A API deve subir em algo como: http://localhost:5177 (ou outra porta).

Se for testar do celular, use o IP da máquina (ex.: http://192.168.1.8:5177).

CORS: se precisar, habilite no Program.cs para permitir chamadas do app no dispositivo.

📱 Subir o Frontend (Expo)

Configure o baseURL do Axios em frontend/src/services/api.ts:

import axios from "axios";

// use o IP da sua máquina na rede local:
export const api = axios.create({
  baseURL: "http://IP:5177",
  timeout: 10000,
});

export default api;


Instale e rode:

cd frontend
npm install
npx expo start


Leia o QR Code com o Expo Go (Android/iOS) ou rode no emulador.

O celular precisa estar na mesma rede que o backend.

🔀 Rotas da API
Metas

Listar metas por usuário
GET /api/Meta/usuario/{usuarioId}

Criar meta (usando o seu model diretamente)
POST /api/Meta
Body:

{
  "descricao": "Nova viagem",
  "valorAlvo": 3000,
  "valorAtual": 0,
  "data": "2025-12-01",
  "atingida": false,
  "usuarioId": 1
}


Adicionar/Remover valor (delta > 0 adiciona; delta < 0 remove)
PATCH /api/Meta/{id}/valor?delta=150.75

Remover meta
DELETE /api/Meta/{id}

Dashboard (exemplos que você já usa)

Resumo mensal
GET /api/Dashboard/resumo/{ano}/{mes}/usuario/{usuarioId}
Ex.: /api/Dashboard/resumo/2025/8/usuario/1
Resposta:

{
  "totalreceitas": 20000.00,
  "totaldespesas": 520.75,
  "saldo": 19479.25
}


Gastos por categoria (mês)
GET /api/Dashboard/gastosPorCategoria/{ano}/{mes}/usuario/{usuarioId}
Ex.: /api/Dashboard/gastosPorCategoria/2025/8/usuario/1
Resposta:

[
  { "categoria": "Alimentação", "total": 320.75 },
  { "categoria": "Transporte",  "total": 200.00 }
]

Transações (ajuste conforme seus controllers)

Últimas transações – usado no app: getUltimasTransacoes(usuarioId, take, skip)

Criar receita – POST /api/Receita (exemplo)

Criar despesa – POST /api/Despesa (exemplo)

Se os nomes forem diferentes aí no seu projeto, só alinhar no src/services.

🧭 Telas e Funcionalidades

Login / Registro
Estilo unificado (header roxo, card, inputs com ícones). Login simulado.

Home
Resumo do mês (entradas/saídas/saldo) + gastos por categoria + gráfico.
Suporte a troca de mês/ano (se implementado) e cache/refetch via React Query.

Transações
Lista agrupada por data (Hoje, Ontem, dia da semana), filtros Todos/Receitas/Despesas, FAB para adicionar.
Máscara de valor (centavos automáticos) e data dd/mm/aaaa.
Picker de categoria compatível com Android/iOS.

Metas
Lista metas do usuário, cria meta (descrição, data limite, valor alvo), adiciona/remove valor com máscara, recalcula % e quanto falta, e exclui meta.

🧪 Testando (Postman)

Exemplos (troque IP/porta):

# GET metas do usuário 1
GET http://192.168.1.8:5177/api/Meta/usuario/1

# POST criar meta
POST http://192.168.1.8:5177/api/Meta
Content-Type: application/json

{
  "descricao": "Comprar notebook",
  "valorAlvo": 5000,
  "valorAtual": 0,
  "data": "2025-12-01",
  "atingida": false,
  "usuarioId": 1
}

# PATCH adicionar 200,50 na meta 3
PATCH http://192.168.1.8:5177/api/Meta/3/valor?delta=200.50

# PATCH remover 50 da meta 3
PATCH http://192.168.1.8:5177/api/Meta/3/valor?delta=-50

# DELETE meta 3
DELETE http://192.168.1.8:5177/api/Meta/3

📄 Licença

Livre para uso educacional e pessoal. Ajuste conforme sua necessidade.
