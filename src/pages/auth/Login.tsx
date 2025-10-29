
import React, { useEffect, useState } from 'react'
import Shell from '@/components/layout/Shell'
import Card from '@/components/ui/Card'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/store/auth'


export default function Login(){
const nav = useNavigate()
const { session, login } = useAuth()
const location = useLocation()
const from = (location.state as any)?.from || '/agent'
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')


useEffect(()=>{ if(session) nav(from, { replace: true }) }, [session])


async function submit(e: React.FormEvent){
e.preventDefault(); setError('')
try{ await login(email, password) } catch(err: any){ setError(err?.response?.data?.message || err.message) }
}


return (
<Shell>
<div className="max-w-md mx-auto">
<Card>
<h1 className="text-2xl font-bold mb-2">Login</h1>
<p className="text-sm text-slate-600 mb-4">Gunakan akun AGENT atau ADMIN.</p>
{error && <div className="mb-3 text-sm text-red-600">{error}</div>}
<form onSubmit={submit} className="grid gap-3">
<input className="border rounded-xl px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input className="border rounded-xl px-3 py-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
<button className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white">Masuk</button>
</form>
</Card>
</div>
</Shell>
)
}

