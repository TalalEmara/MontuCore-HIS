import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppRouter } from './router.tsx'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <AppRouter />
    </AuthProvider>
    
      {/* <TanStackRouterDevtools /> */}
  </StrictMode>,
)
