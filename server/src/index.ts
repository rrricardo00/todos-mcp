import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import chatRouter from './routes/chat.js'
import todosRouter from './routes/todos.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3001

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios!')
  console.error('Configure as variáveis de ambiente no arquivo .env na pasta server/')
  console.error('Exemplo:')
  console.error('SUPABASE_URL=https://seu-projeto.supabase.co')
  console.error('SUPABASE_ANON_KEY=sua_chave_aqui')
  process.exit(1)
}

export const supabase = createClient(supabaseUrl, supabaseKey)

app.use(cors())
app.use(express.json())

app.use('/api/chat', chatRouter)
app.use('/api/todos', todosRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Todos MCP API Server',
    endpoints: {
      health: '/api/health',
      todos: '/api/todos',
      chat: '/api/chat'
    }
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

