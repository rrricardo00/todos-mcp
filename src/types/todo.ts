export interface Todo {
  id: string
  item: string
  quantity: number
  description: string
  created_at: string
  checked: boolean
}

export interface CreateTodoRequest {
  item: string
  quantity: number
  description: string
}

export interface UpdateTodoRequest {
  item?: string
  quantity?: number
  description?: string
  checked?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
