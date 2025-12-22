// CopilotKit Self-Hosted Runtime Server
// This bypasses the Cloud API issues

import express from 'express'
import cors from 'cors'
import { CopilotRuntime } from '@copilotkit/runtime'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize CopilotKit runtime
const runtime = new CopilotRuntime()

// Info endpoint - must return agent information
// This is called first to get available agents
app.get('/api/copilotkit/info', (req, res) => {
  try {
    console.log('Info endpoint called')
    const response = {
      agents: {
        default: {
          name: 'default',
          description: 'Default CopilotKit agent for todo management',
        },
      },
    }
    console.log('Sending response:', JSON.stringify(response, null, 2))
    res.setHeader('Content-Type', 'application/json')
    res.json(response)
  } catch (error) {
    console.error('Info endpoint error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Main CopilotKit runtime endpoint - handles all POST requests
app.post('/api/copilotkit', async (req, res) => {
  try {
    console.log('POST /api/copilotkit called', req.body)
    
    // Try to use the runtime's request handler
    if (typeof runtime.requestHandler === 'function') {
      const handler = runtime.requestHandler()
      await handler(req, res)
    } else if (typeof runtime.handleRequest === 'function') {
      await runtime.handleRequest(req, res)
    } else {
      // Fallback response
      console.warn('CopilotKit runtime handler not found, using fallback')
      res.status(200).json({ message: 'CopilotKit runtime is running' })
    }
  } catch (error) {
    console.error('CopilotKit runtime error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ error: error.message, details: error.stack })
  }
})

// Handle GET requests to main endpoint
app.get('/api/copilotkit', (req, res) => {
  res.json({ status: 'CopilotKit runtime is running' })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', runtime: 'copilotkit-self-hosted' })
})

app.listen(PORT, () => {
  console.log(`🚀 CopilotKit runtime server running on http://localhost:${PORT}`)
  console.log(`💡 Frontend should connect to: http://localhost:${PORT}/api/copilotkit`)
})

