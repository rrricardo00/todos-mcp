import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { chatRouter } from './routes/chat.js'
import { todosRouter } from './routes/todos.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file')
  process.exit(1)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/todos', todosRouter)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Chat API: http://localhost:${PORT}/api/chat`)
  console.log(`📋 Todos API: http://localhost:${PORT}/api/todos`)
  console.log(`✅ Supabase connected: ${supabaseUrl.substring(0, 30)}...`)
})
