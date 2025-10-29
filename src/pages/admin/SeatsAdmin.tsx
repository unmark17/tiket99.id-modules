
import React, { useEffect, useState } from 'react'
import { deleteSeat, getSeats, patchSeat, postSeat } from '@/lib/api/endpoints'
import type { Seat } from '@/lib/types'


export default function SeatsAdmin(){
const [rows, setRows] = useState<Seat[]>([])
const [loading, setLoading] = useState(true)
const [form, setForm] = useState<Partial<Seat>>({ route_from: 'SUB', route_to: 'JED', program_days: 12, seat_total: 180, seat_available: 180, price_idr: 15000000, airline: 'Lion Air', cabin_class: 'Economy', status: 'OPEN' })


const reload = ()=>{ setLoading(true); getSeats().then(setRows).finally(()=>setLoading(false)) }
useEffect(()=>{ reload() }, [])


async function add(e: React.FormEvent){ e.preventDefault(); await postSeat(form); reload() }


return (
<div>
<h2 className="text-lg font-semibold mb-2">Kelola Seats</h2>
{loading? <div>Loading…</div> : (
<div className="grid gap-2 mb-3">
{rows.map(s=> (
<div key={s.id} className="border rounded-xl p-2 flex items-center justify-between">
<div className="text-sm">#{s.id} {s.route_from}→{s.route_to} · {new Date(s.depart_at).toLocaleDateString()} · sisa {s.seat_available}</div>
<div className="flex items-center gap-2">
<span className="text-xs px-2 py-0.5 rounded-full border">{s.status}</span>
<button className="text-xs underline" onClick={()=>patchSeat(s.id, { status: s.status==='OPEN' ? 'LIMITED' : 'OPEN' }).then(reload)}>Toggle</button>
<button className="text-xs underline text-rose-600" onClick={()=>deleteSeat(s.id).then(reload)}>Hapus</button>
</div>
</div>
))}
</div>
)}


<details className="mt-2">
<summary className="cursor-pointer text-sm font-medium">Tambah Seat</summary>
<form onSubmit={add} className="grid md:grid-cols-3 gap-2 mt-2">
<input className="border rounded-xl px-3 py-2" value={form.route_from||''} onChange={e=>setForm({...form, route_from:e.target.value})} placeholder="Dari" />
<input className="border rounded-xl px-3 py-2" value={form.route_to||''} onChange={e=>setForm({...form, route_to:e.target.value})} placeholder="Ke" />
<input className="border rounded-xl px-3 py-2" type="datetime-local" onChange={e=>setForm({...form, depart_at: new Date(e.target.value).toISOString()})} />
<input className="border rounded-xl px-3 py-2" type="number" value={form.program_days||0} onChange={e=>setForm({...form, program_days:Number(e.target.value)})} placeholder="Program (hari)" />
<input className="border rounded-xl px-3 py-2" type="number" value={form.seat_total||0} onChange={e=>setForm({...form, seat_total:Number(e.target.value)})} placeholder="Seat total" />
<input className="border rounded-xl px-3 py-2" type="number" value={form.seat_available||0} onChange={e=>setForm({...form, seat_available:Number(e.target.value)})} placeholder="Seat tersedia" />
<input className="border rounded-xl px-3 py-2" type="number" value={form.price_idr||0} onChange={e=>setForm({...form, price_idr:Number(e.target.value)})} placeholder="Harga" />
<input className="border rounded-xl px-3 py-2" value={form.airline||''} onChange={e=>setForm({...form, airline:e.target.value})} placeholder="Maskapai" />
<input className="border rounded-xl px-3 py-2" value={form.cabin_class||''} onChange={e=>setForm({...form, ca
