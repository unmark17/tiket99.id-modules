import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type TripType = 'oneway' | 'roundtrip'

export default function FlightSearchCard(){
  const nav = useNavigate()
  const [trip, setTrip] = useState<TripType>('oneway')
  const [from, setFrom] = useState('SUB')    // Surabaya
  const [to, setTo] = useState('JED')        // Jeddah (umroh)
  const [go, setGo] = useState<string>('')
  const [back, setBack] = useState<string>('')
  const [pax, setPax] = useState<number>(1)
  const [cls, setCls] = useState<'Economy'|'Business'>('Economy')

  const disabled = useMemo(()=> trip==='roundtrip' ? !(from && to && go && back && pax>0) : !(from && to && go && pax>0), [trip,from,to,go,back,pax])

  function swap(){ const a = from; setFrom(to); setTo(a) }

  function submit(e: React.FormEvent){
    e.preventDefault()
    // Untuk sekarang: navigate ke /seats dengan query (filter client-side di halaman seats)
    const q = new URLSearchParams({
      from, to, go, pax: String(pax), cls, trip
    }).toString()
    nav(`/seats?${q}`)
  }

  return (
    <div className="relative -mt-28">
      <div className="mx-auto max-w-6xl px-4">
        <form onSubmit={submit} className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-4 md:p-5">
          <div className="flex items-center gap-4 mb-3">
            <button type="button" onClick={()=>setTrip('oneway')} className={`text-sm px-3 py-1.5 rounded-full border ${trip==='oneway'?'bg-slate-900 text-white':'bg-white'}`}>Sekali jalan</button>
            <button type="button" onClick={()=>setTrip('roundtrip')} className={`text-sm px-3 py-1.5 rounded-full border ${trip==='roundtrip'?'bg-slate-900 text-white':'bg-white'}`}>Pulang-pergi</button>
            <span className="text-xs text-slate-500">Pesawat · Umroh</span>
          </div>

          <div className="grid md:grid-cols-5 gap-3">
            <div className="md:col-span-1">
              <label className="text-xs text-slate-600">Dari</label>
              <div className="flex gap-2">
                <input className="w-full border rounded-xl px-3 py-2" value={from} onChange={e=>setFrom(e.target.value.toUpperCase())} placeholder="SUB" />
                <button type="button" onClick={swap} className="px-2 rounded-xl border">↔</button>
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-slate-600">Ke</label>
              <input className="w-full border rounded-xl px-3 py-2" value={to} onChange={e=>setTo(e.target.value.toUpperCase())} placeholder="JED/MED" />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-slate-600">Pergi</label>
              <input type="date" className="w-full border rounded-xl px-3 py-2" value={go} onChange={e=>setGo(e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-slate-600">Pulang</label>
              <input type="date" disabled={trip!=='roundtrip'} className="w-full border rounded-xl px-3 py-2 disabled:bg-slate-100" value={back} onChange={e=>setBack(e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-slate-600">Penumpang · Kelas</label>
              <div className="flex gap-2">
                <input type="number" min={1} className="w-24 border rounded-xl px-3 py-2" value={pax} onChange={e=>setPax(Number(e.target.value))} />
                <select className="flex-1 border rounded-xl px-3 py-2" value={cls} onChange={e=>setCls(e.target.value as any)}>
                  <option>Economy</option>
                  <option>Business</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button disabled={disabled} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-50">Ayo Cari</button>
          </div>
        </form>
      </div>
    </div>
  )
}
