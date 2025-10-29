import React, { useEffect, useState } from 'react'
import Shell from '@/components/layout/Shell'
import Card from '@/components/ui/Card'
import Stat from '@/components/ui/Stat'
import Button from '@/components/ui/Button'
import { getSeats } from '@/lib/api/endpoints'
import type { Seat } from '@/lib/types'
import { Link, useNavigate } from 'react-router-dom'

function SeatCard({ seat }: { seat: Seat }){
  const nav = useNavigate()
  const badge = seat.status==='OPEN'? 'bg-emerald-100 text-emerald-700': seat.status==='LIMITED'? 'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-500'
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs inline-block px-2 py-0.5 rounded-full border mb-1">{seat.airline} · {seat.cabin_class}</div>
          <h3 className="text-lg font-semibold">{seat.route_from} → {seat.route_to} · {new Date(seat.depart_at).toLocaleString()}</h3>
          <div className="text-sm text-slate-600">Program {seat.program_days} Hari · Code {seat.code}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${badge}`}>{seat.status}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Seat Tersedia" value={seat.seat_available} />
        <Stat label="Harga/Pax" value={`Rp ${seat.price_idr.toLocaleString('id-ID')}`} />
        <Stat label="Total" value={seat.seat_total} />
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={()=>nav(`/seats/${seat.id}`)}>Detail</Button>
        <Link to="/login" className="px-3 py-1.5 rounded-xl border">Login Agent untuk Booking</Link>
      </div>
    </Card>
  )
}

export default function SeatsList(){
  const [status, setStatus] = useState<'OPEN'|'LIMITED'|'CLOSED'>('OPEN')
  const [rows, setRows] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
  }, [])
  useEffect(()=>{
    setLoading(true)
    getSeats({ status }).then(setRows).finally(()=>setLoading(false))
  }, [status])

  return (
    <Shell>
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-2xl font-bold">Available Seat</h1>
        <div className="flex gap-2">
          {(['OPEN','LIMITED','CLOSED'] as const).map(s=> (
            <button key={s} onClick={()=>setStatus(s)} className={`px-3 py-1.5 rounded-xl border ${status===s? 'bg-slate-900 text-white':'bg-white'}`}>{s}</button>
          ))}
        </div>
      </div>
      {loading ? <div>Loading…</div> : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map(seat=> <SeatCard key={seat.id} seat={seat} />)}
        </div>
      )}
    </Shell>
  )
}
