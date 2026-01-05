# 🚀 Guia Rápido: Deploy no GitHub

## Passo 1: Preparar o Repositório Local

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: Todo MCP app with ChatGPT integration"

# Adicionar remote do GitHub (substitua pela URL do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

## Passo 2: Configurar GitHub Secrets

1. Acesse: `https://github.com/SEU-USUARIO/SEU-REPOSITORIO/settings/secrets/actions`

2. Clique em **"New repository secret"** e adicione cada uma:

### Secrets do Frontend:
- **Nome**: `VITE_API_URL` | **Valor**: `https://seu-backend.railway.app/api` (após deploy do backend)
  - ⚠️ **Nota**: O frontend não precisa mais das credenciais do Supabase, pois acessa através do backend

### Secrets do Backend:
- **Nome**: `SUPABASE_URL` | **Valor**: `https://seu-projeto.supabase.co`
- **Nome**: `SUPABASE_ANON_KEY` | **Valor**: `sua-chave-anon-do-supabase`
- **Nome**: `OPENAI_API_KEY` | **Valor**: `sk-proj-sua-chave-openai`
- **Nome**: `OPENAI_MODEL` | **Valor**: `gpt-3.5-turbo` (opcional)

## Passo 3: Habilitar GitHub Pages

1. Vá em: `https://github.com/SEU-USUARIO/SEU-REPOSITORIO/settings/pages`
2. Em **Source**, selecione: **GitHub Actions**
3. Salve

## Passo 4: Deploy do Backend (Railway - Recomendado)

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em **"New Project"** → **"Deploy from GitHub repo"**
4. Selecione seu repositório
5. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Vá em **Variables** e adicione:
   - `SUPABASE_URL` = `https://seu-projeto.supabase.co`
   - `SUPABASE_ANON_KEY` = `sua-chave-anon`
   - `OPENAI_API_KEY` = `sk-proj-sua-chave`
   - `OPENAI_MODEL` = `gpt-3.5-turbo`
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
7. Railway irá gerar uma URL (ex: `https://seu-app.railway.app`)

## Passo 5: Atualizar VITE_API_URL

Após o backend estar deployado:

1. Volte para GitHub Secrets
2. Edite `VITE_API_URL` com a URL do Railway: `https://seu-app.railway.app/api`
3. Faça um novo commit para triggerar o rebuild:

```bash
git commit --allow-empty -m "Trigger rebuild with new API URL"
git push
```

## Passo 6: Verificar Deploy

- **Frontend**: `https://SEU-USUARIO.github.io/SEU-REPOSITORIO`
- **Backend**: URL do Railway (ex: `https://seu-app.railway.app`)

## ✅ Checklist Final

- [ ] Código commitado e pushado para GitHub
- [ ] Todos os GitHub Secrets configurados
- [ ] GitHub Pages habilitado
- [ ] Backend deployado no Railway/Render
- [ ] `VITE_API_URL` atualizado com URL do backend
- [ ] Frontend acessível via GitHub Pages
- [ ] Backend respondendo corretamente
- [ ] Chat funcionando

## 🔍 Verificando Logs

### GitHub Actions (Frontend)
- Vá em: `https://github.com/SEU-USUARIO/SEU-REPOSITORIO/actions`
- Clique no workflow mais recente para ver logs

### Railway (Backend)
- Acesse o dashboard do Railway
- Clique no seu projeto → **Deployments** → Veja os logs

## 🐛 Problemas Comuns

### Frontend não carrega
- Verifique se GitHub Pages está habilitado
- Veja os logs do GitHub Actions
- Verifique se os Secrets estão corretos

### Backend retorna 500
- Verifique as variáveis de ambiente no Railway
- Veja os logs do Railway
- Teste localmente primeiro

### CORS Error
- Certifique-se de que `VITE_API_URL` está correto
- Verifique se o backend está acessível

