export interface Todo {
  id: string
  item: string
  quantity: number
  description: string
  created_at: string
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
}
