import { useState, useEffect, useCallback } from 'react'
import type { Todo } from '../types/todo'

const API_URL = 'http://localhost:3001/api'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      const response = await fetch(`${API_URL}/todos`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setTodos(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch todos'
      setError(errorMessage)
      console.error('Error fetching todos:', err)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  const addTodo = useCallback((todo: Todo) => {
    setTodos(prev => [...prev, todo])
  }, [])

  const updateTodo = useCallback((updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo))
  }, [])

  const removeTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  return {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    updateTodo,
    removeTodo,
  }
}
