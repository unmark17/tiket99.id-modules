// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from '@/lib/store/auth'
import { SeatsProvider } from '@/lib/store/seats'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SeatsProvider>
          <App />
        </SeatsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
