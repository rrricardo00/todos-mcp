# Setup Llama 3.2 - Guia Completo

## 🚀 Configuração do Llama 3.2

Este projeto suporta duas formas de usar o Llama 3.2:

### Opção 1: Ollama (Local - Recomendado)

#### Instalação

1. **Instale o Ollama:**
   - Windows: Baixe de [ollama.com](https://ollama.com)
   - Mac: `brew install ollama`
   - Linux: `curl -fsSL https://ollama.com/install.sh | sh`

2. **Baixe o modelo Llama 3.2:**
   ```bash
   ollama pull llama3.2
   ```

3. **Inicie o Ollama:**
   ```bash
   ollama serve
   ```

4. **Configure o .env (opcional):**
   ```env
   OLLAMA_URL=http://localhost:11434
   LLAMA_MODEL=llama3.2
   ```

### Opção 2: Groq API (Cloud)

1. **Obtenha uma API Key:**
   - Acesse [console.groq.com](https://console.groq.com)
   - Crie uma conta e gere uma API key

2. **Configure o .env:**
   ```env
   GROQ_API_KEY=sua_api_key_aqui
   ```

## 📝 Arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

# Llama (Ollama - Local)
OLLAMA_URL=http://localhost:11434
LLAMA_MODEL=llama3.2

# Llama (Groq - Cloud) - Opcional
# GROQ_API_KEY=sua_groq_api_key
```

## 🏃 Como Executar

### 1. Inicie o Backend

```bash
npm run server
```

Ou em modo desenvolvimento (com auto-reload):

```bash
npm run dev:server
```

### 2. Inicie o Frontend

Em outro terminal:

```bash
npm run dev
```

## ✅ Verificação

### Verificar se Ollama está rodando:

```bash
curl http://localhost:11434/api/tags
```

### Verificar se o backend está funcionando:

```bash
curl http://localhost:3001/health
```

### Testar o chat:

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Olá, como você pode me ajudar?"}
    ]
  }'
```

## 🎯 Uso no React

1. Abra a aplicação: `http://localhost:5173`
2. Clique na aba "Chat com Llama"
3. Digite sua mensagem e pressione Enter

## 🔧 Troubleshooting

### Ollama não está respondendo

1. Verifique se o Ollama está rodando:
   ```bash
   ollama serve
   ```

2. Verifique se o modelo está instalado:
   ```bash
   ollama list
   ```

3. Se não estiver, instale:
   ```bash
   ollama pull llama3.2
   ```

### Erro de conexão com Groq

1. Verifique se a API key está correta no `.env`
2. Verifique se tem créditos na conta Groq
3. Tente usar Ollama local como alternativa

### Backend não inicia

1. Verifique se a porta 3001 está livre
2. Verifique se as variáveis do Supabase estão configuradas
3. Veja os logs do servidor para mais detalhes

## 📚 Recursos

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Groq API Documentation](https://console.groq.com/docs)
- [Llama 3.2 Model](https://ollama.com/library/llama3.2)
