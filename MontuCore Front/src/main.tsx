import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppRouter } from './router.tsx'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
    
      {/* <TanStackRouterDevtools /> */}
  </StrictMode>,
)
