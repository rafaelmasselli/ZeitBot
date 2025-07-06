# ZeitBot Server

Servidor responsável por consumir APIs, processar dados e gerenciar tarefas cron.

## Requisitos

- Node.js 22.17.0 ou superior
- npm 10.9.2 ou superior

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
cd server
npm install
```

3. Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

## Produção

Para compilar e iniciar o servidor em modo de produção:

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
server/
├── src/
│   ├── config/       # Configurações da aplicação
│   ├── controllers/  # Controladores das rotas
│   ├── jobs/         # Tarefas cron
│   ├── middlewares/  # Middlewares do Express
│   ├── models/       # Modelos de dados
│   ├── routes/       # Definições de rotas
│   ├── services/     # Serviços para consumo de APIs e processamento
│   ├── types/        # Definições de tipos TypeScript
│   ├── utils/        # Utilitários
│   └── index.ts      # Ponto de entrada da aplicação
├── .env.example      # Exemplo de variáveis de ambiente
├── .nvmrc            # Versão do Node.js
├── package.json      # Dependências e scripts
├── tsconfig.json     # Configuração do TypeScript
└── README.md         # Este arquivo
```

## Endpoints

- `GET /health`: Verificação básica de saúde do servidor
- `GET /api/health`: Verificação de saúde detalhada
- `GET /api/health/deep`: Verificação profunda de saúde (inclui dependências)

## Jobs Cron

O servidor inclui um sistema de agendamento de tarefas usando node-cron. Os jobs são configurados em `src/jobs/index.ts` e implementados em arquivos separados em `src/jobs/`.

Para adicionar um novo job:

1. Crie um arquivo para o job em `src/jobs/`
2. Implemente a lógica do job
3. Registre o job em `src/jobs/index.ts` 