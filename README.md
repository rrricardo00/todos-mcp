# 📝 Todos MCP - Todo List com ChatGPT

Aplicação moderna de gerenciamento de tarefas (todos) integrada com ChatGPT para criação e gerenciamento inteligente de tarefas.

## ✨ Funcionalidades

- ✅ Criar, editar e deletar todos
- 🤖 Chat com assistente inteligente (ChatGPT) para gerenciar todos via linguagem natural
- 📊 Visualização de todos ativos e concluídos
- 📅 Ordenação por data
- 🎨 Interface moderna e responsiva

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: Supabase
- **IA**: OpenAI API (ChatGPT)
- **Deploy**: GitHub Actions + GitHub Pages (Frontend) + Railway/Render (Backend)

## 📋 Pré-requisitos

- Node.js 20+ e npm
- Conta no Supabase
- Conta no OpenAI (com API key)
- Git

## 🛠️ Instalação Local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/todos-mcp.git
cd todos-mcp
```

### 2. Configure o Backend

```bash
cd server
npm install
cp .env.example .env
```

Edite o arquivo `server/.env` com suas credenciais:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
OPENAI_API_KEY=sk-proj-sua-chave-openai
OPENAI_MODEL=gpt-3.5-turbo
PORT=3001
NODE_ENV=development
```

### 3. Configure o Frontend

```bash
cd ..
npm install
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_API_URL=http://localhost:3001/api
```

### 4. Execute o Backend

```bash
cd server
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 5. Execute o Frontend

Em outro terminal:

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 🗄️ Configuração do Banco de Dados (Supabase)

Crie uma tabela `todos` no Supabase com a seguinte estrutura:

```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  description TEXT DEFAULT '',
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deploy

Para instruções detalhadas de deploy, consulte o arquivo [DEPLOY.md](./DEPLOY.md).

### Resumo Rápido

1. **Configure GitHub Secrets** com todas as variáveis de ambiente
2. **Faça push para `main`** - o GitHub Actions fará deploy automático do frontend
3. **Deploy do backend** em Railway, Render ou Vercel
4. **Atualize `VITE_API_URL`** com a URL do backend deployado

## 💬 Como Usar o Chat

O chat permite criar e gerenciar todos usando linguagem natural:

- **Criar**: "Criar um todo para comprar leite"
- **Listar**: "Mostre meus todos"
- **Atualizar**: "Atualize o todo de comprar leite para quantidade 5"
- **Deletar**: "Delete o todo de comprar leite"
- **Concluir**: "Marque o todo de comprar leite como feito"

## 📁 Estrutura do Projeto

```
TodosMcp/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de deploy
├── server/                      # Backend
│   ├── src/
│   │   ├── index.ts            # Servidor Express
│   │   ├── routes/             # Rotas da API
│   │   └── services/           # Serviços (ChatGPT, Supabase)
│   ├── .env.example
│   └── package.json
├── src/                         # Frontend
│   ├── components/             # Componentes React
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Bibliotecas (Supabase)
│   └── types/                  # TypeScript types
├── .env.example
├── DEPLOY.md                   # Guia de deploy
└── README.md                   # Este arquivo
```

## 🔒 Segurança

- ⚠️ **NUNCA** commite arquivos `.env` no Git
- ✅ Use GitHub Secrets para variáveis de ambiente em produção
- ✅ Use `.env.example` como template
- ✅ Mantenha suas API keys seguras

## 📝 Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção

### Backend
- `npm run dev` - Inicia servidor com hot-reload
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor de produção

## 🐛 Troubleshooting

### Erro "Supabase URL is required"
- Verifique se as variáveis de ambiente estão configuradas corretamente
- Certifique-se de que o arquivo `.env` existe e está no lugar correto

### Erro "OpenAI API key invalid"
- Verifique se a chave está correta e não tem espaços extras
- Certifique-se de que a chave começa com `sk-`

### Chat não atualiza a lista de todos
- Verifique o console do navegador para logs de debug
- Certifique-se de que o backend está rodando e acessível

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📧 Contato

Para dúvidas ou suporte, abra uma issue no repositório.
