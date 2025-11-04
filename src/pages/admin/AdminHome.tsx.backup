import React from 'react'
import { Link } from 'react-router-dom'

type Seat = {
  id: string
  route: string
  airline: string
  date: string        // yyyy-mm-dd
  available: number
  price: number       // rupiah
}

type ModalState =
  | { open: false }
  | { open: true; mode: 'create'; initial?: Partial<Seat> }
  | { open: true; mode: 'edit'; initial: Seat }

export default function AdminHome() {
  const [seats, setSeats] = React.useState<Seat[]>([
    { id: 'SEAT-001', route: 'SUB–JED', airline: 'Garuda (GA972)', date: '2025-12-10', available: 24, price: 12_500_000 },
    { id: 'SEAT-002', route: 'CGK–MED', airline: 'Saudia (SV819)', date: '2025-12-03', available: 18, price: 11_250_000 },
    { id: 'SEAT-003', route: 'SUB–JED', airline: 'Lion (JT96)',   date: '2025-12-15', available: 32, price: 9_750_000  },
  ])
  const [modal, setModal] = React.useState<ModalState>({ open: false })

  const totalSeat = seats.reduce((a, b) => a + b.available, 0)
  const avgPrice = Math.round(seats.reduce((a, b) => a + b.price, 0) / (seats.length || 1))

  function handleCreate(payload: Omit<Seat, 'id'>) {
    const nextId = `SEAT-${(seats.length + 1).toString().padStart(3, '0')}`
    setSeats(prev => [{ id: nextId, ...payload }, ...prev])
    setModal({ open: false })
  }

  function handleUpdate(updated: Seat) {
    setSeats(prev => prev.map(s => (s.id === updated.id ? updated : s)))
    setModal({ open: false })
  }

  function handleDelete(id: string) {
    const ok = window.confirm(`Hapus seat ${id}? Tindakan ini tidak bisa dibatalkan.`)
    if (!ok) return
    setSeats(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="text-slate-600">Kelola available seat, approval booking, dan monitoring pembayaran.</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Rute Aktif" value={seats.length} subtitle="Tersedia untuk di-publish" />
        <StatCard title="Total Seat" value={totalSeat} subtitle="Siap dijual" />
        <StatCard title="Avg Harga" value={`Rp ${avgPrice.toLocaleString('id-ID')}`} subtitle="Per rute" />
      </div>

      {/* Manajemen seat */}
      <div className="mt-8 overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-semibold">Available Seat</div>
          <button
            onClick={() => setModal({ open: true, mode: 'create', initial: { route: 'SUB–JED', airline: 'Garuda (GA972)' } })}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Tambah Seat
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Rute</th>
                <th className="px-4 py-2">Maskapai</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Seat Tersedia</th>
                <th className="px-4 py-2">Harga</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {seats.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{s.id}</td>
                  <td className="px-4 py-2">{s.route}</td>
                  <td className="px-4 py-2">{s.airline}</td>
                  <td className="px-4 py-2">{s.date}</td>
                  <td className="px-4 py-2">{s.available}</td>
                  <td className="px-4 py-2">Rp {s.price.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setModal({ open: true, mode: 'edit', initial: s })}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                      >
                        Hapus
                      </button>
                      <Link to="/seats" className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">
                        Lihat di Publik
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {seats.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Belum ada seat. Tambah seat baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <SeatModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal({ open: false })}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: React.ReactNode; subtitle?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
    </div>
  )
}

/* ============================= */
/* Modal Tambah/Edit Seat (sama) */
/* ============================= */
function SeatModal({
  mode,
  initial,
  onClose,
  onCreate,
  onUpdate,
}: {
  mode: 'create' | 'edit'
  initial?: Partial<Seat>
  onClose: () => void
  onCreate: (seat: Omit<Seat, 'id'>) => void
  onUpdate: (seat: Seat) => void
}) {
  const isEdit = mode === 'edit'
  const [route, setRoute] = React.useState(initial?.route ?? 'SUB–JED')
  const [airline, setAirline] = React.useState(initial?.airline ?? 'Garuda (GA972)')
  const [date, setDate] = React.useState<string>(initial?.date ?? '')
  const [available, setAvailable] = React.useState<number>(Number(initial?.available ?? 20))
  const [price, setPrice] = React.useState<number>(Number(initial?.price ?? 12_500_000))
  const [error, setError] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!route.trim() || !airline.trim() || !date) {
      setError('Rute, Maskapai, dan Tanggal wajib diisi.')
      return
    }
    if (!Number.isFinite(available) || available <= 0) {
      setError('Seat tersedia harus lebih dari 0.')
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Harga harus lebih dari 0.')
      return
    }

    if (isEdit && initial?.id) {
      onUpdate({
        id: initial.id,
        route: route.trim(),
        airline: airline.trim(),
        date,
        available,
        price,
      })
    } else {
      onCreate({
        route: route.trim(),
        airline: airline.trim(),
        date,
        available,
        price,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />

      {/* modal */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-2xl border bg-white p-5 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{isEdit ? 'Edit Seat' : 'Tambah Seat'}</div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Rute</label>
            <input
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="mis. SUB–JED"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Maskapai</label>
            <input
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              placeholder="mis. Garuda (GA972)"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Seat Tersedia</label>
            <input
              type="number"
              min={1}
              value={Number.isFinite(available) ? available : 0}
              onChange={(e) => setAvailable(parseInt(e.target.value || '0', 10))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Harga (Rp)</label>
            <input
              type="number"
              min={1}
              value={Number.isFinite(price) ? price : 0}
              onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {isEdit ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
