# Setup do Projeto Todo MCP

## Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Chave da API do OpenAI (ChatGPT)

## Configuração

### 1. Frontend

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

3. Execute o frontend:
```bash
npm run dev
```

### 2. Backend

1. Entre na pasta do servidor:
```bash
cd server
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente. Crie um arquivo `.env` na pasta `server/`:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
OPENAI_API_KEY=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
PORT=3001
```

**Importante:** No servidor Node.js, use `SUPABASE_URL` e `SUPABASE_ANON_KEY` (sem o prefixo `VITE_`). O prefixo `VITE_` é apenas para variáveis do frontend.

4. Execute o servidor:
```bash
npm run dev
```

## Estrutura do Banco de Dados (Supabase)

Crie uma tabela `todos` com os seguintes campos:

```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  description TEXT DEFAULT '',
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Executando o Projeto

1. Inicie o backend (na pasta `server/`):
```bash
npm run dev
```

2. Inicie o frontend (na raiz do projeto):
```bash
npm run dev
```

3. Acesse `http://localhost:5173` (ou a porta que o Vite indicar)

## Funcionalidades

- ✅ Gerenciamento de todos (criar, editar, deletar, marcar como concluído)
- ✅ Chat com ChatGPT integrado
- ✅ Integração com Supabase
- ✅ Interface moderna e responsiva

