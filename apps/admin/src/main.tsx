import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppLocal from './AppLocal.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

// Render App with Clerk when available; fall back to AppLocal for local dev
const AppWithOptionalClerk = () => {
  if (!clerkPublishableKey || clerkPublishableKey === 'disabled_for_local_dev') {
    return (
      <BrowserRouter>
        <AppLocal />
      </BrowserRouter>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithOptionalClerk />
  </StrictMode>,
)
