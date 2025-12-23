# Todo MCP Server

Backend server para gerenciamento de todos com integração ChatGPT via MCP.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto `server/`:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
OPENAI_API_KEY=sua_chave_do_openai
PORT=3001
```

**Nota:** Use `SUPABASE_URL` e `SUPABASE_ANON_KEY` (sem o prefixo `VITE_`). O prefixo `VITE_` é apenas para variáveis do frontend.

3. Execute o servidor em modo desenvolvimento:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

## Endpoints

### Chat
- `POST /api/chat` - Envia mensagem para o ChatGPT

### Todos
- `GET /api/todos` - Lista todos os todos
- `GET /api/todos/:id` - Busca um todo específico
- `POST /api/todos` - Cria um novo todo
- `PUT /api/todos/:id` - Atualiza um todo
- `DELETE /api/todos/:id` - Deleta um todo

## Estrutura

```
server/
├── src/
│   ├── index.ts          # Servidor principal
│   └── routes/
│       ├── chat.ts       # Rotas de chat
│       └── todos.ts      # Rotas de todos
└── package.json
```

