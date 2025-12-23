import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPath = join(__dirname, '.env')

if (existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const apiKey = process.env.OPENAI_API_KEY || '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'

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY não encontrada!')
  process.exit(1)
}

console.log('🔍 Testando chave da API do OpenAI...\n')
console.log(`Chave: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}\n`)

try {
  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    }
  })

  console.log(`Status: ${response.status} ${response.statusText}\n`)

  if (response.ok) {
    const data = await response.json()
    console.log('✅ Chave da API está funcionando!\n')
    console.log(`📊 Total de modelos disponíveis: ${data.data?.length || 0}\n`)
    
    if (data.data && data.data.length > 0) {
      console.log('📋 Primeiros modelos disponíveis:')
      data.data.slice(0, 10).forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.id}`)
      })
    }
  } else {
    const errorData = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
    console.error('❌ Erro ao testar a chave:\n')
    console.error(JSON.stringify(errorData, null, 2))
    
    if (response.status === 401) {
      console.error('\n💡 Possíveis causas:')
      console.error('   - Chave inválida ou expirada')
      console.error('   - Chave revogada')
      console.error('   - Espaços ou caracteres extras na chave')
      console.error('\n🔗 Verifique suas chaves em: https://platform.openai.com/api-keys')
    } else if (response.status === 429) {
      console.error('\n💡 Cota da API excedida')
      console.error('🔗 Verifique seu uso em: https://platform.openai.com/usage')
    }
  }
} catch (error) {
  console.error('❌ Erro ao fazer requisição:', error.message)
  if (error.message.includes('fetch')) {
    console.error('\n💡 Verifique sua conexão com a internet')
  }
}

