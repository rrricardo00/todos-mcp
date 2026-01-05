# Guia de Deploy - Todos MCP

Este guia explica como fazer deploy do frontend e backend no GitHub, usando GitHub Secrets para gerenciar variáveis de ambiente de forma segura.

## 📋 Pré-requisitos

- Conta no GitHub
- Repositório criado no GitHub
- Conta no Supabase (para banco de dados)
- Conta no OpenAI (para API do ChatGPT)
- Plataforma de deploy para o backend (Railway, Render, Vercel, etc.)

## 🔐 Configurando GitHub Secrets

### 1. Acesse as Secrets do Repositório

1. Vá para seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**

### 2. Adicione as Secrets do Frontend

Adicione os seguintes secrets:

| Nome do Secret | Valor | Descrição |
|---------------|-------|-----------|
| `VITE_API_URL` | `https://seu-backend.com/api` | URL da API do backend (após deploy) |

⚠️ **Nota**: O frontend não precisa mais das credenciais do Supabase (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`), pois agora acessa o Supabase exclusivamente através do backend.

### 3. Adicione as Secrets do Backend

| Nome do Secret | Valor | Descrição |
|---------------|-------|-----------|
| `SUPABASE_URL` | `https://seu-projeto.supabase.co` | URL do seu projeto Supabase |
| `SUPABASE_ANON_KEY` | `sua-chave-anon` | Chave anônima do Supabase |
| `OPENAI_API_KEY` | `sk-proj-...` | Chave da API do OpenAI |
| `OPENAI_MODEL` | `gpt-3.5-turbo` | Modelo do OpenAI (opcional, padrão: gpt-3.5-turbo) |
| `PORT` | `3001` | Porta do servidor (opcional, padrão: 3001) |

### 4. Secret para GitHub Pages (Opcional)

Se quiser usar um domínio customizado:

| Nome do Secret | Valor | Descrição |
|---------------|-------|-----------|
| `CUSTOM_DOMAIN` | `seu-dominio.com` | Domínio customizado para GitHub Pages |

## 🚀 Deploy do Frontend (GitHub Pages)

### Opção 1: Deploy Automático via GitHub Actions

O workflow `.github/workflows/deploy.yml` já está configurado para fazer deploy automático quando você fizer push para a branch `main` ou `master`.

1. Faça push do código:
   ```bash
   git add .
   git commit -m "Setup deploy"
   git push origin main
   ```

2. O GitHub Actions irá:
   - Instalar dependências
   - Fazer build do frontend com as variáveis de ambiente dos Secrets
   - Fazer deploy no GitHub Pages

3. Após o deploy, acesse: `https://seu-usuario.github.io/seu-repositorio`

### Opção 2: Deploy Manual

1. Configure o GitHub Pages:
   - Vá em **Settings** → **Pages**
   - Selecione a branch `gh-pages` como source
   - Salve

2. Execute localmente:
   ```bash
   # Configure as variáveis de ambiente
   export VITE_SUPABASE_URL="sua-url"
   export VITE_SUPABASE_ANON_KEY="sua-chave"
   export VITE_API_URL="https://seu-backend.com/api"
   
   # Build
   npm run build
   
   # Deploy manual (usando gh-pages)
   npm install -g gh-pages
   gh-pages -d dist
   ```

## 🖥️ Deploy do Backend

### Opção 1: Railway (Recomendado)

1. Acesse [Railway](https://railway.app)
2. Crie uma nova conta ou faça login
3. Clique em **New Project** → **Deploy from GitHub repo**
4. Selecione seu repositório
5. Configure o diretório raiz como `server`
6. Adicione as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (opcional)
   - `PORT` (opcional)
   - `NODE_ENV=production`
7. Railway irá fazer deploy automaticamente

### Opção 2: Render

1. Acesse [Render](https://render.com)
2. Crie uma nova conta ou faça login
3. Clique em **New** → **Web Service**
4. Conecte seu repositório do GitHub
5. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Adicione as variáveis de ambiente (mesmas do Railway)
7. Clique em **Create Web Service**

### Opção 3: Vercel

1. Acesse [Vercel](https://vercel.com)
2. Importe seu repositório
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Adicione as variáveis de ambiente
5. Deploy

### Opção 4: Outros (Heroku, DigitalOcean, etc.)

Configure as variáveis de ambiente na plataforma escolhida e use o comando:
```bash
npm start
```

## 🔄 Atualizando o VITE_API_URL

Após fazer deploy do backend, você precisa atualizar o secret `VITE_API_URL` no GitHub com a URL do seu backend deployado.

1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Edite o secret `VITE_API_URL`
3. Coloque a URL do seu backend (ex: `https://seu-backend.railway.app/api`)
4. Faça um novo push para triggerar o rebuild do frontend

## 📝 Estrutura de Arquivos

```
TodosMcp/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de deploy automático
├── server/
│   ├── .env.example            # Template de variáveis do backend
│   └── src/
├── .env.example                 # Template de variáveis do frontend
├── DEPLOY.md                    # Este arquivo
└── README.md
```

## ✅ Checklist de Deploy

- [ ] Criar repositório no GitHub
- [ ] Adicionar todos os GitHub Secrets
- [ ] Fazer push do código para `main` ou `master`
- [ ] Verificar se o GitHub Actions executou com sucesso
- [ ] Fazer deploy do backend em uma plataforma (Railway/Render/Vercel)
- [ ] Atualizar `VITE_API_URL` com a URL do backend deployado
- [ ] Testar o frontend deployado
- [ ] Testar o backend deployado
- [ ] Verificar se o chat está funcionando

## 🐛 Troubleshooting

### Frontend não carrega as variáveis de ambiente

- Verifique se os secrets estão configurados corretamente
- Verifique se o build está usando as variáveis corretas
- Veja os logs do GitHub Actions

### Backend retorna erro 500

- Verifique se todas as variáveis de ambiente estão configuradas na plataforma de deploy
- Verifique os logs do backend
- Teste localmente primeiro

### CORS errors

- Configure CORS no backend para aceitar requisições do domínio do frontend
- Verifique se `VITE_API_URL` está correto

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

