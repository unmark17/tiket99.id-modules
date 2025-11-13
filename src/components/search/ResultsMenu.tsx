import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

type TabKey = 'harga' | 'durasi' | 'lainnya'

function addDays(startISO: string, dayOffset: number) {
  const d = startISO ? new Date(startISO) : new Date()
  d.setDate(d.getDate() + dayOffset)
  return d.toISOString().slice(0,10)
}
function indoDate(iso: string) {
  try {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })
  } catch { return iso }
}

export default function ResultsMenu() {
  const nav = useNavigate()
  const loc = useLocation()
  const qs = new URLSearchParams(loc.search)
  const from = (qs.get('from') || '').toUpperCase()
  const to   = (qs.get('to')   || '').toUpperCase()
  const depart = qs.get('depart') || new Date().toISOString().slice(0,10)
  const pax  = qs.get('pax') || '1'
  const cls  = qs.get('class') || 'Economy'

  const [activeTab, setActiveTab] = React.useState<TabKey>('durasi')

  function pickDate(iso: string) {
    qs.set('depart', iso)
    nav(`${loc.pathname}?${qs.toString()}`, { replace: true })
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 p-3 text-white shadow-md">
      {/* Head: ringkasan rute */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            {from || 'From'} → {to || 'To'}
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-xs">
            {indoDate(depart)} · {pax} penumpang · {cls}
          </div>
        </div>
        <div className="hidden md:block opacity-90 text-sm">✈️ Hasil Pencarian</div>
      </div>

      {/* Date scroller (5 hari) */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {[-1,0,1,2,3].map((off) => {
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
              <div className="opacity-80">{new Date(iso).toLocaleDateString('id-ID', { weekday:'short' })}</div>
              <div>{new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short' })}</div>
            </button>
          )
        })}
        {/* Kalender */}
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

      {/* Quick badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="rounded-full bg-white/15 px-3 py-1">🎫 Gratis Antar Jemput Bandara</span>
        <span className="rounded-full bg-white/15 px-3 py-1">🛡️ 11.11 Super Sale</span>
        <span className="rounded-full bg-white/15 px-3 py-1">🎓 Tiket Pelajar</span>
      </div>
    </div>
  )
}

/* Toolbar sortir (opsional terpisah, tanpa harga) */
export function SortToolbar({
  active, setActive
}: { active: TabKey; setActive: (k: TabKey) => void }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      <button
        onClick={() => setActive('durasi')}
        className={`rounded-xl border px-3 py-2 text-sm ${active==='durasi' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
        Durasi tersingkat
      </button>
      <button
        onClick={() => setActive('lainnya')}
        className={`rounded-xl border px-3 py-2 text-sm ${active==='lainnya' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
        Lainnya
      </button>
      <div className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-center text-sm text-slate-400">
        (Sortir harga disembunyikan)
      </div>
    </div>
  )
}
