// Simple Express server for CopilotKit runtime with MCP support
// Run this with: node server.js

import express from 'express'
import cors from 'cors'
import { CopilotRuntime } from '@copilotkit/runtime'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// MCP Server Configuration
// Configure your MCP server SSE endpoint here
const mcpServers = [
  {
    name: process.env.MCP_SERVER_NAME || 'todos-mcp',
    url: process.env.MCP_SERVER_URL || 'http://localhost:3002/sse',
  },
]

// Initialize CopilotKit runtime with MCP servers
const runtime = new CopilotRuntime({
  mcpServers: mcpServers.length > 0 ? mcpServers.map(server => ({
    name: server.name,
    url: server.url,
  })) : undefined,
})

// Debug: Log available runtime methods
console.log('CopilotKit Runtime methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(runtime)))
console.log('Runtime instance methods:', Object.keys(runtime))

// Use the runtime as Express middleware for all CopilotKit endpoints
// This automatically handles agent registration and all CopilotKit requests
app.use('/api/copilotkit', async (req, res, next) => {
  try {
    // Try different methods to handle the request
    if (typeof runtime.requestHandler === 'function') {
      const handler = runtime.requestHandler()
      await handler(req, res)
      return
    } else if (typeof runtime.handleRequest === 'function') {
      await runtime.handleRequest(req, res)
      return
    } else if (typeof runtime.handler === 'function') {
      const handler = runtime.handler()
      await handler(req, res)
      return
    }
    
    // Fallback: handle info endpoint manually
    if (req.method === 'GET' && req.path.includes('/info')) {
      res.json({
        agents: {
          default: {
            name: 'default',
            description: 'Default CopilotKit agent',
          },
        },
        mcpServers: mcpServers.map(s => ({ name: s.name, url: s.url })),
      })
      return
    }
    
    // If no handler found, pass to next middleware
    next()
  } catch (error) {
    console.error('CopilotKit runtime error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Also handle GET requests for health checks
app.get('/api/copilotkit', (req, res) => {
  res.json({ status: 'CopilotKit runtime is running', mcpServers: mcpServers.length })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mcpServers: mcpServers.length,
    servers: mcpServers.map(s => ({ name: s.name, url: s.url }))
  })
})

app.listen(PORT, () => {
  console.log(`🚀 CopilotKit runtime server running on http://localhost:${PORT}`)
  console.log(`📡 MCP servers configured: ${mcpServers.length}`)
  if (mcpServers.length > 0) {
    mcpServers.forEach(server => {
      console.log(`   ✓ ${server.name}: ${server.url}`)
    })
  } else {
    console.log(`   ⚠ No MCP servers configured. Set MCP_SERVER_URL environment variable.`)
  }
  console.log(`\n💡 Frontend should connect to: http://localhost:${PORT}/api/copilotkit`)
})

