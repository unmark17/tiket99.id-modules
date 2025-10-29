
import React from 'react'
import Header from './Header'


export default function Shell({ children }: { children: React.ReactNode }){
return (
<div className="min-h-screen bg-slate-50 text-slate-900">
<Header />
<main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
<footer className="border-t py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Tiket99.id</footer>
</div>
)
}

