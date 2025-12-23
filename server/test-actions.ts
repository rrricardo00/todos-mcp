#!/usr/bin/env tsx

/**
 * Test script to verify action detection
 */

import { processTodoAction } from './services/todoActionService.js'

const testMessages = [
  'Crie um todo para comprar leite',
  'Adicione um todo: Comprar leite',
  'Criar todo para comprar leite',
  'Delete o todo de comprar leite',
  'Liste meus todos',
  'Atualize o todo de comprar leite para quantidade 5',
]

async function testActions() {
  console.log('Testing action detection...\n')
  
  for (const message of testMessages) {
    console.log(`Testing: "${message}"`)
    const result = await processTodoAction(message, [])
    console.log(`Result: type=${result.type}, hasMessage=${!!result.message}`)
    if (result.message) {
      console.log(`Message: ${result.message}`)
    }
    console.log('---\n')
  }
}

testActions().catch(console.error)
