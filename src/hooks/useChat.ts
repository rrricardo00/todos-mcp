import { useState, useCallback } from 'react'
import type { ChatMessage } from '../types/todo'
import type { Todo } from '../types/todo'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionExecuted, setActionExecuted] = useState(false)

  const sendMessage = useCallback(async (content: string, todos?: Todo[]) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          todos: todos || []
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('[useChat] Response received:', {
        hasMessage: !!data.message,
        hasAction: !!data.action,
        actionType: data.action?.type || 'none'
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      
      if (data.action) {
        console.log('[useChat] Action detected, setting actionExecuted to true:', data.action)
        setActionExecuted(true)
        setTimeout(() => {
          console.log('[useChat] Resetting actionExecuted to false')
          setActionExecuted(false)
        }, 2000)
      } else {
        console.log('[useChat] No action in response')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Desculpe, ocorreu um erro: ${errorMessage}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    actionExecuted,
  }
}

