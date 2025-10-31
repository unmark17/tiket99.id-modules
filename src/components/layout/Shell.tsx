import React from 'react'
import Header from './Header'

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />
      <div className="h-20" /> {/* spacer biar konten tak ketutup header */}
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-white/70 backdrop-blur py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} <span className="font-semibold text-blue-600">Tiket99.id</span>
      </footer>
    </div>
  )
}
