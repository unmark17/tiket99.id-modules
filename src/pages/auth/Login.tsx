import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/store/auth'

export default function Login() {
  const { login, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as unknown as { state?: { from?: string } }
  const from = location?.state?.from || '/'

  // kalau sudah login, langsung lempar ke dashboard sesuai role
  if (session?.user) {
    if (session.user.role === 'ADMIN') navigate('/admin', { replace: true })
    else if (session.user.role === 'AGENT') navigate('/agent', { replace: true })
    else navigate(from, { replace: true })
  }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const sess = await login(email.trim(), password)
      // arahkan berdasar role
      if (sess.user.role === 'ADMIN') navigate('/admin', { replace: true })
      else if (sess.user.role === 'AGENT') navigate('/agent', { replace: true })
      else navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Gagal masuk. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Masuk ke Akun</h1>
      <p className="mt-1 text-slate-600 text-sm">
        Gunakan email & password. <br />
        <span className="text-xs opacity-70">
          (Mock: ketik email mengandung kata <b>admin</b> untuk role ADMIN, selain itu AGENT)
        </span>
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="nama@contoh.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline">Daftar</Link>
      </p>
    </div>
  )
}
