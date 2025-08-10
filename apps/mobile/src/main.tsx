import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import './theme/variables.css'
import App from './App.tsx'
import AppLocal from './AppLocal.tsx'
import CheckoutLocal from './pages/CheckoutLocal.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

// For local development without Clerk
const AppWithOptionalClerk = () => {
  if (!clerkPublishableKey || clerkPublishableKey === 'disabled_for_local_dev') {
    // Inject a route override for local checkout page if needed.
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
