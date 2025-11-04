import React from 'react'
import { Link } from 'react-router-dom'
import { useSeats } from '@/lib/store/seats'

export default function SeatsList() {
  const { seats } = useSeats()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Available Seat</h1>
      <p className="text-slate-600">Pilih seat yang tersedia untuk pengajuan booking agen.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {seats.map((s) => (
          <div key={s.id} className="rounded-2xl border bg-white p-4">
            <div className="text-xs text-slate-500">{s.id}</div>
            <div className="mt-1 text-lg font-semibold">{s.route}</div>
            <div className="text-sm text-slate-600">{s.airline}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-slate-500">Tanggal:</span> {s.date}</div>
              <div><span className="text-slate-500">Seat:</span> {s.available}</div>
            </div>
            <div className="mt-2 font-bold">Rp {s.price.toLocaleString('id-ID')}</div>
            <div className="mt-3">
              <Link to={`/agent`} className="inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                Ajukan Seat
              </Link>
            </div>
          </div>
        ))}
        {seats.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-center text-slate-500">
            Belum ada seat yang dipublish.
          </div>
        )}
      </div>
    </div>
  )
}
