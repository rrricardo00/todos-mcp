# CopilotKit Cloud "Method Parameter" Error Fix

## Error
```
Agent execution failed: Error: HTTP 400: 
Unexpected parameter "method" in the request body.
```

## Cause
CopilotKit client is sending requests with a "method" parameter that CopilotKit Cloud API doesn't accept. This is a known compatibility issue between CopilotKit 1.50.1 and the Cloud API.

## Solutions

### Solution 1: Check for Updates
Check if there's a newer version of CopilotKit that fixes this issue:

```bash
npm view @copilotkit/react-core versions --json
```

### Solution 2: Verify API Key
Ensure your API key is correct and active:
- Go to [CopilotKit Dashboard](https://www.copilotkit.ai)
- Verify your API key is active
- Check if there are any account limitations

### Solution 3: Contact CopilotKit Support
This appears to be a bug in the CopilotKit Cloud API or client library. Contact support:
- GitHub Issues: https://github.com/CopilotKit/CopilotKit/issues
- Email: support@copilotkit.ai

### Solution 4: Temporary Workaround - Use Self-Hosted Runtime
If you need a working solution immediately, you can use a self-hosted runtime:

1. Set up a local CopilotKit runtime server
2. Update `.env`:
   ```env
   VITE_COPILOTKIT_RUNTIME_URL=/api/copilotkit
   ```
3. Run the local server: `npm run dev:server`

## Current Configuration

Your app is correctly configured for Cloud:
- ✅ Only `publicApiKey` is set (no `runtimeUrl`)
- ✅ Using latest CopilotKit version (1.50.1)
- ✅ React deduplication configured in Vite

## Next Steps

1. **Check CopilotKit GitHub** for known issues or fixes
2. **Update packages** if a new version is released:
   ```bash
   npm update @copilotkit/react-core @copilotkit/react-ui
   ```
3. **Monitor CopilotKit releases** for a fix

## Status
This is a known issue that needs to be fixed by the CopilotKit team. The configuration in your app is correct.

