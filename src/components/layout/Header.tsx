import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/store/auth'

export default function Header(){
  const { session, logout } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-extrabold text-xl tracking-tight">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 mr-2 align-middle" />
          Tiket99.id
        </Link>

        <nav className="ml-4 flex gap-5 text-sm">
          <Link to="/" className="hover:opacity-80">Home</Link>
          <Link to="/seats" className="hover:opacity-80">Available Seat</Link>
          <Link to="/agent" className="hover:opacity-80">Agent</Link>
          <Link to="/admin" className="hover:opacity-80">Admin</Link>
          {/* Tidak ada menu Hotel / To Do / dsb */}
        </nav>

        <div className="ml-auto">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded bg-slate-100">{session.user.name} · {session.user.role}</span>
              <button onClick={()=>logout()} className="text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-white">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-white">Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}