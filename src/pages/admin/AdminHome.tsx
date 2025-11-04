import React from 'react'
import { Link } from 'react-router-dom'
import { useSeats, Seat } from '@/lib/store/seats'

type ModalState =
  | { open: false }
  | { open: true; mode: 'create'; initial?: Partial<Seat> }
  | { open: true; mode: 'edit'; initial: Seat }

type ConfirmState =
  | { open: false }
  | { open: true; id: string; label: string }

type SortKey = 'id' | 'route' | 'airline' | 'date' | 'available' | 'price'
type SortDir = 'asc' | 'desc'

export default function AdminHome() {
  const { seats, addSeat, updateSeat, deleteSeat, resetDemo } = useSeats()

  // modal form & modal konfirmasi
  const [modal, setModal] = React.useState<ModalState>({ open: false })
  const [confirm, setConfirm] = React.useState<ConfirmState>({ open: false })

  // filter & sorting state
  const [keyword, setKeyword] = React.useState('')
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')

  // ringkasan
  const totalSeat = seats.reduce((a, b) => a + b.available, 0)
  const avgPrice = Math.round(seats.reduce((a, b) => a + b.price, 0) / (seats.length || 1))

  // filter seats
  const filtered = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    const inRange = (d: string) => {
      if (dateFrom && d < dateFrom) return false
      if (dateTo && d > dateTo) return false
      return true
    }
    return seats.filter(s => {
      const hit =
        !kw ||
        s.id.toLowerCase().includes(kw) ||
        s.route.toLowerCase().includes(kw) ||
        s.airline.toLowerCase().includes(kw)
      return hit && inRange(s.date)
    })
  }, [seats, keyword, dateFrom, dateTo])

  // sort seats
  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      let va: any = a[sortKey]
      let vb: any = b[sortKey]
      if (sortKey === 'price' || sortKey === 'available') {
        return (va - vb) * mul
      }
      return String(va).localeCompare(String(vb)) * mul
    })
    return arr
  }, [filtered, sortKey, sortDir])

  function handleCreate(payload: Omit<Seat, 'id'>) {
    addSeat(payload)
    setModal({ open: false })
  }
  function handleUpdate(updated: Seat) {
    updateSeat(updated)
    setModal({ open: false })
  }
  function askDelete(id: string, label: string) {
    setConfirm({ open: true, id, label })
  }
  function confirmDelete() {
    if (confirm.open) deleteSeat(confirm.id)
    setConfirm({ open: false })
  }

  function toggleSort(key: SortKey) {
    setSortKey((prev) => {
      if (prev === key) {
        // toggle direction
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDir('asc')
      return key
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Kelola available seat, approval booking, dan monitoring pembayaran.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetDemo} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">
            Reset Demo
          </button>
          <button
            onClick={() => setModal({ open: true, mode: 'create', initial: { route: 'SUB–JED', airline: 'Garuda (GA972)' } })}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            + Tambah Seat
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Rute Aktif" value={seats.length} subtitle="Tersedia untuk di-publish" />
        <StatCard title="Total Seat" value={totalSeat} subtitle="Siap dijual" />
        <StatCard title="Avg Harga" value={`Rp ${isFinite(avgPrice) ? avgPrice.toLocaleString('id-ID') : 0}`} subtitle="Per rute" />
      </div>

      {/* Filter & Sorting */}
      <div className="mt-6 rounded-2xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Cari (ID/Route/Maskapai)</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="mis. SUB–JED atau Garuda"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Urutkan</label>
            <div className="flex gap-2">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="date">Tanggal</option>
                <option value="route">Rute</option>
                <option value="airline">Maskapai</option>
                <option value="available">Seat</option>
                <option value="price">Harga</option>
                <option value="id">ID</option>
              </select>
              <button
                onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                className="shrink-0 rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
              >
                {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel seat */}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-semibold">Available Seat</div>
          <div className="text-xs text-slate-500">{sorted.length} item</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <Th onClick={() => toggleSort('id')} active={sortKey === 'id'} dir={sortDir}>ID</Th>
                <Th onClick={() => toggleSort('route')} active={sortKey === 'route'} dir={sortDir}>Rute</Th>
                <Th onClick={() => toggleSort('airline')} active={sortKey === 'airline'} dir={sortDir}>Maskapai</Th>
                <Th onClick={() => toggleSort('date')} active={sortKey === 'date'} dir={sortDir}>Tanggal</Th>
                <Th onClick={() => toggleSort('available')} active={sortKey === 'available'} dir={sortDir}>Seat Tersedia</Th>
                <Th onClick={() => toggleSort('price')} active={sortKey === 'price'} dir={sortDir}>Harga</Th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
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
                        onClick={() => askDelete(s.id, `${s.route} – ${s.airline} (${s.date})`)}
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
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Seat */}
      {modal.open && (
        <SeatModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal({ open: false })}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirm.open && (
        <ConfirmDialog
          title="Hapus Seat"
          message={<>Yakin ingin menghapus seat <b>{confirm.label}</b>? Tindakan ini tidak bisa dibatalkan.</>}
          onCancel={() => setConfirm({ open: false })}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

/* ---------- small components ---------- */

function StatCard({ title, value, subtitle }: { title: string; value: React.ReactNode; subtitle?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
    </div>
  )
}

function Th({
  children, onClick, active, dir,
}: { children: React.ReactNode; onClick?: () => void; active?: boolean; dir?: SortDir }) {
  return (
    <th className="px-4 py-2">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 ${onClick ? 'hover:underline' : ''}`}
      >
        <span>{children}</span>
        {active && <span className="text-xs opacity-60">{dir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </th>
  )
}

/* ============================= */
/* Modal Tambah/Edit Seat (form) */
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

  // validasi lanjutan (batas wajar)
  const MIN_SEAT = 1
  const MAX_SEAT = 500
  const MIN_PRICE = 500_000
  const MAX_PRICE = 100_000_000

  const [error, setError] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const errs: string[] = []
    if (!route.trim()) errs.push('Rute wajib diisi.')
    if (!airline.trim()) errs.push('Maskapai wajib diisi.')
    if (!date) errs.push('Tanggal wajib diisi.')
    if (!Number.isFinite(available) || available < MIN_SEAT || available > MAX_SEAT) {
      errs.push(`Seat tersedia harus antara ${MIN_SEAT}–${MAX_SEAT}.`)
    }
    if (!Number.isFinite(price) || price < MIN_PRICE || price > MAX_PRICE) {
      errs.push(`Harga harus antara Rp ${MIN_PRICE.toLocaleString('id-ID')} – Rp ${MAX_PRICE.toLocaleString('id-ID')}.`)
    }
    if (errs.length) {
      setError(errs.join(' '))
      return
    }

    if (isEdit && initial?.id) {
      onUpdate({ id: initial.id!, route: route.trim(), airline: airline.trim(), date, available, price })
    } else {
      onCreate({ route: route.trim(), airline: airline.trim(), date, available, price })
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-2xl border bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{isEdit ? 'Edit Seat' : 'Tambah Seat'}</div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Rute">
            <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="mis. SUB–JED"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>
          <Field label="Maskapai">
            <input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="mis. Garuda (GA972)"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>
          <Field label="Tanggal">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>
          <Field label={`Seat Tersedia (${MIN_SEAT}–${MAX_SEAT})`}>
            <input type="number" min={MIN_SEAT} max={MAX_SEAT}
              value={Number.isFinite(available) ? available : 0}
              onChange={(e) => setAvailable(parseInt(e.target.value || '0', 10))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>
          <Field label={`Harga (Rp) (${MIN_PRICE.toLocaleString('id-ID')} – ${MAX_PRICE.toLocaleString('id-ID')})`} span2>
            <input type="number" min={MIN_PRICE} max={MAX_PRICE}
              value={Number.isFinite(price) ? price : 0}
              onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>
        </div>

        {error && <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Batal</button>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {isEdit ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}

/* ======================= */
/* Modal Konfirmasi Hapus  */
/* ======================= */
function ConfirmDialog({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string
  message: React.ReactNode
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl">
        <div className="mb-2 text-lg font-semibold">{title}</div>
        <div className="text-sm text-slate-700">{message}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Batal</button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
