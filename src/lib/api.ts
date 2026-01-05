import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/todo'

const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const todosApi = {
  getAll: () => apiRequest<Todo[]>('/todos'),
  
  getById: (id: string) => apiRequest<Todo>(`/todos/${id}`),
  
  create: (data: CreateTodoRequest) =>
    apiRequest<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: UpdateTodoRequest) =>
    apiRequest<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiRequest<{ success: boolean; id: string }>(`/todos/${id}`, {
      method: 'DELETE',
    }),
}

