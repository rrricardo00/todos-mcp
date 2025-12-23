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
  console.error('❌ Erro: OPENAI_API_KEY é obrigatória!')
  console.error('Configure a variável OPENAI_API_KEY no arquivo .env na pasta server/')
  console.error('Caminho esperado:', join(__dirname, '../../.env'))
  console.error('Variáveis carregadas do .env:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasModel: !!process.env.OPENAI_MODEL,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPENAI'))
  })
} else {
  const keyPreview = openaiApiKey.substring(0, 7) + '...' + openaiApiKey.substring(openaiApiKey.length - 4)
  const keyLength = openaiApiKey.length
  console.log(`✅ OpenAI API Key carregada: ${keyPreview} (${keyLength} caracteres)`)
  console.log(`✅ Modelo configurado: ${openaiModel}`)
  
  if (!openaiApiKey.startsWith('sk-')) {
    console.warn('⚠️  ATENÇÃO: A chave não começa com "sk-" - pode estar incorreta!')
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
        message: 'Muitas requisições. Por favor, aguarde um momento antes de tentar novamente.'
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
        console.log('📦 Resposta do cache')
        return res.json(cached.response)
      }
    }
    
    const todosContext = todos && todos.length > 0 
      ? `\n\nAqui estão os todos atuais do usuário:\n${todos.map((t: any, i: number) => 
          `${i + 1}. ${t.item} (Quantidade: ${t.quantity}${t.description ? `, Descrição: ${t.description}` : ''})${t.checked ? ' [CONCLUÍDO]' : ''}`
        ).join('\n')}`
      : '\n\nO usuário ainda não tem todos cadastrados.'

    let actionContext = ''
    if (action.type !== 'none') {
      actionContext = `\n\n⚠️ IMPORTANTE: Uma ação foi executada no sistema:\n${action.message}\n\nVocê deve confirmar esta ação na sua resposta de forma clara e amigável.`
    }

    const systemPrompt = `Você é um assistente inteligente para gerenciamento de tarefas (todos). 
Você ajuda os usuários a criar, gerenciar e organizar suas tarefas.

${todosContext}${actionContext}

Quando o usuário pedir para criar um todo, você deve responder de forma clara e confirmar a criação.
Quando o usuário pedir para listar todos, mostre a lista de forma organizada.
Quando uma ação for executada (criar, atualizar ou deletar), confirme a ação de forma clara e amigável.
Seja sempre amigável, útil e objetivo nas respostas.`

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

    console.log('📤 Enviando requisição para OpenAI:', {
      model: openaiModel,
      messageLength: message.length,
      todosCount: todos?.length || 0
    })

    const completion = await openai.chat.completions.create(completionParams)

    console.log('📥 Resposta recebida:', {
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
      
      console.warn('⚠️ Resposta vazia da API:', {
        finishReason,
        usage,
        model: completion.model,
        hasReasoningTokens: reasoningTokens > 0,
        reasoningTokens,
        actionExecuted: action.type !== 'none'
      })

      if (action.type !== 'none' && action.message) {
        response = action.message
        console.log('✅ Usando mensagem da ação como resposta:', response)
        console.log('✅ Action que será retornada:', { type: action.type, data: action.data })
      } else if (finishReason === 'length' && reasoningTokens > 0) {
        throw new Error(`O modelo atingiu o limite de tokens de raciocínio (${reasoningTokens} tokens). Tente aumentar max_completion_tokens ou usar um modelo diferente.`)
      } else if (finishReason === 'length') {
        throw new Error('O modelo atingiu o limite de tokens. A resposta foi cortada. Tente aumentar max_completion_tokens.')
      } else {
        throw new Error(`A API retornou uma resposta vazia. Finish reason: ${finishReason || 'unknown'}`)
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
      console.log(`✅ Ação executada: ${action.type}`, action.data)
    }

    res.json(responseData)
  } catch (error: any) {
    console.error('Chat error:', {
      status: error?.status,
      message: error?.message,
      type: error?.type,
      code: error?.code
    })
    
    let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem.'
    let statusCode = error?.status || 500
    
    if (error?.status === 429) {
      const errorResponse = error?.response?.data || error?.error || {}
      const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('exceeded') || errorResponse?.error?.message?.includes('quota')
      
      if (isQuotaExceeded) {
        errorMessage = `❌ Créditos da API do OpenAI esgotados!\n\nSua conta está com 0 créditos disponíveis.\n\nPara continuar usando:\n1. Acesse: https://platform.openai.com/account/billing\n2. Adicione créditos à sua conta\n3. Verifique seu uso em: https://platform.openai.com/usage\n\n💡 Dica: Você pode adicionar créditos via cartão de crédito na plataforma OpenAI.`
      } else {
        const retryAfter = error?.headers?.['retry-after'] || error?.response?.headers?.['retry-after']
        errorMessage = `⏱️ Limite de requisições excedido. ${retryAfter ? `Tente novamente em ${retryAfter} segundos.` : 'Aguarde um momento antes de tentar novamente.'}\n\nPor favor, verifique:\n1. Seu plano e créditos em: https://platform.openai.com/account/billing\n2. Seu uso em: https://platform.openai.com/usage`
      }
    } else if (error?.status === 401) {
      errorMessage = 'Chave da API do OpenAI inválida ou expirada. Verifique:\n\n1. Se a chave está correta no arquivo .env (sem espaços extras)\n2. Se a chave não expirou em: https://platform.openai.com/api-keys\n3. Se a chave tem permissões para usar a API\n\nDica: Certifique-se de que não há espaços ou quebras de linha na chave no arquivo .env'
    } else if (error?.status === 404) {
      errorMessage = 'Modelo não encontrado ou sem acesso. Verifique se você tem acesso ao modelo configurado.'
    } else if (error?.message) {
      if (error.message.includes('quota') || error.message.includes('exceeded') || error.message.includes('billing')) {
        errorMessage = `❌ Créditos da API do OpenAI esgotados!\n\n${error.message}\n\nPara continuar usando:\n1. Acesse: https://platform.openai.com/account/billing\n2. Adicione créditos à sua conta\n3. Verifique seu uso em: https://platform.openai.com/usage`
        statusCode = 429
      } else {
        errorMessage = `Erro: ${error.message}`
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

