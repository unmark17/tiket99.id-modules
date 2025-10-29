
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/store/auth'


export default function Header(){
const { session, logout } = useAuth()
return (
<header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
<div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
<Link to="/" className="font-bold text-xl">Tiket99.id</Link>
<nav className="flex gap-4 text-sm">
<Link to="/">Home</Link>
<Link to="/seats">Available Seat</Link>
<Link to="/agent">Agent</Link>
<Link to="/admin">Admin</Link>
</nav>
<div className="ml-auto flex items-center gap-3">
{session ? (
<>
<span className="text-sm px-2 py-1 rounded bg-slate-100">{session.user.name} · {session.user.role}</span>
<button onClick={()=>logout()} className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white">Logout</button>
</>
) : (
<Link to="/login" className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white">Login</Link>
)}
</div>
</div>
</header>
)
}

