import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSeats } from '@/lib/store/seats'
import { useAuth } from '@/lib/store/auth'

export default function SeatDetail() {
  const { id } = useParams<{ id: string }>()
  const { seats } = useSeats()
  const { session } = useAuth()
  const nav = useNavigate()

  const seat = seats.find(s => s.id === id)
  if (!seat) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="text-2xl font-bold">Data tidak ditemukan</div>
        <Link to="/seats" className="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-slate-50">Kembali</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/seats" className="text-sm text-blue-600 hover:underline">← Kembali ke daftar</Link>

      <div className="mt-3 rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">{seat.id}</div>
            <h1 className="text-2xl font-bold">{seat.route}</h1>
            <div className="text-slate-600">{seat.airline}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Tanggal</div>
            <div className="text-lg font-semibold">{seat.date}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Info title="Seat Tersedia" value={seat.available} />
          <Info title="Harga" value={`Rp ${seat.price.toLocaleString('id-ID')}`} />
          <Info title="Status H" value={<DateBadge date={seat.date} />} />
          <Info title="Ketersediaan" value={<SeatBadge n={seat.available} />} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Tersedia untuk pengajuan seat agent. Silakan login sebagai agent untuk melanjutkan proses booking.
          </p>
          {session?.user.role === 'AGENT' ? (
            <button
              onClick={() => nav('/agent')}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Ajukan Seat Ini
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Masuk sebagai Agent
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function Info({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}

function DateBadge({ date }: { date: string }) {
  const d = daysUntil(date)
  if (d === null) return <span>-</span>
  if (d < 0) return <span className="rounded-full bg-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-800">Lewat</span>
  if (d <= 1) return <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white">H-{d}</span>
  if (d <= 3) return <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">H-{d}</span>
  if (d <= 7) return <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">H-{d}</span>
  return <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">H-{d}</span>
}
function SeatBadge({ n }: { n: number }) {
  if (n < 10) return <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">Low</span>
  if (n < 20) return <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">Med</span>
  return <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">OK</span>
}
function daysUntil(isoDate: string): number | null {
  const d = new Date(isoDate + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  const today = new Date()
  d.setHours(0,0,0,0); today.setHours(0,0,0,0)
  const diff = d.getTime() - today.getTime()
  return Math.round(diff / (1000*60*60*24))
}
