import React, { useEffect, useState } from 'react'
import Shell from '@/components/layout/Shell'
import Card from '@/components/ui/Card'
import Stat from '@/components/ui/Stat'
import { Link, useParams } from 'react-router-dom'
import { getSeatById } from '@/lib/api/endpoints'
import type { Seat } from '@/lib/types'

export default function SeatDetail(){
  const { id } = useParams()
  const [seat, setSeat] = useState<Seat | null>(null)

  useEffect(()=>{ if(id) getSeatById(Number(id)).then(setSeat) }, [id])
  if(!seat) return <Shell><div>Memuat…</div></Shell>

  return (
    <Shell>
      <Card>
        <h1 className="text-2xl font-bold mb-2">{seat.route_from} → {seat.route_to}</h1>
        <div className="text-sm text-slate-600 mb-4">{new Date(seat.depart_at).toLocaleString()} · Program {seat.program_days} Hari · Code {seat.code}</div>
        <div className="grid md:grid-cols-3 gap-2 mb-4">
          <Stat label="Seat Tersedia" value={seat.seat_available} />
          <Stat label="Harga/Pax" value={`Rp ${seat.price_idr.toLocaleString('id-ID')}`} />
          <Stat label="Maskapai" value={seat.airline} />
        </div>
        <Link to="/login" className="px-4 py-2 rounded-xl bg-slate-900 text-white">Login Agent untuk Booking</Link>
      </Card>
    </Shell>
  )
}
