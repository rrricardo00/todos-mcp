import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@copilotkit/react-core', '@copilotkit/react-ui'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    // Proxy only needed for self-hosted CopilotKit runtime
    // When using CopilotKit Cloud, no proxy is needed
    proxy: process.env.VITE_COPILOTKIT_RUNTIME_URL ? {
      '/api/copilotkit': {
        target: process.env.VITE_COPILOTKIT_RUNTIME_URL,
        changeOrigin: true,
      },
    } : {},
  },
})
