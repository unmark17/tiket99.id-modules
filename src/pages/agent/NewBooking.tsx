
import React, { useEffect, useState } from 'react'
import { getSeats, postCreateBooking } from '@/lib/api/endpoints'
import type { Booking, Seat } from '@/lib/types'


export default function NewBooking({ onCreated }: { onCreated?: (b: Booking)=>void }){
const [seatId, setSeatId] = useState<number | ''>('')
const [qty, setQty] = useState(1)
const [note, setNote] = useState('')
const [seats, setSeats] = useState<Seat[]>([])
const [saving, setSaving] = useState(false)


useEffect(()=>{ getSeats({ status: 'OPEN' }).then(setSeats) }, [])


async function submit(e: React.FormEvent){
e.preventDefault(); if(!seatId) return
setSaving(true)
const b = await postCreateBooking({ seat_id: Number(seatId), qty: Number(qty), notes: note }).finally(()=>setSaving(false))
onCreated?.(b)
}


return (
<div>
<h2 className="text-lg font-semibold mb-2">Ajukan Booking</h2>
<form onSubmit={submit} className="grid gap-2">
<select className="border rounded-xl px-3 py-2" value={seatId} onChange={e=>setSeatId(Number(e.target.value))}>
<option value="">Pilih Seat (OPEN)</option>
{seats.map(s=> <option key={s.id} value={s.id}>{s.route_from}→{s.route_to} · {new Date(s.depart_at).toLocaleDateString()} · sisa {s.seat_available}</option>)}
</select>
<input className="border rounded-xl px-3 py-2" type="number" min={1} max={999} value={qty} onChange={e=>setQty(Number(e.target.value))} placeholder="Jumlah pax" />
<textarea className="border rounded-xl px-3 py-2" value={note} onChange={e=>setNote(e.target.value)} placeholder="Catatan (opsional)"/>
<button disabled={!seatId||saving} className="mt-1 px-4 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-50">{saving? 'Mengirim…':'Kirim Booking'}</button>
</form>
<p className="text-xs text-slate-500 mt-2">Catatan: stok belum dikurangi sampai Admin meng-approve.</p>
</div>
)
}

