import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Router } from 'express'
import OpenAI from 'openai'
import { processTodoAction } from '../services/todoActionService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

const router = Router()

const requestCache = new Map<string, { response: any; timestamp: number }>()
const CACHE_TTL = 60000
const RATE_LIMIT_WINDOW = 60000
const MAX_REQUESTS_PER_WINDOW = 10
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(req: any): string {
  return req.ip || (Array.isArray(req.headers['x-forwarded-for']) 
    ? req.headers['x-forwarded-for'][0] 
    : req.headers['x-forwarded-for']) || 'unknown'
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(key)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }
  
  record.count++
  return true
}

let openaiApiKey = process.env.OPENAI_API_KEY || ''
let openaiModel = process.env.OPENAI_MODEL || ''

if (openaiApiKey) {
  openaiApiKey = openaiApiKey.trim()
}

if (!openaiApiKey || openaiApiKey === '') {
  console.error('❌ Error: OPENAI_API_KEY is required!')
  console.error('Configure the OPENAI_API_KEY environment variable in the .env file in the server/ folder')
  console.error('Expected path:', join(__dirname, '../../.env'))
  console.error('Environment variables loaded from .env:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasModel: !!process.env.OPENAI_MODEL,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPENAI'))
  })
} else {
  const keyPreview = openaiApiKey.substring(0, 7) + '...' + openaiApiKey.substring(openaiApiKey.length - 4)
  const keyLength = openaiApiKey.length
  console.log(`✅ OpenAI API Key loaded: ${keyPreview} (${keyLength} characters)`)
  console.log(`✅ Model configured: ${openaiModel}`)
  
  if (!openaiApiKey.startsWith('sk-')) {
    console.warn('⚠️  WARNING: The key does not start with "sk-" - it may be incorrect!')
  }
}

const openai = new OpenAI({
  apiKey: openaiApiKey
})

