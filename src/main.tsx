// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import routes from './routes'
import { AuthProvider } from '@/lib/store/auth'
import { SeatsProvider } from '@/lib/store/seats'
import './index.css'

// Komponen kecil untuk menerapkan array routes dari routes.tsx
function AppRoutes() {
  return useRoutes(routes)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SeatsProvider>
          <AppRoutes />
        </SeatsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
