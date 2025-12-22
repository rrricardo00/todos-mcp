# CopilotKit Cloud Configuration Guide

This guide will help you set up and configure CopilotKit Cloud for your todo app.

## Step 1: Get Your CopilotKit Cloud API Key

1. **Sign up/Login** at [https://www.copilotkit.ai](https://www.copilotkit.ai)
2. **Navigate to Dashboard** → Settings → API Keys
3. **Copy your Public API Key** (starts with `ck_pub_`)

## Step 2: Configure Environment Variables

### Option A: Using `.env` file (Recommended)

Create or update your `.env` file in the project root:

```env
VITE_COPILOTKIT_PUBLIC_API_KEY=ck_pub_c7f38a7ffb68aebd27e9b36361b2f79c
```

**Note:** The `.env` file is already in `.gitignore`, so your API key won't be committed to version control.

### Option B: Using the code directly (Not Recommended for Production)

The API key is already set as a fallback in `src/App.tsx`:

```typescript
const publicApiKey = import.meta.env.VITE_COPILOTKIT_PUBLIC_API_KEY || 'ck_pub_c7f38a7ffb68aebd27e9b36361b2f79c'
```

## Step 3: Verify Configuration

Your app is already configured to use CopilotKit Cloud. Check `src/App.tsx`:

```typescript
const copilotKitProps = {
  publicApiKey,  // Required for Cloud
  // runtimeUrl is optional - only needed for self-hosted
}
```

## Step 4: Configure Agents in CopilotKit Cloud Dashboard

**IMPORTANT:** You must configure at least one agent in the CopilotKit Cloud dashboard:

1. **Go to CopilotKit Dashboard** → [https://www.copilotkit.ai](https://www.copilotkit.ai)
2. **Navigate to Agents** section
3. **Create a new agent** or configure the default agent:
   - Agent ID: `default` (required)
   - Name: `Todo Assistant` (or your preferred name)
   - Instructions: `You are a helpful assistant for managing todos. You can help users add, edit, and delete todos from their list.`
4. **Save the configuration**

Without a registered agent, you'll see the error: "Agent 'default' not found"

## Step 5: Configure MCP Servers (Optional)

If you want to use MCP (Model Context Protocol) servers with CopilotKit Cloud:

1. **Go to CopilotKit Dashboard** → MCP Servers
2. **Add your MCP server**:
   - Name: `todos-mcp` (or your preferred name)
   - URL: Your MCP server SSE endpoint (e.g., `http://localhost:3002/sse`)
3. **Save the configuration**

The MCP servers configured in the dashboard will be automatically available to your app.

## Step 6: Run Your Application

```bash
npm run dev
```

The app will automatically connect to CopilotKit Cloud using your API key. No local server needed!

## Troubleshooting

### Issue: "Agent 'default' not found"

**Solution:** 
1. **Go to CopilotKit Cloud Dashboard** → Agents
2. **Create or configure the 'default' agent**:
   - Agent ID must be exactly `default`
   - Add instructions for the agent
   - Save the configuration
3. **Refresh your app** - the agent should now be available

**Note:** Agents must be configured in the CopilotKit Cloud dashboard. They cannot be registered directly in code when using Cloud service.

### Issue: "Failed to load runtime info"

**Solution:** 
- Verify your API key is correct
- Check that you have an active CopilotKit Cloud account
- Ensure your internet connection is working

### Issue: MCP servers not working

**Solution:**
- Verify MCP servers are configured in the CopilotKit Cloud dashboard
- Check that your MCP server is running and accessible
- Ensure the MCP server URL is correct in the dashboard

## Configuration Options

### Using CopilotKit Cloud (Current Setup)
- ✅ Only need `VITE_COPILOTKIT_PUBLIC_API_KEY`
- ✅ No local server required
- ✅ MCP servers configured in dashboard
- ✅ Automatic scaling and updates

### Using Self-Hosted Runtime (Alternative)
If you prefer to self-host:

1. Set `VITE_COPILOTKIT_RUNTIME_URL=/api/copilotkit` in `.env`
2. Run `npm run dev:server` to start the local runtime
3. The app will use the local server instead of Cloud

## Next Steps

1. ✅ Your API key is configured: `ck_pub_c7f38a7ffb68aebd27e9b36361b2f79c`
2. ✅ Your app is set up to use CopilotKit Cloud
3. 🚀 Run `npm run dev` to start your app
4. 📝 Configure MCP servers in the dashboard if needed

## Resources

- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [CopilotKit Dashboard](https://www.copilotkit.ai)
- [MCP Server Setup Guide](https://docs.copilotkit.ai/mcp)

