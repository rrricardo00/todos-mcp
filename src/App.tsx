import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'
import TodoList from './components/TodoList'
import './index.css'

const App = () => {
  // CopilotKit Cloud Configuration
  // When using CopilotKit Cloud, only publicApiKey is needed
  // Do NOT set runtimeUrl when using Cloud - it causes request format issues
  const publicApiKey = import.meta.env.VITE_COPILOTKIT_PUBLIC_API_KEY || 'ck_pub_c7f38a7ffb68aebd27e9b36361b2f79c'
  
  // For self-hosted: uncomment and set runtimeUrl
  // const runtimeUrl = import.meta.env.VITE_COPILOTKIT_RUNTIME_URL

  // Cloud mode: Only pass publicApiKey
  // Agents need to be configured in CopilotKit Cloud dashboard
  // Go to https://www.copilotkit.ai to configure your default agent
  return (
    <CopilotKit publicApiKey={publicApiKey}>
      <CopilotSidebar
        instructions="You are a helpful assistant for managing todos. You can help users add, edit, and delete todos from their list."
        labels={{
          title: 'Todo Assistant',
          initial: 'Hi! I can help you manage your todos. What would you like to do?',
        }}
      >
        <TodoList />
      </CopilotSidebar>
    </CopilotKit>
  )
}

export default App
