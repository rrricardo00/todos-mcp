import { supabase } from '../index.js'

interface TodoAction {
  type: 'create' | 'update' | 'delete' | 'list' | 'get' | 'none'
  data?: any
  message?: string
}

/**
 * Processa comandos do usuário e executa ações nos todos
 */
export async function processTodoAction(userMessage: string, todos: any[]): Promise<TodoAction> {
  const lowerMessage = userMessage.toLowerCase().trim()
  console.log('[todoActionService] Processing:', userMessage, 'Todos count:', todos.length)

  // IMPORTANT: Check for actions in order: Create, Update, Delete, then List
  // This ensures actions are executed before informational queries

  // Create todo - check FIRST
  let item = ''
  let quantity = 1
  let description = ''
  let shouldCreate = false

  // Check if message contains create keywords AND todo
  const hasCreateKeyword = /(?:create|add|new|make|criar|adicionar|fazer)/i.test(lowerMessage)
  const hasTodoKeyword = /todo/i.test(lowerMessage)
  
  if (hasCreateKeyword && hasTodoKeyword) {
    shouldCreate = true
    console.log('[Create] Keywords detected, extracting item...')
    
    // Pattern 1: "criar todo para comprar leite" or "criar um todo para comprar leite"
    let pattern1 = userMessage.match(/(?:criar|adicionar|fazer|create|add|make).*todo.*(?:para|for|:)?\s+(.+?)(?:\s+com|\s+quantity|\s+quantidade|$)/i)
    if (!pattern1) {
      pattern1 = userMessage.match(/(?:criar|adicionar|fazer|create|add|make).*um?\s*todo.*(?:para|for|:)?\s+(.+?)(?:\s+com|\s+quantity|\s+quantidade|$)/i)
    }
    if (pattern1 && pattern1[1]) {
      item = pattern1[1].trim()
      console.log('[Create] Pattern 1 matched:', item)
    }
    
    // Pattern 2: "todo para comprar leite" or "todo: comprar leite"
    if (!item || item.length < 2) {
      const pattern2 = userMessage.match(/todo.*(?:para|for|:)?\s+(.+?)(?:\s+com|\s+quantity|\s+quantidade|$)/i)
      if (pattern2 && pattern2[1]) {
        item = pattern2[1].trim()
        console.log('[Create] Pattern 2 matched:', item)
      }
    }
    
    // Pattern 3: "criar um todo de comprar leite"
    if (!item || item.length < 2) {
      const pattern3 = userMessage.match(/(?:criar|adicionar|fazer).*todo.*(?:de|of)?\s+(.+)/i)
      if (pattern3 && pattern3[1]) {
        item = pattern3[1].trim()
        console.log('[Create] Pattern 3 matched:', item)
      }
    }

    // Clean up item name - remove common words
    if (item) {
      item = item
        .replace(/^(para|for|de|of|a|an|o|a)\s+/i, '') // Remove leading prepositions
        .trim()
    }

    // Extract quantity from the full message
    const qtyMatch = userMessage.match(/(?:com\s+)?quantidade:?\s*(\d+(?:\.\d+)?)|quantity:?\s*(\d+(?:\.\d+)?)/i)
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1] || qtyMatch[2])
      console.log('[Create] Quantity extracted:', quantity)
      // Remove quantity from item name
      if (item) {
        item = item.replace(/(?:com\s+)?quantidade:?\s*\d+(?:\.\d+)?/i, '').replace(/quantity:?\s*\d+(?:\.\d+)?/i, '').trim()
      }
    }

    // Extract description
    const descMatch = userMessage.match(/descrição:?\s*(.+?)(?:\s+quantidade|\s+quantity|$)|description:?\s*(.+?)(?:\s+quantity|$)/i)
    if (descMatch) {
      description = (descMatch[1] || descMatch[2] || '').trim()
      console.log('[Create] Description extracted:', description)
      // Remove description from item name
      if (item) {
        item = item.replace(/descrição:?.+/i, '').replace(/description:?.+/i, '').trim()
      }
    }

    if (shouldCreate && item && item.length >= 2) {
      console.log('[Create] Executing create - item:', item, 'quantity:', quantity, 'description:', description)
      
      try {
        console.log('[Create] Inserting todo:', { item, quantity, description })
        const { data, error } = await supabase
          .from('todos')
          .insert([{ item, quantity, description }])
          .select()

        if (error) {
          console.error('[Create] Supabase error:', error)
          throw error
        }

        console.log('[Create] Todo created successfully:', data?.[0])
        return {
          type: 'create',
          data: data?.[0],
          message: `✅ Todo criado: "${data?.[0]?.item}" (Quantidade: ${data?.[0]?.quantity}${data?.[0]?.description ? `, Descrição: ${data?.[0]?.description}` : ''})`
        }
      } catch (error) {
        console.error('[Create] Error creating todo:', error)
        return {
          type: 'none',
          message: `Erro ao criar todo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
      }
    } else if (shouldCreate) {
      return {
        type: 'none',
        message: 'Preciso do nome do item para criar um todo. Por exemplo: "Crie um todo para comprar leite" ou "Adicione um todo: Comprar leite"'
      }
    }
  }

  // Update todo (by ID or by name) - check SECOND
  if (lowerMessage.match(/(?:update|change|modify|edit|atualizar|alterar|modificar).*todo/i)) {
    let todo = null
    let todoId = ''

    // Try to find by ID first
    const idMatch = lowerMessage.match(/(?:id|com\s+id)\s+([a-f0-9-]+)/i)
    if (idMatch) {
      todoId = idMatch[1]
      todo = todos.find(t => t.id === todoId)
    } else {
      // Try to find by name
      const nameMatch = userMessage.match(/todo.*(?:de|para|for)?\s+(.+?)(?:\s+para|\s+com|\s+quantity|\s+quantidade|$)/i)
      if (nameMatch) {
        const searchTerm = nameMatch[1].trim().toLowerCase()
        todo = todos.find(t => t.item.toLowerCase().includes(searchTerm))
        if (todo) todoId = todo.id
      }
    }

    if (!todo) {
      return {
        type: 'none',
        message: 'Não encontrei o todo para atualizar. Tente especificar o ID ou o nome do todo.'
      }
    }

    const updates: any = {}

    // Extract quantity
    const qtyMatch = lowerMessage.match(/(?:quantity|quantidade):?\s*(\d+(?:\.\d+)?)|(?:para|to)\s+(\d+(?:\.\d+)?)/i)
    if (qtyMatch) {
      updates.quantity = parseFloat(qtyMatch[1] || qtyMatch[2])
    }

    // Extract description
    const descMatch = userMessage.match(/(?:description|descrição):?\s*(.+?)(?:\s+quantity|\s+quantidade|$)/i)
    if (descMatch) {
      updates.description = descMatch[1].trim()
    }

    // Extract new item name
    const itemMatch = userMessage.match(/(?:item|nome):?\s*(.+?)(?:\s+quantity|\s+description|\s+quantidade|\s+descrição|$)/i)
    if (itemMatch) {
      updates.item = itemMatch[1].trim()
    }

    if (Object.keys(updates).length === 0) {
      return {
        type: 'none',
        message: 'Preciso saber o que atualizar. Especifique quantidade, descrição ou item. Exemplo: "Atualize o todo de comprar leite para quantidade 5"'
      }
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', todoId)
        .select()

      if (error) throw error

      return {
        type: 'update',
        data: data?.[0],
        message: `✅ Todo atualizado: "${data?.[0]?.item}" (Quantidade: ${data?.[0]?.quantity}${data?.[0]?.description ? `, Descrição: ${data?.[0]?.description}` : ''})`
      }
    } catch (error) {
      return {
        type: 'none',
        message: `Erro ao atualizar todo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  // Delete todo (by ID or by name) - check THIRD
  if (lowerMessage.match(/(?:delete|remove|deletar|remover).*todo/i)) {
    console.log('Delete command detected')
    let todo = null
    let todoId = ''

    // Try to find by ID first
    const idMatch = lowerMessage.match(/(?:id|com\s+id)\s+([a-f0-9-]+)/i)
    if (idMatch) {
      todoId = idMatch[1]
      todo = todos.find(t => t.id === todoId)
      console.log('Found by ID:', todoId, todo ? 'Found' : 'Not found')
    } else {
      // Try to find by name - improved pattern
      const namePatterns = [
        /todo.*(?:de|para|for)\s+(.+?)(?:\s+para|\s+com|$)/i,
        /todo\s+(.+?)(?:\s+para|\s+com|$)/i,
        /(?:deletar|remover|delete|remove)\s+(.+)/i
      ]
      
      for (const pattern of namePatterns) {
        const nameMatch = userMessage.match(pattern)
        if (nameMatch) {
          const searchTerm = nameMatch[1].trim().toLowerCase()
          console.log('Searching for todo with term:', searchTerm)
          todo = todos.find(t => t.item.toLowerCase().includes(searchTerm))
          if (todo) {
            todoId = todo.id
            console.log('Found todo by name:', todo.item, 'ID:', todoId)
            break
          }
        }
      }
    }

    if (!todo) {
      console.log('Todo not found for deletion')
      return {
        type: 'none',
        message: `Não encontrei o todo para deletar. Você tem ${todos.length} todos. Tente: "Delete o todo de [nome]" ou liste os todos primeiro.`
      }
    }

    try {
      console.log('Deleting todo:', todoId, todo.item)
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }

      console.log('Todo deleted successfully')
      return {
        type: 'delete',
        data: { id: todoId },
        message: `✅ Todo deletado: "${todo.item}"`
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      return {
        type: 'none',
        message: `Erro ao deletar todo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  // List todos (English and Portuguese) - check FOURTH
  if (lowerMessage.match(/^(list|show|get|display|fetch|liste|mostre|obter|exibir).*(all|my|the|todos|meus|os)?.*todo/i) ||
      lowerMessage.match(/^(quais|quantos).*todo/i)) {
    if (todos.length === 0) {
      return {
        type: 'list',
        data: [],
        message: 'Você não tem todos ainda. Que tal criar um?'
      }
    }
    const todosList = todos.map((t, i) => 
      `${i + 1}. ${t.item} (Qty: ${t.quantity}${t.description ? `, ${t.description}` : ''})`
    ).join('\n')
    return {
      type: 'list',
      data: todos,
      message: `Você tem ${todos.length} ${todos.length === 1 ? 'todo' : 'todos'}:\n\n${todosList}`
    }
  }

  // Get specific todo - check FIFTH
  const getMatch = lowerMessage.match(
    /(?:get|show|find|fetch|obter|mostrar|encontrar).*todo.*(?:with\s+id\s+)?([a-f0-9-]+)/i
  )
  if (getMatch) {
    const id = getMatch[1]
    const todo = todos.find(t => t.id === id)
    
    if (todo) {
      return {
        type: 'get',
        data: todo,
        message: `Todo encontrado: "${todo.item}" (Quantidade: ${todo.quantity}${todo.description ? `, Descrição: ${todo.description}` : ''})`
      }
    }
  }

  return {
    type: 'none',
    message: undefined // Let Llama handle the response
  }
}
