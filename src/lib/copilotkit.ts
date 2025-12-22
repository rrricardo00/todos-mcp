// CopilotKit Cloud Configuration
// This file configures CopilotKit to use the cloud service

export const copilotKitConfig = {
  // Public API Key - Required for CopilotKit Cloud
  // Get your API key from https://www.copilotkit.ai
  publicApiKey: import.meta.env.VITE_COPILOTKIT_PUBLIC_API_KEY || 'ck_pub_c7f38a7ffb68aebd27e9b36361b2f79c',
  
  // Optional: Custom runtime URL (only needed for self-hosted setups)
  // If not provided, CopilotKit will use the cloud service automatically
  runtimeUrl: import.meta.env.VITE_COPILOTKIT_RUNTIME_URL,
  
  // MCP Server Configuration (for self-hosted runtime only)
  // When using CopilotKit Cloud, MCP servers are configured in the CopilotKit dashboard
  mcpServerUrl: import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3002/sse',
  mcpServerName: import.meta.env.VITE_MCP_SERVER_NAME || 'todos-mcp',
}

