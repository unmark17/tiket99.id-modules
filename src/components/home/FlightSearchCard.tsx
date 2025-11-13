import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type TripType = 'oneway' | 'roundtrip'

export default function FlightSearchCard(){
  const nav = useNavigate()
  const [trip, setTrip] = useState<TripType>('oneway')
  const [from, setFrom] = useState('SUB')
  const [to, setTo] = useState('JED')
  const [go, setGo] = useState<string>('')
  const [back, setBack] = useState<string>('')
  const [pax, setPax] = useState<number>(1)
  const [cls, setCls] = useState<'Economy'|'Business'|'Infant'>('Economy')

  const [openFrom, setOpenFrom] = useState(false)
  const [openTo, setOpenTo] = useState(false)

  // ——— Master list
  const citiesID = [
    { code: 'CGK', name: 'Jakarta (Soekarno-Hatta)' },
    { code: 'SUB', name: 'Surabaya' },
    { code: 'UPG', name: 'Makassar' },
    { code: 'KNO', name: 'Medan' },
    { code: 'SOC', name: 'Solo' },
    { code: 'PLM', name: 'Palembang' },
    { code: 'BTH', name: 'Batam' },
    { code: 'BTJ', name: 'Aceh' },
    { code: 'PDG', name: 'Padang' },
    { code: 'BPN', name: 'Balikpapan' },
    { code: 'LOP', name: 'Lombok' },
  ]
  const holy = [
    { code: 'JED', name: 'Jeddah' },
    { code: 'MED', name: 'Madinah' },
  ]

  // ——— Opsi dinamis sesuai trip
  const fromOptions = useMemo(() => {
    return trip === 'oneway' ? [...citiesID, ...holy] : citiesID
  }, [trip])

  const toOptions = useMemo(() => {
    return trip === 'oneway' ? [...holy, ...citiesID] : holy
  }, [trip])

  // ——— Pastikan value valid saat trip berubah
  useEffect(() => {
    if (!fromOptions.find(o => o.code === from)) setFrom(fromOptions[0]?.code || '')
    if (!toOptions.find(o => o.code === to)) setTo(toOptions[0]?.code || '')
    setOpenFrom(false); setOpenTo(false)
  }, [trip]) // eslint-disable-line react-hooks/exhaustive-deps

  const disabled = useMemo(() =>
    trip === 'roundtrip'
      ? !(from && to && go && back && pax > 0)
      : !(from && to && go && pax > 0),
    [trip, from, to, go, back, pax]
  )

  function swap(){
    const a = from
    setFrom(to)
    setTo(a)
  }

  function submit(e: React.FormEvent) {
  e.preventDefault()
  const tripNorm = trip === 'roundtrip' ? 'PP' : 'ONE_WAY'
  const q = new URLSearchParams({
    from,
    to,
    depart: go,
    trip: tripNorm,
  })
  nav(`/search?${q.toString()}`)
}

  const labelFrom = fromOptions.find(o=>o.code===from)?.name || from
  const labelTo   = toOptions.find(o=>o.code===to)?.name   || to

  return (
    <div className="relative -mt-28">
      <div className="mx-auto max-w-6xl px-4">
        <form
          onSubmit={submit}
          className="rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 p-5 md:p-6 transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)]"
        >
          {/* Tombol trip */}
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => setTrip('oneway')}
              className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-200 ${
                trip === 'oneway'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-blue-50 text-slate-600'
              }`}
            >
              Sekali jalan
            </button>
            <button
              type="button"
              onClick={() => setTrip('roundtrip')}
              className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-200 ${
                trip === 'roundtrip'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-blue-50 text-slate-600'
              }`}
            >
              Pulang-pergi
            </button>
            <span className="text-xs text-slate-500">Pesawat · Umroh</span>
          </div>

          {/* Grid form */}
          <div className="grid gap-4 items-end md:grid-cols-[1fr_auto_1fr_1fr_1fr_1fr]">
            {/* D A R I */}
            <div className="relative">
              <label className="text-xs text-slate-600 mb-1 block">Dari</label>
              <div
                className="border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-700 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 cursor-pointer relative transition-all duration-200"
                onClick={() => setOpenFrom(!openFrom)}
              >
                {labelFrom}
              </div>
              <div
                className={`absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-20 transition-all duration-200 origin-top ${
                  openFrom ? 'scale-y-100 opacity-100' : 'scale-y-75 opacity-0 pointer-events-none'
                }`}
              >
                {fromOptions.map(opt => (
                  <div
                    key={opt.code}
                    className={`px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer ${
                      opt.code===from ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-700'
                    }`}
                    onClick={() => { setFrom(opt.code); setOpenFrom(false) }}
                  >
                    {opt.name}
                  </div>
                ))}
              </div>
            </div>

            {/* S W A P */}
            <div className="flex items-center justify-center pb-1">
              <button
                type="button"
                onClick={swap}
                className="px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-blue-50 shadow-sm transition"
                title="Tukar rute"
              >
                ↔
              </button>
            </div>

            {/* K E */}
            <div className="relative">
              <label className="text-xs text-slate-600 mb-1 block">Ke</label>
              <div
                className="border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-700 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 cursor-pointer relative transition-all duration-200"
                onClick={() => setOpenTo(!openTo)}
              >
                {labelTo}
              </div>
              <div
                className={`absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-20 transition-all duration-200 origin-top ${
                  openTo ? 'scale-y-100 opacity-100' : 'scale-y-75 opacity-0 pointer-events-none'
                }`}
              >
                {toOptions.map(opt => (
                  <div
                    key={opt.code}
                    className={`px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer ${
                      opt.code===to ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-700'
                    }`}
                    onClick={() => { setTo(opt.code); setOpenTo(false) }}
                  >
                    {opt.name}
                  </div>
                ))}
              </div>
            </div>

            {/* P E R G I */}
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Pergi</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none shadow-sm transition-all duration-200"
                value={go}
                onChange={e => setGo(e.target.value)}
              />
            </div>

            {/* P U L A N G */}
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Pulang</label>
              <input
                type="date"
                disabled={trip !== 'roundtrip'}
                className="w-full border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-700 disabled:bg-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:outline-none shadow-sm transition-all duration-200"
                value={back}
                onChange={e => setBack(e.target.value)}
              />
            </div>

            {/* P E N U M P A N G · K E L A S */}
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Penumpang · Kelas</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  className="w-24 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none shadow-sm transition-all duration-200"
                  value={pax}
                  onChange={e => setPax(Number(e.target.value))}
                />
                <select
                  className="flex-1 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all duration-200"
                  value={cls}
                  onChange={e => setCls(e.target.value as any)}
                >
                  <option>Economy</option>
                  <option>Business</option>
                  <option>Infant</option>
                </select>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="mt-6 flex items-center justify-end">
            <button
              disabled={disabled}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              ✈️ Ayo Cari
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
