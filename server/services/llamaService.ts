/**
 * Llama 3.2 Service
 * Supports multiple integration methods:
 * 1. Ollama (local) - http://localhost:11434
 * 2. Groq API (cloud) - https://api.groq.com
 * 3. Custom Llama API endpoint
 */

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const GROQ_API_KEY = process.env.GROQ_API_KEY
const LLAMA_MODEL = process.env.LLAMA_MODEL || 'llama3.2'

/**
 * Chat with Llama 3.2
 * Tries Ollama first, then falls back to Groq API if available
 */
export async function chatWithLlama(messages: Message[]): Promise<string> {
  // Try Ollama first (local)
  if (await isOllamaAvailable()) {
    return chatWithOllama(messages)
  }

  // Try Groq API (cloud)
  if (GROQ_API_KEY) {
    return chatWithGroq(messages)
  }

  // Fallback: return a helpful message
  throw new Error(
    'Llama 3.2 not available. Please:\n' +
    '1. Install Ollama and run: ollama pull llama3.2\n' +
    '2. Or set GROQ_API_KEY in .env for cloud access'
  )
}

/**
 * Check if Ollama is available
 */
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Chat with Ollama (local Llama)
 */
async function chatWithOllama(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLAMA_MODEL,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ollama error: ${error}`)
    }

    const data = await response.json()
    return data.message?.content || 'No response from Llama'
  } catch (error) {
    throw new Error(`Failed to chat with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Chat with Groq API (cloud Llama)
 */
async function chatWithGroq(messages: Message[]): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-3b-instant', // or llama-3.2-11b-vision-preview
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Groq API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response from Llama'
  } catch (error) {
    throw new Error(`Failed to chat with Groq: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check Llama availability
 */
export async function checkLlamaAvailability(): Promise<{
  available: boolean
  method: 'ollama' | 'groq' | 'none'
  message: string
}> {
  if (await isOllamaAvailable()) {
    return {
      available: true,
      method: 'ollama',
      message: 'Ollama is available (local)'
    }
  }

  if (GROQ_API_KEY) {
    return {
      available: true,
      method: 'groq',
      message: 'Groq API is configured (cloud)'
    }
  }

  return {
    available: false,
    method: 'none',
    message: 'No Llama service available. Install Ollama or set GROQ_API_KEY'
  }
}
