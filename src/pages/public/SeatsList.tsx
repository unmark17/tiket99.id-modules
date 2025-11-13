import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSeats, Seat } from '@/lib/store/seats'
import { useAuth } from '@/lib/store/auth'

type SortKey = 'date' | 'route' | 'airline' | 'price'
type SortDir = 'asc' | 'desc'

export default function SeatsList() {
  const { seats } = useSeats()
  const { session } = useAuth()
  const nav = useNavigate()

  const [kw, setKw] = React.useState('')
  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')

  const filtered = React.useMemo(() => {
    const q = kw.trim().toLowerCase()
    return seats.filter(s =>
      !q ||
      s.route.toLowerCase().includes(q) ||
      s.airline.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    )
  }, [seats, kw])

  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    const mul = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const va = a[sortKey] as any
      const vb = b[sortKey] as any
      if (sortKey === 'price') return (va - vb) * mul
      return String(va).localeCompare(String(vb)) * mul
    })
    return arr
  }, [filtered, sortKey, sortDir])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Available Seat</h1>
          <p className="text-slate-600">Tiket pesawat untuk Umroh & perjalanan group.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="Cari rute/maskapai…"
            className="h-10 rounded-md border border-slate-300 px-3 focus:border-blue-500 focus:ring-blue-500"
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="h-10 rounded-md border border-slate-300 px-3"
          >
            <option value="date">Tanggal</option>
            <option value="route">Rute</option>
            <option value="airline">Maskapai</option>
            <option value="price">Harga</option>
          </select>
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="h-10 rounded-md border px-3"
            title={sortDir === 'asc' ? 'Urut menaik' : 'Urut menurun'}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((s) => (
          <SeatCard key={s.id} s={s} isAgent={session?.user.role === 'AGENT'} onAjukan={() => nav('/agent')} />
        ))}
        {sorted.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-center text-slate-500">
            Tidak ada data.
          </div>
        )}
      </div>
    </div>
  )
}

/* ----------------- Kartu Seat (dengan Program & Tipe) ----------------- */
function SeatCard({
  s, isAgent, onAjukan,
}: { s: Seat; isAgent?: boolean; onAjukan: () => void }) {
  // Field baru bersifat opsional agar kompatibel dengan data lama
  const programDays = (s as any).programDays as number | undefined
  const tripType = (s as any).tripType as ('PP' | 'ONE_WAY') | undefined

  return (
    <article className="rounded-2xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{s.id}</div>
          <h2 className="text-lg font-semibold">{s.route}</h2>
          <div className="text-slate-600">{s.airline}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Tanggal</div>
          <div className="flex items-center justify-end gap-2">
            <span className="font-medium">{s.date}</span>
            <DateBadge date={s.date} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm">Seat: <b>{s.available}</b></span>
        <SeatBadge n={s.available} />

        {/* Badge Program Hari */}
        {typeof programDays === 'number' && (
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            {programDays}H
          </span>
        )}

        {/* Badge Tipe Tiket */}
        {tripType && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              tripType === 'PP'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {tripType === 'PP' ? 'PP' : 'One Way'}
          </span>
        )}

        <span className="ml-auto text-lg font-bold">Rp {s.price.toLocaleString('id-ID')}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          to={`/seats/${encodeURIComponent(s.id)}`}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
        >
          Detail
        </Link>

        {isAgent ? (
          <button
            onClick={onAjukan}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Ajukan Seat
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Masuk untuk Ajukan
          </Link>
        )}
      </div>
    </article>
  )
}

/* ---------------------- Badges & Helpers ----------------------- */
function DateBadge({ date }: { date: string }) {
  const d = daysUntil(date)
  if (d === null) return null
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
