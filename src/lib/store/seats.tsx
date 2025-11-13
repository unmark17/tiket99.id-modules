import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type TripType = 'PP' | 'ONE_WAY'

export type Seat = {
  id: string
  route: string
  airline: string
  date: string        // yyyy-mm-dd
  available: number
  price: number       // rupiah
  programDays: number // NEW
  tripType: TripType  // NEW
}

type Ctx = {
  seats: Seat[]
  addSeat: (payload: Omit<Seat, 'id'>) => Seat
  updateSeat: (seat: Seat) => void
  deleteSeat: (id: string) => void
  resetDemo: () => void
  upsertMany: (items: Seat[]) => { created: number; updated: number } // NEW
}

const SeatsCtx = createContext<Ctx | null>(null)
const KEY = 't99.seats'

// Demo data awal
const DEMO: Seat[] = [
  { id: 'SEAT-001', route: 'SUB–JED', airline: 'Garuda (GA972)', date: '2025-12-10', available: 24, price: 12_500_000, programDays: 12, tripType: 'PP' },
  { id: 'SEAT-002', route: 'CGK–MED', airline: 'Saudia (SV819)', date: '2025-12-03', available: 18, price: 11_250_000, programDays: 10, tripType: 'ONE_WAY' },
  { id: 'SEAT-003', route: 'SUB–JED', airline: 'Lion (JT96)',   date: '2025-12-15', available: 32, price: 9_750_000,  programDays: 9,  tripType: 'PP'  },
]

// Normalisasi record (untuk compat data lama)
function normalizeSeat(s: any): Seat {
  return {
    id: String(s.id),
    route: String(s.route),
    airline: String(s.airline),
    date: String(s.date),
    available: Number(s.available ?? 0),
    price: Number(s.price ?? 0),
    programDays: Number(s.programDays ?? 9),
    tripType: (String(s.tripType ?? 'PP').toUpperCase() === 'ONE_WAY' ? 'ONE_WAY' : 'PP'),
  }
}

export function SeatsProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEMO
    try {
      const arr = JSON.parse(raw) as any[]
      return arr.map(normalizeSeat)
    } catch {
      return DEMO
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(seats))
  }, [seats])

  function nextId(prev: Seat[]) {
    // ambil nomor terbesar, lalu +1 agar aman bila data pernah dihapus
    const max = prev.reduce((m, s) => {
      const n = parseInt((s.id.match(/\d+$/)?.[0] ?? '0'), 10)
      return Math.max(m, isFinite(n) ? n : 0)
    }, 0)
    return `SEAT-${String(max + 1).padStart(3, '0')}`
  }

  function addSeat(payload: Omit<Seat, 'id'>): Seat {
    const seat: Seat = normalizeSeat({ id: nextId(seats), ...payload })
    setSeats(prev => [seat, ...prev])
    return seat
  }

  function updateSeat(updated: Seat) {
    const u = normalizeSeat(updated)
    setSeats(prev => prev.map(s => (s.id === u.id ? u : s)))
  }

  function deleteSeat(id: string) {
    setSeats(prev => prev.filter(s => s.id !== id))
  }

  function resetDemo() {
    setSeats(DEMO)
  }

  // Tambah/Update massal (dipakai import)
  function upsertMany(items: Seat[]) {
    let created = 0, updated = 0
    setSeats(prev => {
      const map = new Map(prev.map(s => [s.id, s] as const))
      for (const raw of items) {
        const item = normalizeSeat(raw)
        if (map.has(item.id)) {
          map.set(item.id, item); updated++
        } else {
          map.set(item.id, item); created++
        }
      }
      return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id))
    })
    return { created, updated }
  }

  const value = useMemo(
    () => ({ seats, addSeat, updateSeat, deleteSeat, resetDemo, upsertMany }),
    [seats]
  )

  return <SeatsCtx.Provider value={value}>{children}</SeatsCtx.Provider>
}

export function useSeats() {
  const ctx = useContext(SeatsCtx)
  if (!ctx) throw new Error('useSeats must be used within SeatsProvider')
  return ctx
}
