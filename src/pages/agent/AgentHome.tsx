import React, { useEffect, useState } from 'react'
import Shell from '@/components/layout/Shell'
import Card from '@/components/ui/Card'
import { getMyBookings } from '@/lib/api/endpoints'
import type { Booking } from '@/lib/types'
import { useNavigate } from 'react-router-dom'
import NewBooking from './NewBooking'

export default function AgentHome(){
  const [rows, setRows] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ setLoading(true); getMyBookings().then(setRows).finally(()=>setLoading(false)) }, [])

  return (
    <Shell>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Booking Saya</h2>
          </div>
          {loading? <div>Loading…</div> : (
            <div className="grid gap-3">
              {rows.map(row=> <AgentBookingRow key={row.id} row={row} />)}
              {rows.length===0 && <div className="text-sm text-slate-500">Belum ada booking.</div>}
            </div>
          )}
        </Card>
        <Card>
          <NewBooking onCreated={(b)=>{ setRows(prev=>[b, ...prev]) }} />
        </Card>
      </div>
    </Shell>
  )
}

function AgentBookingRow({ row }: { row: Booking }){
  const nav = useNavigate()
  const badge = row.status==='PENDING'? 'bg-amber-100 text-amber-800' : row.status==='APPROVED'? 'bg-emerald-100 text-emerald-700' : row.status==='DECLINED'? 'bg-rose-100 text-rose-700':'bg-slate-100 text-slate-600'
  return (
    <div className="border rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{row.seat?.route_from} → {row.seat?.route_to}</div>
          <div className="text-xs text-slate-500">Qty {row.qty} · Code {row.seat?.code}</div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs ${badge}`}>{row.status}</div>
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={()=>nav(`/agent/bookings/${row.id}`)} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white">Detail</button>
      </div>
    </div>
  )
}
