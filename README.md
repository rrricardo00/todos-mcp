# Todo App with Supabase and CopilotKit Cloud Integration

A modern todo list application built with React, TypeScript, Vite, Supabase, and CopilotKit Cloud with MCP (Model Context Protocol) support.

## Features

- ✅ Todo list management with Supabase backend
- 🤖 CopilotKit Cloud AI assistant integration
- 🔌 MCP (Model Context Protocol) server support (via CopilotKit Cloud)
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development with Vite

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# CopilotKit Cloud Configuration
# Get your API key from https://www.copilotkit.ai
VITE_COPILOTKIT_PUBLIC_API_KEY=ck_pub_4832bc69299faac933045b4442b04ed2

# Optional: Custom runtime URL (only for self-hosted setups)
# Leave empty to use CopilotKit Cloud
# VITE_COPILOTKIT_RUNTIME_URL=/api/copilotkit
```

**Note:** When using CopilotKit Cloud, you only need the `VITE_COPILOTKIT_PUBLIC_API_KEY`. The cloud service handles all runtime operations automatically.

### 3. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a `todos` table with the following schema:

```sql
create table todos (
  id uuid default gen_random_uuid() primary key,
  item text not null,
  quantity numeric default 1,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

3. Enable Row Level Security (RLS) or configure your access policies as needed

### 4. Set Up CopilotKit Cloud

1. Sign up for a free account at [copilotkit.ai](https://www.copilotkit.ai)
2. Get your Public API Key from the dashboard
3. Add it to your `.env` file as `VITE_COPILOTKIT_PUBLIC_API_KEY`
4. Configure MCP servers in the CopilotKit Cloud dashboard (if needed)

**Note:** With CopilotKit Cloud, you don't need to run a local server. The cloud service handles all runtime operations, including MCP server connections.

### 5. Set Up MCP Server (Optional - for Self-Hosted)

If you're using a self-hosted CopilotKit runtime instead of Cloud:

1. Set up your MCP server to run on the configured URL (default: `http://localhost:3002/sse`)
2. Update `MCP_SERVER_URL` in your `.env` file to match your MCP server endpoint
3. Set `VITE_COPILOTKIT_RUNTIME_URL=/api/copilotkit` in your `.env`
4. Run the local server: `npm run dev:server`

### 6. Run the Application

#### Using CopilotKit Cloud (Recommended)
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

#### Using Self-Hosted Runtime (Optional)
```bash
# Terminal 1: Start the CopilotKit runtime server
npm run dev:server

# Terminal 2: Start the frontend
npm run dev
```

Or run both together:
```bash
npm run dev:all
```

## Project Structure

```
├── src/
│   ├── components/
│   │   └── TodoList.tsx      # Main todo list component
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client configuration
│   │   └── copilotkit.ts    # CopilotKit MCP configuration
│   ├── App.tsx               # Main app component with CopilotKit
│   └── main.tsx             # Entry point
├── server.js                 # CopilotKit runtime server with MCP support
└── vite.config.ts           # Vite configuration with proxy
```

## CopilotKit Cloud Integration

The app includes CopilotKit Cloud with MCP support:

- **Frontend**: Uses `@copilotkit/react-core` and `@copilotkit/react-ui` for the AI assistant UI
- **Cloud Service**: CopilotKit Cloud handles all runtime operations automatically
- **MCP Support**: MCP servers can be configured in the CopilotKit Cloud dashboard
- **Self-Hosted Option**: For self-hosted setups, use `server.js` (see setup instructions above)

The CopilotKit sidebar allows users to interact with the todo list using natural language, and MCP servers can provide additional context and actions through the CopilotKit Cloud platform.

## Development

- `npm run dev` - Start Vite dev server
- `npm run dev:server` - Start CopilotKit runtime server
- `npm run dev:all` - Start both servers concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Supabase** - Backend database
- **CopilotKit** - AI assistant integration
- **Tailwind CSS** - Styling
- **Express** - Backend server for CopilotKit runtime

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
