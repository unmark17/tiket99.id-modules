// src/lib/store/auth.tsx
import React, { createContext, useContext, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export type Role = 'PUBLIC' | 'AGENT' | 'ADMIN'
interface User { id: number; role: Role; name: string; email: string }
interface Session { token: string; user: User }
interface Ctx {
  session: Session | null
  login: (email: string, password: string) => Promise<Session>
  logout: () => Promise<void>
}

const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem('t99.jwt')
    return raw ? JSON.parse(raw) as Session : null
  })

  async function login(email: string, _password: string) {
    // mock login lokal
    const user: User =
      email.includes('admin') ? { id:1, role:'ADMIN', name:'Admin Tiket99', email } :
      { id:10, role:'AGENT', name:'PT Berkah Travel', email }
    const next = { token:'mock.jwt', user }
    localStorage.setItem('t99.jwt', JSON.stringify(next))
    setSession(next)
    return next
  }

  async function logout() {
    localStorage.removeItem('t99.jwt')
    setSession(null)
  }

  const value = useMemo(() => ({ session, login, logout }), [session])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { session } = useAuth()
  const location = useLocation()
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (role && session.user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}
