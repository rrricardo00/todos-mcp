# How to Start the CopilotKit Server

## The Problem
The error "Cannot convert undefined or null to object" occurs because the CopilotKit runtime server is not running.

## Solution: Start the Server

### Option 1: Start Server Only
Open a terminal and run:
```bash
npm run dev:server
```

You should see:
```
🚀 CopilotKit runtime server running on http://localhost:3001
💡 Frontend should connect to: http://localhost:3001/api/copilotkit
```

### Option 2: Start Both Servers Together (Recommended)
```bash
npm run dev:all
```

This starts:
- CopilotKit runtime server on port 3001
- Vite dev server (usually port 5173)

### Option 3: Start in Separate Terminals

**Terminal 1:**
```bash
npm run dev:server
```

**Terminal 2:**
```bash
npm run dev
```

## Verify Server is Running

1. Check if server is running: Open http://localhost:3001/health in your browser
2. You should see: `{"status":"ok","runtime":"copilotkit-self-hosted"}`

## Troubleshooting

If the server doesn't start:
1. Check if port 3001 is already in use
2. Make sure all dependencies are installed: `npm install`
3. Check the server console for error messages

## Important

**The server MUST be running** for CopilotKit to work. The frontend connects to `http://localhost:3001/api/copilotkit` via the Vite proxy.

