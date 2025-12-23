import { Router } from 'express'
import { chatWithLlama } from '../services/llamaService.js'
import { processTodoAction } from '../services/todoActionService.js'
import { supabase } from '../index.js'

export const chatRouter = Router()

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  context?: {
    todos?: any[]
  }
}

// Chat endpoint with Llama 3.2
chatRouter.post('/', async (req, res) => {
  try {
    const { messages, context }: ChatRequest = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    // Get latest message from user
    const userMessage = messages[messages.length - 1]
    if (userMessage.role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from user' })
    }

    // Fetch todos for context if not provided
    let todos = context?.todos
    if (!todos) {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error) {
        todos = data || []
      }
    }

    // Process todo actions first (create, update, delete)
    console.log('Processing message:', userMessage.content)
    const action = await processTodoAction(userMessage.content, todos || [])
    console.log('Action result:', action.type, action.message ? 'Has message' : 'No message')

    // If an action was executed, return the result
    if (action.type !== 'none' && action.message) {
      console.log('Action executed:', action.type)
      // Refresh todos after action
      const { data: updatedTodos } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      return res.json({
        message: action.message,
        action: {
          type: action.type,
          data: action.data
        },
        context: {
          todosCount: updatedTodos?.length || 0,
          todos: updatedTodos || []
        }
      })
    }

    console.log('No action detected, using Llama')

    // If no action was executed, use Llama for conversational response
    // Create system prompt with context
    const systemPrompt = `Você é um assistente útil que ajuda usuários a gerenciar seus todos. 
Você tem acesso à lista de todos deles e pode ajudá-los:
- Listar todos
- Criar novos todos
- Atualizar todos existentes
- Deletar todos
- Responder perguntas sobre seus todos

Todos atuais (${todos?.length || 0} total):
${todos?.map((t, i) => `${i + 1}. ${t.item} (Qty: ${t.quantity}${t.description ? `, Desc: ${t.description}` : ''}) [ID: ${t.id}]`).join('\n') || 'Nenhum todo ainda'}

Quando o usuário pedir para criar, atualizar ou deletar um todo, você deve instruí-los sobre como fazer isso.
Seja amigável, conciso e útil. Responda em português.`

    // Prepare messages for Llama
    const llamaMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }))
    ]

    // Get response from Llama
    const response = await chatWithLlama(llamaMessages)

    res.json({
      message: response,
      action: null,
      context: {
        todosCount: todos?.length || 0,
        todos: todos || []
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
    })
  }
})

// Get chat history (optional - can be extended to store in database)
chatRouter.get('/history', async (_req, res) => {
  // This can be extended to fetch from database
  res.json({ messages: [] })
})
