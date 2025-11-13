// src/pages/public/SearchResults.tsx
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Shell from '@/components/layout/Shell'
import { useSeats } from '@/lib/store/seats'

type SortKey = 'date' | 'route' | 'airline' | 'price'
type SortDir = 'asc' | 'desc'

export default function SearchResults() {
  const { seats } = useSeats()
  const loc = useLocation()
  const nav = useNavigate()

  // --- ambil query
  const qs = React.useMemo(() => new URLSearchParams(loc.search), [loc.search])
  const trip = (qs.get('trip') || '').toUpperCase() // 'PP' | 'ONE_WAY'
  const from = (qs.get('from') || '').toUpperCase()
  const to = (qs.get('to') || '').toUpperCase()
  const depart = qs.get('depart') || ''

  // --- sort state
  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')

  // --- filter logic
  const routeKey = (r: string) => r.toUpperCase().replace(/[^\w]/g, '')
  const filtered = React.useMemo(() => {
    return seats.filter((s: any) => {
      const rk = routeKey(s.route)
      const hitFrom = !from || rk.includes(from)
      const hitTo = !to || rk.includes(to)
      const hitTrip = !trip || s.tripType === trip
      const hitDate = !depart || s.date === depart
      return hitFrom && hitTo && hitTrip && hitDate
    })
  }, [seats, from, to, trip, depart])

  // --- sort logic
  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    const mul = sortDir === 'asc' ? 1 : -1
    arr.sort((a: any, b: any) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (sortKey === 'price') return (va - vb) * mul
      return String(va).localeCompare(String(vb)) * mul
    })
    return arr
  }, [filtered, sortKey, sortDir])

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* ===== HEADER HASIL ===== */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 p-[1px] shadow-lg">
          <div className="rounded-3xl bg-white/80 backdrop-blur p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip icon="✈️">{from || 'FROM'}</Chip>
              <span className="text-slate-400">→</span>
              <Chip icon="🕋">{to || 'TO'}</Chip>
              {depart && <Chip icon="📅">Pergi: {depart}</Chip>}
              {trip && <Chip icon="🔁">{trip}</Chip>}
              <span className="ml-auto text-sm text-slate-600">
                {sorted.length} hasil
              </span>
            </div>

            {/* timeline tanggal */}
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
              {[-2, -1, 0, 1, 2].map((offset) => {
                const d = new Date(depart || new Date().toISOString().slice(0, 10))
                d.setDate(d.getDate() + offset)
                const iso = d.toISOString().slice(0, 10)
                const active = iso === depart
                return (
                  <button
                    key={iso}
                    onClick={() =>
                      nav(
                        `/search?${new URLSearchParams({
                          from,
                          to,
                          depart: iso,
                          trip,
                        }).toString()}`
                      )
                    }
                    className={`rounded-xl px-3 py-2 text-sm border transition ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white/80 hover:bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {d.toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ===== FILTER BAR ===== */}
        <div className="sticky top-2 z-[5] mt-4 rounded-2xl border bg-white/80 p-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
            >
              <option value="date">Urut: Tanggal</option>
              <option value="route">Urut: Rute</option>
              <option value="airline">Urut: Maskapai</option>
              <option value="price">Urut: Harga</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
            >
              Arah: {sortDir === 'asc' ? '↑ Menaik' : '↓ Menurun'}
            </button>
            <button
              onClick={() => nav('/')}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50"
            >
              Ubah Pencarian
            </button>
          </div>
        </div>

        {/* ===== LIST HASIL ===== */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sorted.map((s: any) => (
            <article
              key={s.id}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-[0_12px_28px_-10px_rgba(2,6,23,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-400">{s.id}</div>
                  <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900">
                    {s.route}
                  </h2>
                  <div className="text-slate-600">{s.airline}</div>

                  {/* Program & Tipe tiket */}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {'programDays' in s && s.programDays && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">
                        📆 Program {s.programDays} hari
                      </span>
                    )}
                    {'tripType' in s && s.tripType && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                        🎫 {s.tripType === 'PP' ? 'PP' : 'One Way'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Tanggal</div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">{s.date}</span>
                    <DateBadge date={s.date} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-600">
                  Seat: <b className="text-slate-900">{s.available}</b>
                </span>
                <SeatBadge n={s.available} />
                <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  Info harga via Admin
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link
                  to={`/seats/${encodeURIComponent(s.id)}`}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Detail
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:bg-emerald-800"
                >
                  Pilih
                </Link>
              </div>
            </article>
          ))}

          {sorted.length === 0 && (
            <div className="rounded-2xl border bg-white p-6 text-center text-slate-500">
              Tidak ada seat yang cocok.
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}

/* ---------- Komponen kecil ---------- */
function Chip({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}

function DateBadge({ date }: { date: string }) {
  const d = daysUntil(date)
  if (d === null) return null
  const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold'
  if (d < 0) return <span className={`${base} bg-slate-200 text-slate-700`}>Lewat</span>
  if (d <= 1) return <span className={`${base} bg-rose-600 text-white`}>H-{d}</span>
  if (d <= 3) return <span className={`${base} bg-red-600 text-white`}>H-{d}</span>
  if (d <= 7) return <span className={`${base} bg-amber-500 text-white`}>H-{d}</span>
  return <span className={`${base} bg-emerald-500 text-white`}>H-{d}</span>
}

function SeatBadge({ n }: { n: number }) {
  const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold'
  if (n < 10) return <span className={`${base} bg-red-600 text-white`}>Low</span>
  if (n < 20) return <span className={`${base} bg-amber-500 text-white`}>Med</span>
  return <span className={`${base} bg-emerald-500 text-white`}>OK</span>
}

function daysUntil(isoDate: string): number | null {
  const d = new Date(isoDate + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  const today = new Date()
  d.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diff = d.getTime() - today.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}
