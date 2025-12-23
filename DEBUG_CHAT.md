# Debug do Chat - Ações não Funcionando

## 🔍 Como Verificar

### 1. Verifique os Logs do Backend

Quando você envia uma mensagem no chat, o backend deve mostrar logs como:

```
[todoActionService] Processing: Crie um todo para comprar leite Todos count: 0
[Create] Keywords detected, extracting item...
[Create] Pattern 1 matched: comprar leite
[Create] Executing create - item: comprar leite quantity: 1 description: 
[Create] Inserting todo: { item: 'comprar leite', quantity: 1, description: '' }
[Create] Todo created successfully: {...}
Action executed: create
```

### 2. Teste os Comandos

**Criar:**
- "Crie um todo para comprar leite"
- "Adicione um todo: Comprar leite"
- "Criar todo para comprar leite"

**Deletar:**
- "Delete o todo de comprar leite"
- "Remover o todo de [nome]"

**Listar:**
- "Liste meus todos"
- "Quais são meus todos?"

### 3. Verifique se o Backend está Rodando

```bash
npm run server
```

Você deve ver:
```
🚀 Server running on http://localhost:3001
📡 Chat API: http://localhost:3001/api/chat
📋 Todos API: http://localhost:3001/api/todos
✅ Supabase connected: ...
```

### 4. Teste Direto a API

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Crie um todo para comprar leite"}
    ]
  }'
```

## 🐛 Problemas Comuns

### Ação não é detectada

**Sintoma:** O Llama responde mas não executa a ação

**Solução:**
1. Verifique os logs do backend
2. Verifique se a mensagem contém palavras-chave (criar, adicionar, deletar, etc.)
3. Tente comandos mais explícitos: "Crie um todo para comprar leite"

### Erro ao criar/deletar

**Sintoma:** Mensagem de erro aparece

**Solução:**
1. Verifique se o Supabase está configurado corretamente
2. Verifique as credenciais no `.env`
3. Veja os logs de erro no console do backend

### Lista não atualiza

**Sintoma:** Ação executada mas lista não muda

**Solução:**
1. Verifique se `fetchTodos()` está sendo chamado após ações
2. Recarregue a página
3. Verifique o console do navegador para erros

## 📝 Logs de Debug

Os logs mostram:
- `[todoActionService] Processing:` - Mensagem sendo processada
- `[Create] Keywords detected` - Palavras-chave detectadas
- `[Create] Pattern X matched` - Qual padrão funcionou
- `[Create] Executing create` - Executando criação
- `Action executed: create` - Ação executada com sucesso

## ✅ Checklist

- [ ] Backend está rodando (`npm run server`)
- [ ] Logs aparecem no console do backend
- [ ] Comando contém palavras-chave (criar, deletar, etc.)
- [ ] Comando contém a palavra "todo"
- [ ] Supabase está configurado corretamente
- [ ] Frontend está chamando a API correta (`http://localhost:3001/api/chat`)
