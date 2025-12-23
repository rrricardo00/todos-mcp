# Todo List com Llama 3.2

Aplicação React para gerenciar todos com assistente inteligente usando Llama 3.2.

## 🚀 Features

- ✅ CRUD completo de todos
- 🤖 Chat com Llama 3.2 (Ollama ou Groq)
- 💾 Backend Node.js com Express
- 🗄️ Supabase para persistência
- 🎨 Interface moderna com Tailwind CSS

## 📋 Pré-requisitos

1. **Node.js** (v18+)
2. **Supabase** - Conta e projeto configurado
3. **Llama 3.2** - Via Ollama (local) ou Groq API (cloud)

## 🛠️ Setup

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

# Llama (Opcional - padrão: Ollama local)
OLLAMA_URL=http://localhost:11434
LLAMA_MODEL=llama3.2

# Ou use Groq API (cloud)
# GROQ_API_KEY=sua_groq_api_key
```

### 3. Configurar Llama 3.2

**Opção A: Ollama (Local - Recomendado)**

```bash
# Instalar Ollama
# Windows: Baixe de https://ollama.com
# Mac: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo Llama 3.2
ollama pull llama3.2

# Iniciar Ollama
ollama serve
```

**Opção B: Groq API (Cloud)**

1. Acesse [console.groq.com](https://console.groq.com)
2. Crie uma conta e gere uma API key
3. Adicione `GROQ_API_KEY` no `.env`

📖 **[Guia Completo de Setup do Llama](./LLAMA_SETUP.md)**

### 4. Iniciar Aplicação

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🎯 Como Usar

1. **Todo List**: Gerencie seus todos tradicionalmente
2. **Chat com Llama**: Converse com o assistente para gerenciar todos

### Exemplos de Comandos no Chat

- "Liste meus todos"
- "Crie um todo para comprar leite"
- "Quantos todos eu tenho?"
- "Atualize o primeiro todo"
- "Delete o todo de comprar leite"

## 📁 Estrutura do Projeto

```
├── server/              # Backend Node.js
│   ├── index.ts        # Servidor principal
│   ├── routes/         # Rotas da API
│   │   ├── chat.ts    # Endpoints de chat
│   │   └── todos.ts   # Endpoints de todos
│   └── services/      # Serviços
│       └── llamaService.ts  # Integração Llama 3.2
├── src/                # Frontend React
│   ├── components/    # Componentes
│   │   ├── TodoList.tsx
│   │   └── Chat.tsx
│   ├── hooks/         # Custom hooks
│   │   ├── useChat.ts
│   │   └── useTodos.ts
│   └── App.tsx
└── .env               # Variáveis de ambiente
```

## 🔌 API Endpoints

### Chat
- `POST /api/chat` - Enviar mensagem para Llama
- `GET /api/chat/history` - Histórico de chat

### Todos
- `GET /api/todos` - Listar todos
- `GET /api/todos/:id` - Obter todo específico
- `POST /api/todos` - Criar todo
- `PUT /api/todos/:id` - Atualizar todo
- `DELETE /api/todos/:id` - Deletar todo
- `GET /api/todos/count` - Contar todos

## 🧪 Testar

### Testar Backend

```bash
# Health check
curl http://localhost:3001/health

# Testar chat
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Olá!"}]}'
```

## 📚 Scripts Disponíveis

- `npm run dev` - Inicia Vite dev server
- `npm run build` - Build para produção
- `npm run server` - Inicia backend Node.js
- `npm run dev:server` - Backend em modo watch
- `npm run lint` - Executa ESLint

## 🔧 Troubleshooting

### Backend não conecta ao Supabase
- Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão no `.env`

### Llama não responde
- Se usando Ollama: verifique se `ollama serve` está rodando
- Se usando Groq: verifique se a API key está correta
- Veja [LLAMA_SETUP.md](./LLAMA_SETUP.md) para mais detalhes

### Erro de CORS
- O backend já está configurado com CORS
- Verifique se o backend está rodando na porta 3001

## 📖 Documentação Adicional

- [Setup Llama 3.2](./LLAMA_SETUP.md) - Guia completo de configuração

## 🎉 Pronto!

Agora você tem uma aplicação completa com:
- ✅ Backend Node.js + Supabase
- ✅ Integração com Llama 3.2
- ✅ Chat inteligente no React
- ✅ Gerenciamento completo de todos
