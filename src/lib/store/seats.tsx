import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Seat = {
  id: string
  route: string
  airline: string
  date: string        // yyyy-mm-dd
  available: number
  price: number       // rupiah
}

type Ctx = {
  seats: Seat[]
  addSeat: (payload: Omit<Seat, 'id'>) => Seat
  updateSeat: (seat: Seat) => void
  deleteSeat: (id: string) => void
  resetDemo: () => void
}

const SeatsCtx = createContext<Ctx | null>(null)
const KEY = 't99.seats'

const DEMO: Seat[] = [
  { id: 'SEAT-001', route: 'SUB–JED', airline: 'Garuda (GA972)', date: '2025-12-10', available: 24, price: 12_500_000 },
  { id: 'SEAT-002', route: 'CGK–MED', airline: 'Saudia (SV819)', date: '2025-12-03', available: 18, price: 11_250_000 },
  { id: 'SEAT-003', route: 'SUB–JED', airline: 'Lion (JT96)',   date: '2025-12-15', available: 32, price: 9_750_000  },
]

export function SeatsProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as Seat[] : DEMO
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(seats))
  }, [seats])

  function addSeat(payload: Omit<Seat, 'id'>): Seat {
    const nextId = `SEAT-${(seats.length + 1).toString().padStart(3, '0')}`
    const seat: Seat = { id: nextId, ...payload }
    setSeats(prev => [seat, ...prev])
    return seat
  }
  function updateSeat(updated: Seat) {
    setSeats(prev => prev.map(s => (s.id === updated.id ? updated : s)))
  }
  function deleteSeat(id: string) {
    setSeats(prev => prev.filter(s => s.id !== id))
  }
  function resetDemo() {
    setSeats(DEMO)
  }

  const value = useMemo(() => ({ seats, addSeat, updateSeat, deleteSeat, resetDemo }), [seats])
  return <SeatsCtx.Provider value={value}>{children}</SeatsCtx.Provider>
}

export function useSeats() {
  const ctx = useContext(SeatsCtx)
  if (!ctx) throw new Error('useSeats must be used within SeatsProvider')
  return ctx
}
