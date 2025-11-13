// src/pages/public/SearchResults.tsx
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Shell from '@/components/layout/Shell'
import { useSeats } from '@/lib/store/seats'

type SortKey = 'date' | 'route' | 'airline'
type SortDir = 'asc' | 'desc'

export default function SearchResults() {
  const { seats } = useSeats()
  const loc = useLocation()
  const nav = useNavigate()

  // ambil query
  const qs = React.useMemo(() => new URLSearchParams(loc.search), [loc.search])
  const trip = (qs.get('trip') || '').toUpperCase() // 'PP' | 'ONE_WAY' | ''
  const from = (qs.get('from') || '').toUpperCase() // SUB
  const to   = (qs.get('to')   || '').toUpperCase() // JED
  const depart = qs.get('depart') || new Date().toISOString().slice(0,10)
  const pax  = qs.get('pax') || '1'
  const cls  = qs.get('class') || 'Economy'

  // sort sederhana
  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')

  // filter sesuai query
  const routeKey = (r: string) => r.toUpperCase().replace(/[^\w]/g, '') // "SUB–JED" -> "SUBJED"
  const filtered = React.useMemo(() => {
    return seats.filter(s => {
      const rk = routeKey(s.route)
      const hitFrom = !from || rk.includes(from)
      const hitTo   = !to   || rk.includes(to)
      const hitTrip = !trip || (s as any).tripType === trip
      const hitDate = !depart || s.date === depart
      return hitFrom && hitTo && hitTrip && hitDate
    })
  }, [seats, from, to, trip, depart])

  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    const mul = sortDir === 'asc' ? 1 : -1
    arr.sort((a: any, b: any) => {
      const va = a[sortKey], vb = b[sortKey]
      if (sortKey === 'date') return String(va).localeCompare(String(vb)) * mul
      return String(va).localeCompare(String(vb)) * mul
    })
    return arr
  }, [filtered, sortKey, sortDir])

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* === Header ala tiket.com (tanpa harga) === */}
        <ResultsMenu
          from={from} to={to}
          depart={depart}
          pax={pax} cls={cls}
        />

        {/* Toolbar sortir ringan (tanpa harga) */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => setSortKey('date')}
            className={`rounded-xl border px-3 py-2 text-sm ${sortKey==='date' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            Durasi/Tanggal
          </button>
          <button
            onClick={() => setSortKey('route')}
            className={`rounded-xl border px-3 py-2 text-sm ${sortKey==='route' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            Rute
          </button>
          <button
            onClick={() => setSortKey('airline')}
            className={`rounded-xl border px-3 py-2 text-sm ${sortKey==='airline' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            Maskapai
          </button>
        </div>

        {/* Arah urutan */}
        <div className="mt-2">
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Urut: {sortDir === 'asc' ? '↑ Menaik' : '↓ Menurun'}
          </button>
          <button
            onClick={() => nav('/')}
            className="ml-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Ubah Pencarian
          </button>
          <span className="ml-3 text-sm text-slate-500">{sorted.length} hasil</span>
        </div>

        {/* === Hasil list (tanpa harga) === */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {sorted.map(s => (
            <article key={s.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500">{s.id}</div>
                  <h2 className="text-lg font-semibold">{s.route}</h2>
                  <div className="text-slate-600">{s.airline}</div>
                  {/* info tambahan bila ada */}
                  {(s as any).programDays && (
                    <div className="mt-1 text-xs text-slate-500">Program: {(s as any).programDays} hari</div>
                  )}
                  {(s as any).tripType && (
                    <div className="text-xs text-slate-500">Tipe: {(s as any).tripType === 'PP' ? 'PP (Pulang-Pergi)' : 'One Way'}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Tanggal</div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">{s.date}</span>
                    <DateBadge date={s.date} />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm">Seat: <b>{s.available}</b></span>
                <SeatBadge n={s.available} />
                {/* harga disembunyikan */}
                <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  Info harga via Admin
                </span>
              </div>

              <div className="mt-4 flex justify-between">
                <Link
                  to={`/seats/${encodeURIComponent(s.id)}`}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Detail
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
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

/* =========================
 * Komponen Header Hasil (tanpa harga)
 * ========================= */
function ResultsMenu({
  from, to, depart, pax, cls
}: { from: string; to: string; depart: string; pax: string; cls: string }) {
  const nav = useNavigate()
  const loc = useLocation()
  const qs = new URLSearchParams(loc.search)

  function addDays(iso: string, off: number) {
    const d = new Date(iso || new Date().toISOString().slice(0,10))
    d.setDate(d.getDate() + off)
    return d.toISOString().slice(0,10)
  }
  function indoDate(iso: string) {
    try {
      const d = new Date(iso + 'T00:00:00')
      return d.toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })
    } catch { return iso }
  }
  function pickDate(iso: string) {
    qs.set('depart', iso)
    nav(`${loc.pathname}?${qs.toString()}`, { replace:true })
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 p-3 text-white shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            {(from || 'From')} → {(to || 'To')}
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-xs">
            {indoDate(depart)} · {pax} penumpang · {cls}
          </div>
        </div>
        <div className="hidden md:block opacity-90 text-sm">✈️ Hasil Pencarian</div>
      </div>

      {/* Date scroller */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {[-1,0,1,2,3].map(off => {
          const iso = addDays(depart, off)
          const active = iso === depart
          return (
            <button
              key={off}
              onClick={() => pickDate(iso)}
              className={`rounded-xl px-3 py-2 text-center text-xs md:text-sm transition ${
                active ? 'bg-white text-slate-900 font-semibold' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="opacity-80">
                {new Date(iso).toLocaleDateString('id-ID', { weekday:'short' })}
              </div>
              <div>{new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short' })}</div>
            </button>
          )
        })}
        <button
          onClick={() => document.getElementById('departPicker')?.focus()}
          className="rounded-xl bg-white/10 px-3 py-2 text-center text-xs md:text-sm hover:bg-white/20"
          title="Pilih tanggal lain"
        >
          📅 Kalender
        </button>
        <input
          id="departPicker"
          type="date"
          className="sr-only"
          value={depart}
          onChange={(e)=> pickDate(e.target.value)}
        />
      </div>

      {/* Badges info */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="rounded-full bg-white/15 px-3 py-1">🎫 Gratis Antar Jemput Bandara</span>
        <span className="rounded-full bg-white/15 px-3 py-1">🛡️ 11.11 Super Sale</span>
        <span className="rounded-full bg-white/15 px-3 py-1">🎓 Tiket Pelajar</span>
      </div>
    </div>
  )
}

/* ===== Badges kecil ===== */
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
