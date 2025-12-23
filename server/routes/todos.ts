import { Router } from 'express'
import { supabase } from '../index.js'

export const todosRouter = Router()

// Get all todos
todosRouter.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Get single todo
todosRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Create todo
todosRouter.post('/', async (req, res) => {
  try {
    const { item, quantity = 1, description = '' } = req.body

    if (!item) {
      return res.status(400).json({ error: 'Item is required' })
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([{ item, quantity, description }])
      .select()

    if (error) throw error
    res.json(data?.[0] || null)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Update todo
todosRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { item, quantity, description } = req.body

    const updates: any = {}
    if (item !== undefined) updates.item = item
    if (quantity !== undefined) updates.quantity = quantity
    if (description !== undefined) updates.description = description

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    res.json(data?.[0] || null)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Delete todo
todosRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ success: true, id })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Get todos count
todosRouter.get('/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    res.json({ count: count || 0 })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})
