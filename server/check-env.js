import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPath = join(__dirname, '.env')

console.log('🔍 Verificando configuração do ambiente...\n')

if (!existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!')
  console.error(`   Caminho esperado: ${envPath}`)
  console.error('\n💡 Execute: npm run create-env')
  process.exit(1)
}

console.log(`✅ Arquivo .env encontrado: ${envPath}\n`)

dotenv.config({ path: envPath })

const requiredVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
}

const optionalVars = {
  'OPENAI_MODEL': process.env.OPENAI_MODEL || 'gpt-3.5-turbo (padrão)',
  'PORT': process.env.PORT || '3001 (padrão)',
}

console.log('📋 Variáveis obrigatórias:')
let hasErrors = false
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    const preview = key.includes('KEY') 
      ? value.substring(0, 7) + '...' + value.substring(value.length - 4)
      : value.length > 50 
        ? value.substring(0, 50) + '...'
        : value
    console.log(`   ✅ ${key}: ${preview}`)
    
    if (value.includes(' ') || value.includes('\n') || value.includes('\r')) {
      console.log(`   ⚠️  ATENÇÃO: ${key} contém espaços ou quebras de linha!`)
      hasErrors = true
    }
  } else {
    console.log(`   ❌ ${key}: NÃO CONFIGURADA`)
    hasErrors = true
  }
}

console.log('\n📋 Variáveis opcionais:')
for (const [key, value] of Object.entries(optionalVars)) {
  console.log(`   ℹ️  ${key}: ${value}`)
}

if (hasErrors) {
  console.log('\n❌ Algumas variáveis obrigatórias não estão configuradas!')
  console.log('   Edite o arquivo .env e configure as variáveis faltantes.')
  process.exit(1)
}

console.log('\n✅ Todas as variáveis obrigatórias estão configuradas!')

const envContent = readFileSync(envPath, 'utf-8')
const lines = envContent.split('\n')
const openaiKeyLine = lines.find(line => line.startsWith('OPENAI_API_KEY='))

if (openaiKeyLine) {
  const keyValue = openaiKeyLine.split('=')[1]?.trim()
  if (keyValue && !keyValue.startsWith('sk-')) {
    console.log('\n⚠️  ATENÇÃO: A chave OPENAI_API_KEY não parece estar no formato correto!')
    console.log('   Deve começar com "sk-"')
  }
  if (keyValue && keyValue.length < 20) {
    console.log('\n⚠️  ATENÇÃO: A chave OPENAI_API_KEY parece muito curta!')
  }
}

console.log('\n✨ Configuração verificada com sucesso!')