router.post('/', async (req, res) => {
  try {
    const rateLimitKey = getRateLimitKey(req)
    
    if (!checkRateLimit(rateLimitKey)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait a moment before trying again.'
      })
    }

    const { message, todos } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const action = await processTodoAction(message, todos || [])
    
    const cacheKey = `${message}-${JSON.stringify(todos || [])}`
    
    if (action.type === 'none') {
      const cached = requestCache.get(cacheKey) as { response: any; timestamp: number } | undefined
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('📦 Response from cache')
        return res.json(cached.response)
      }
    }
    
    const todosContext = todos && todos.length > 0 
      ? `\n\nHere are the user's current todos:\n${todos.map((t: any, i: number) => 
          `${i + 1}. ${t.item} (Quantity: ${t.quantity}${t.description ? `, Description: ${t.description}` : ''})${t.checked ? ' [COMPLETED]' : ''}`
        ).join('\n')}`
      : '\n\nThe user does not have any todos registered yet.'

    let actionContext = ''
    if (action.type !== 'none') {
      actionContext = `\n\n⚠️ IMPORTANT: An action was executed in the system:\n${action.message}\n\nYou must confirm this action in your response in a clear and friendly way.`
    }

    const systemPrompt = `You are an intelligent assistant for task management (todos). 
You help users create, manage and organize their tasks.

${todosContext}${actionContext}

When the user asks to create a todo, you should respond clearly and confirm the creation.
When the user asks to list todos, show the list in an organized way.
When an action is executed (create, update or delete), confirm the action clearly and friendly.
Always be friendly, helpful and objective in your responses.`

    const completionParams: any = {
      model: openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    }

    if (openaiModel.includes('gpt-5') || openaiModel.includes('gpt-4o')) {
      if (openaiModel.includes('nano')) {
        completionParams.max_completion_tokens = 2000
      } else {
        completionParams.max_completion_tokens = 500
        completionParams.temperature = 0.7
      }
    } else {
      completionParams.max_tokens = 500
      completionParams.temperature = 0.7
    }

    console.log('📤 Sending request to OpenAI:', {
      model: openaiModel,
      messageLength: message.length,
      todosCount: todos?.length || 0
    })

    const completion = await openai.chat.completions.create(completionParams)

    console.log('📥 Response received:', {
      hasChoices: !!completion.choices,
      choicesLength: completion.choices?.length || 0,
      firstChoice: completion.choices?.[0] ? {
        hasMessage: !!completion.choices[0].message,
        hasContent: !!completion.choices[0].message?.content,
        contentLength: completion.choices[0].message?.content?.length || 0,
        finishReason: completion.choices[0].finish_reason
      } : null
    })

    let response = completion.choices[0]?.message?.content

    if (!response || response.trim() === '') {
      const finishReason = completion.choices[0]?.finish_reason
      const usage = completion.usage
      const reasoningTokens = usage?.completion_tokens_details?.reasoning_tokens || 0
      
      console.warn('⚠️ Empty response from API:', {
        finishReason,
        usage,
        model: completion.model,
        hasReasoningTokens: reasoningTokens > 0,
        reasoningTokens,
        actionExecuted: action.type !== 'none'
      })

      if (action.type !== 'none' && action.message) {
        response = action.message
        console.log('✅ Using action message as response:', response)
        console.log('✅ Action that will be returned:', { type: action.type, data: action.data })
      } else if (finishReason === 'length' && reasoningTokens > 0) {
        throw new Error(`The model reached the reasoning token limit (${reasoningTokens} tokens). Try increasing max_completion_tokens or using a different model.`)
      } else if (finishReason === 'length') {
        throw new Error('The model reached the token limit. The response was truncated. Try increasing max_completion_tokens.')
      } else {
        throw new Error(`The API returned an empty response. Finish reason: ${finishReason || 'unknown'}`)
      }
    }

    const responseData = { 
      message: response,
      action: action.type !== 'none' ? {
        type: action.type,
        data: action.data
      } : null
    }
    
    console.log('📤 Sending response:', {
      hasMessage: !!responseData.message,
      messageLength: responseData.message?.length || 0,
      hasAction: !!responseData.action,
      actionType: responseData.action?.type || 'none'
    })

    if (action.type === 'none') {
      requestCache.set(cacheKey, {
        response: responseData,
        timestamp: Date.now()
      })

      if (requestCache.size > 100) {
        const firstKey = requestCache.keys().next().value
        if (firstKey) {
          requestCache.delete(firstKey)
        }
      }
    } else {
      console.log(`✅ Action executed: ${action.type}`, action.data)
    }

    res.json(responseData)
  } catch (error: any) {
    console.error('Chat error:', {
      status: error?.status,
      message: error?.message,
      type: error?.type,
      code: error?.code
    })
    
    let errorMessage = 'Sorry, an error occurred while processing your message.'
    let statusCode = error?.status || 500
    
    if (error?.status === 429) {
      const errorResponse = error?.response?.data || error?.error || {}
      const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('exceeded') || errorResponse?.error?.message?.includes('quota')
      
      if (isQuotaExceeded) {
        errorMessage = `❌ OpenAI API credits exhausted!\n\nYour account has 0 credits available.\n\nTo continue using:\n1. Visit: https://platform.openai.com/account/billing\n2. Add credits to your account\n3. Check your usage at: https://platform.openai.com/usage\n\n💡 Tip: You can add credits via credit card on the OpenAI platform.`
      } else {
        const retryAfter = error?.headers?.['retry-after'] || error?.response?.headers?.['retry-after']
        errorMessage = `⏱️ Request limit exceeded. ${retryAfter ? `Try again in ${retryAfter} seconds.` : 'Please wait a moment before trying again.'}\n\nPlease check:\n1. Your plan and credits at: https://platform.openai.com/account/billing\n2. Your usage at: https://platform.openai.com/usage`
      }
    } else if (error?.status === 401) {
      errorMessage = 'OpenAI API key is invalid or expired. Please check:\n\n1. If the key is correct in the .env file (no extra spaces)\n2. If the key has not expired at: https://platform.openai.com/api-keys\n3. If the key has permissions to use the API\n\nTip: Make sure there are no spaces or line breaks in the key in the .env file'
    } else if (error?.status === 404) {
      errorMessage = 'Model not found or no access. Please check if you have access to the configured model.'
    } else if (error?.message) {
      if (error.message.includes('quota') || error.message.includes('exceeded') || error.message.includes('billing')) {
        errorMessage = `❌ OpenAI API credits exhausted!\n\n${error.message}\n\nTo continue using:\n1. Visit: https://platform.openai.com/account/billing\n2. Add credits to your account\n3. Check your usage at: https://platform.openai.com/usage`
        statusCode = 429
      } else {
        errorMessage = `Error: ${error.message}`
      }
    }
    
    res.status(statusCode).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: errorMessage,
      status: statusCode
    })
  }
})

export default router

