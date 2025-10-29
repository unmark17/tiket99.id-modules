import React, { useEffect, useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import Card from '@/components/ui/Card'
import Stat from '@/components/ui/Stat'
import Button from '@/components/ui/Button'
import { getSeats } from '@/lib/api/endpoints'
import type { Seat } from '@/lib/types'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function SeatCard({ seat }: { seat: Seat }){
  const nav = useNavigate()
  const badge =
    seat.status === 'OPEN'
      ? 'bg-emerald-100 text-emerald-700'
      : seat.status === 'LIMITED'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-slate-100 text-slate-500'

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs inline-block px-2 py-0.5 rounded-full border mb-1">
            {seat.airline} · {seat.cabin_class}
          </div>
          <h3 className="text-lg font-semibold">
            {seat.route_from} → {seat.route_to} · {new Date(seat.depart_at).toLocaleString()}
          </h3>
          <div className="text-sm text-slate-600">
            Program {seat.program_days} Hari · Code {seat.code}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${badge}`}>{seat.status}</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Seat Tersedia" value={seat.seat_available} />
        <Stat label="Harga/Pax" value={`Rp ${seat.price_idr.toLocaleString('id-ID')}`} />
        <Stat label="Total" value={seat.seat_total} />
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={() => nav(`/seats/${seat.id}`)}>Detail</Button>
        <Link to="/login" className="px-3 py-1.5 rounded-xl border">
          Login Agent untuk Booking
        </Link>
      </div>
    </Card>
  )
}

export default function SeatsList(){
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  // Query dari kartu pencarian (opsional semuanya)
  const qFrom = (params.get('from') || '').toUpperCase()
  const qTo   = (params.get('to')   || '').toUpperCase()
  const qGo   = params.get('go') || ''                         // yyyy-mm-dd
  const qPax  = Number(params.get('pax') || '') || 0
  const qCls  = (params.get('cls') || '').toLowerCase()        // Economy/Business
  // const qTrip = params.get('trip') || 'oneway'               // kalau ingin dipakai nanti

  const [status, setStatus] = useState<'OPEN'|'LIMITED'|'CLOSED'>('OPEN')
  const [rows, setRows] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)

  // Ambil data sesuai status (server-side)
  useEffect(() => {
    setLoading(true)
    getSeats({ status }).then(setRows).finally(() => setLoading(false))
  }, [status])

  // Filter tambahan (client-side) berdasar query string
  const filtered = useMemo(() => {
    return rows.filter(s => {
      const okFrom = qFrom ? (s.route_from || '').toUpperCase().includes(qFrom) : true
      const okTo   = qTo   ? (s.route_to   || '').toUpperCase().includes(qTo)   : true
      const okDate = qGo   ? new Date(s.depart_at).toISOString().slice(0,10) === qGo : true
      const okCls  = qCls  ? (s.cabin_class || '').toLowerCase() === qCls : true
      const okPax  = qPax  ? (s.seat_available || 0) >= qPax : true
      return okFrom && okTo && okDate && okCls && okPax
    })
  }, [rows, qFrom, qTo, qGo, qCls, qPax])

  const hasFilter = !!(qFrom || qTo || qGo || qCls || qPax)

  return (
    <Shell>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Available Seat</h1>
          {hasFilter && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full border bg-white">
                Status: <b>{status}</b>
              </span>
              {qFrom && <span className="px-2 py-1 rounded-full border bg-white">From: <b>{qFrom}</b></span>}
              {qTo   && <span className="px-2 py-1 rounded-full border bg-white">To: <b>{qTo}</b></span>}
              {qGo   && <span className="px-2 py-1 rounded-full border bg-white">Date: <b>{qGo}</b></span>}
              {qPax  ? <span className="px-2 py-1 rounded-full border bg-white">Pax: <b>{qPax}</b></span> : null}
              {qCls  && <span className="px-2 py-1 rounded-full border bg-white">Class: <b>{qCls}</b></span>}
              <Link to="/seats" className="px-2 py-1 rounded-full border bg-slate-900 text-white">Reset</Link>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {(['OPEN','LIMITED','CLOSED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-xl border ${status === s ? 'bg-slate-900 text-white' : 'bg-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : filtered.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(seat => <SeatCard key={seat.id} seat={seat} />)}
        </div>
      ) : (
        <Card>
          <div className="text-sm text-slate-600">
            Tidak ada seat yang sesuai filter saat ini. Coba ubah status di atas atau klik <Link to="/seats" className="underline">Reset</Link>.
          </div>
        </Card>
      )}
    </Shell>
  )
}
