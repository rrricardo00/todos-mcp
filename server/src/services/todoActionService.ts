import { supabase } from '../index.js'

interface TodoAction {
  type: 'create' | 'update' | 'delete' | 'none'
  data?: any
  message?: string
}

export async function processTodoAction(userMessage: string, todos: any[]): Promise<TodoAction> {
  const lowerMessage = userMessage.toLowerCase().trim()
  console.log('[todoActionService] Processing:', userMessage, 'Todos count:', todos.length)

  let item = ''
  let quantity = 1
  let description = ''
  let shouldCreate = false

  const hasCreateKeyword = /(?:create|add|new|make|criar|adicionar|fazer)/i.test(lowerMessage)
  const hasTodoKeyword = /todo/i.test(lowerMessage)
  
  if (hasCreateKeyword && hasTodoKeyword) {
    shouldCreate = true
    console.log('[Create] Keywords detected, extracting item...')
    
    const qtyMatch = userMessage.match(/(?:com\s+)?quantidade:?\s*(\d+(?:\.\d+)?)|quantity:?\s*(\d+(?:\.\d+)?)/i)
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1] || qtyMatch[2])
      console.log('[Create] Quantity extracted:', quantity)
    }

    const descMatch = userMessage.match(/descrição:?\s*(.+?)(?:\s+quantidade|\s+quantity|$)|description:?\s*(.+?)(?:\s+quantity|$)/i)
    if (descMatch) {
      description = (descMatch[1] || descMatch[2] || '').trim()
      console.log('[Create] Description extracted:', description)
    }

    let cleanMessage = userMessage
      .replace(/(?:com\s+)?quantidade:?\s*\d+(?:\.\d+)?/gi, '')
      .replace(/quantity:?\s*\d+(?:\.\d+)?/gi, '')
      .replace(/descrição:?.+?(?:\s+quantidade|\s+quantity|$)/gi, '')
      .replace(/description:?.+?(?:\s+quantity|$)/gi, '')
      .trim()

    let pattern1 = cleanMessage.match(/(?:criar|adicionar|fazer|create|add|make).*todo.*(?:para|for|:)\s+(.+)/i)
    if (!pattern1) {
      pattern1 = cleanMessage.match(/(?:criar|adicionar|fazer|create|add|make).*um?\s*todo.*(?:para|for|:)\s+(.+)/i)
    }
    if (pattern1 && pattern1[1]) {
      item = pattern1[1].trim()
      console.log('[Create] Pattern 1 matched:', item)
    }
    
    if (!item || item.length < 2) {
      const pattern2 = cleanMessage.match(/todo.*(?:para|for|:)\s+(.+)/i)
      if (pattern2 && pattern2[1]) {
        item = pattern2[1].trim()
        console.log('[Create] Pattern 2 matched:', item)
      }
    }
    
    if (!item || item.length < 2) {
      const pattern3 = cleanMessage.match(/(?:criar|adicionar|fazer|create|add|make).*todo.*(?:de|of)\s+(.+)/i)
      if (pattern3 && pattern3[1]) {
        item = pattern3[1].trim()
        console.log('[Create] Pattern 3 matched:', item)
      }
    }

    if (!item || item.length < 2) {
      const pattern4 = cleanMessage.match(/(?:criar|adicionar|fazer|create|add|make).*todo\s+(.+)/i)
      if (pattern4 && pattern4[1]) {
        item = pattern4[1].trim()
        console.log('[Create] Pattern 4 matched:', item)
      }
    }

    if (!item || item.length < 2) {
      const pattern5 = cleanMessage.match(/todo\s+(.+)/i)
      if (pattern5 && pattern5[1]) {
        item = pattern5[1].trim()
        console.log('[Create] Pattern 5 matched:', item)
      }
    }

    if (item) {
      item = item.replace(/^(para|for|de|of|a|an|o|a)\s+/i, '').trim()
    }

    if (shouldCreate && item && item.length >= 2) {
      console.log('[Create] Executing create - item:', item, 'quantity:', quantity, 'description:', description)
      
      try {
        const { data, error } = await supabase
          .from('todos')
          .insert([{ item, quantity, description, checked: false }])
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

  const hasUpdateKeyword = /(?:update|change|modify|edit|atualizar|alterar|modificar)/i.test(lowerMessage)
  const hasTodoInUpdate = /todo/i.test(lowerMessage)
  
  if (hasUpdateKeyword && hasTodoInUpdate) {
    console.log('[Update] Keywords detected')
    let todo = null
    let todoId = ''

    const idMatch = lowerMessage.match(/(?:id|com\s+id)\s+([a-f0-9-]+)/i)
    if (idMatch) {
      todoId = idMatch[1]
      todo = todos.find(t => t.id === todoId)
      console.log('[Update] Found by ID:', todoId, todo ? 'Found' : 'Not found')
    } else {
      const namePatterns = [
        /todo.*(?:de|para|for|:)\s+(.+?)(?:\s+para|\s+com|\s+quantity|\s+quantidade|\s+com\s+quantidade|$)/i,
        /todo\s+(.+?)(?:\s+para|\s+com|\s+quantity|\s+quantidade|$)/i,
        /(?:atualizar|alterar|update|change).*todo.*(?:de|para|for|:)\s+(.+?)(?:\s+para|\s+com|\s+quantity|\s+quantidade|$)/i,
        /(?:atualizar|alterar|update|change)\s+(.+?)(?:\s+para|\s+com|\s+quantity|\s+quantidade|$)/i,
        /(?:atualizar|alterar|update|change).*todo\s+(.+?)(?:\s+para|\s+com|\s+quantity|\s+quantidade|$)/i,
        /o\s+todo\s+(.+?)(?:\s+para|\s+com|\s+quantity|\s+quantidade|$)/i
      ]
      
      for (const pattern of namePatterns) {
        const nameMatch = userMessage.match(pattern)
        if (nameMatch) {
          const searchTerm = nameMatch[1].trim().toLowerCase()
          console.log('[Update] Searching for todo with term:', searchTerm)
          todo = todos.find(t => t.item.toLowerCase().includes(searchTerm))
          if (todo) {
            todoId = todo.id
            console.log('[Update] Found todo by name:', todo.item, 'ID:', todoId)
            break
          }
        }
      }
    }

    if (!todo) {
      console.log('[Update] Todo not found. Available todos:', todos.map(t => t.item))
      return {
        type: 'none',
        message: `Não encontrei o todo para atualizar. Você tem ${todos.length} todos: ${todos.slice(0, 3).map(t => t.item).join(', ')}${todos.length > 3 ? '...' : ''}`
      }
    }

    const updates: any = {}

    const qtyPatterns = [
      /(?:quantity|quantidade|qtd):?\s*(\d+(?:\.\d+)?)/i,
      /(?:para|to|com)\s+(\d+(?:\.\d+)?)\s*(?:unidades?|units?)?/i,
      /quantidade\s+(\d+(?:\.\d+)?)/i,
      /qtd\s+(\d+(?:\.\d+)?)/i
    ]
    
    for (const pattern of qtyPatterns) {
      const qtyMatch = userMessage.match(pattern)
      if (qtyMatch) {
        updates.quantity = parseFloat(qtyMatch[1])
        console.log('[Update] Quantity extracted:', updates.quantity)
        break
      }
    }

    const descMatch = userMessage.match(/(?:description|descrição|desc):?\s*(.+?)(?:\s+quantity|\s+quantidade|$)/i)
    if (descMatch) {
      updates.description = descMatch[1].trim()
      console.log('[Update] Description extracted:', updates.description)
    }

    const itemMatch = userMessage.match(/(?:item|nome|name):?\s*(.+?)(?:\s+quantity|\s+description|\s+quantidade|\s+descrição|$)/i)
    if (itemMatch) {
      updates.item = itemMatch[1].trim()
      console.log('[Update] Item extracted:', updates.item)
    }

    if (Object.keys(updates).length === 0) {
      return {
        type: 'none',
        message: 'Preciso saber o que atualizar. Exemplo: "Atualize o todo de comprar leite para quantidade 5" ou "Altere o todo comprar leite com descrição: leite integral"'
      }
    }

    try {
      console.log('[Update] Updating todo:', todoId, 'with updates:', updates)
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', todoId)
        .select()

      if (error) {
        console.error('[Update] Supabase error:', error)
        throw error
      }

      console.log('[Update] Todo updated successfully:', data?.[0])
      return {
        type: 'update',
        data: data?.[0],
        message: `✅ Todo atualizado: "${data?.[0]?.item}" (Quantidade: ${data?.[0]?.quantity}${data?.[0]?.description ? `, Descrição: ${data?.[0]?.description}` : ''})`
      }
    } catch (error) {
      console.error('[Update] Error updating todo:', error)
      return {
        type: 'none',
        message: `Erro ao atualizar todo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  const hasDeleteKeyword = /(?:delete|remove|deletar|remover)/i.test(lowerMessage)
  const hasTodoInDelete = /todo/i.test(lowerMessage)
  
  if (hasDeleteKeyword && hasTodoInDelete) {
    console.log('[Delete] Keywords detected')
    let todo = null
    let todoId = ''

    const idMatch = lowerMessage.match(/(?:id|com\s+id)\s+([a-f0-9-]+)/i)
    if (idMatch) {
      todoId = idMatch[1]
      todo = todos.find(t => t.id === todoId)
      console.log('[Delete] Found by ID:', todoId, todo ? 'Found' : 'Not found')
    } else {
      const namePatterns = [
        /todo.*(?:de|para|for|:)\s+(.+?)(?:\s+para|\s+com|$)/i,
        /todo\s+(.+?)(?:\s+para|\s+com|$)/i,
        /(?:deletar|remover|delete|remove).*todo.*(?:de|para|for|:)\s+(.+)/i,
        /(?:deletar|remover|delete|remove)\s+(.+)/i,
        /(?:deletar|remover|delete|remove)\s+o\s+todo\s+(.+)/i,
        /o\s+todo\s+(.+?)(?:\s+para|\s+com|$)/i,
        /(?:deletar|remover|delete|remove).*todo\s+(.+)/i
      ]
      
      for (const pattern of namePatterns) {
        const nameMatch = userMessage.match(pattern)
        if (nameMatch) {
          const searchTerm = nameMatch[1].trim().toLowerCase()
          console.log('[Delete] Searching for todo with term:', searchTerm)
          todo = todos.find(t => t.item.toLowerCase().includes(searchTerm))
          if (todo) {
            todoId = todo.id
            console.log('[Delete] Found todo by name:', todo.item, 'ID:', todoId)
            break
          }
        }
      }
    }

    if (!todo) {
      console.log('[Delete] Todo not found. Available todos:', todos.map(t => t.item))
      return {
        type: 'none',
        message: `Não encontrei o todo para deletar. Você tem ${todos.length} todos: ${todos.slice(0, 3).map(t => t.item).join(', ')}${todos.length > 3 ? '...' : ''}`
      }
    }

    try {
      console.log('[Delete] Deleting todo:', todoId, todo.item)
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)

      if (error) {
        console.error('[Delete] Supabase error:', error)
        throw error
      }

      console.log('[Delete] Todo deleted successfully')
      return {
        type: 'delete',
        data: { id: todoId },
        message: `✅ Todo deletado: "${todo.item}"`
      }
    } catch (error) {
      console.error('[Delete] Error deleting todo:', error)
      return {
        type: 'none',
        message: `Erro ao deletar todo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  return {
    type: 'none',
    message: undefined
  }
}

