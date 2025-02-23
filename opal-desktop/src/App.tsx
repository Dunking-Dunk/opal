import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/sonner"
import './App.css'
import ControlLayout from './layouts/ControlLayout'
import AuthButton from './components/global/AuthButton'
import Widget from './components/global/Widget'

const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <ControlLayout >
        <AuthButton />
        <Widget />
      </ControlLayout>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
