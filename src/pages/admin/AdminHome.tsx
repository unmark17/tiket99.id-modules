import React from 'react'
import { Link } from 'react-router-dom'
import { useSeats, Seat } from '@/lib/store/seats'
import { useAuth } from '@/lib/store/auth'

type ModalState =
  | { open: false }
  | { open: true; mode: 'create'; initial?: Partial<Seat> }
  | { open: true; mode: 'edit'; initial: Seat }

type ConfirmState =
  | { open: false }
  | { open: true; id: string; label: string }

type SortKey = 'id' | 'route' | 'airline' | 'date' | 'available' | 'price'
type SortDir = 'asc' | 'desc'

const PRESET_ROUTES = ['SUB–JED', 'CGK–MED', 'SUB–MED', 'CGK–JED']
const PRESET_AIRLINES = ['Garuda (GA972)', 'Saudia (SV819)', 'Lion (JT96)', 'AirAsia (QZ8501)']

export default function AdminHome() {
  const { session } = useAuth()
  const isAdmin = session?.user.role === 'ADMIN'

  const { seats, addSeat, updateSeat, deleteSeat, resetDemo, upsertMany } = useSeats()
  const [modal, setModal] = React.useState<ModalState>({ open: false })
  const [confirm, setConfirm] = React.useState<ConfirmState>({ open: false })

  // filter & sorting
  const [keyword, setKeyword] = React.useState('')
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')

  // pagination
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const totalSeat = seats.reduce((a, b) => a + b.available, 0)
  const avgPrice = Math.round(seats.reduce((a, b) => a + b.price, 0) / (seats.length || 1))

  // filter
  const filtered = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    const inRange = (d: string) => (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo)
    return seats.filter(s => {
      const hit =
        !kw ||
        s.id.toLowerCase().includes(kw) ||
        s.route.toLowerCase().includes(kw) ||
        s.airline.toLowerCase().includes(kw)
      return hit && inRange(s.date)
    })
  }, [seats, keyword, dateFrom, dateTo])

  // sort
  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    const mul = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const va = a[sortKey] as any
      const vb = b[sortKey] as any
      if (sortKey === 'price' || sortKey === 'available') return (va - vb) * mul
      return String(va).localeCompare(String(vb)) * mul
    })
    return arr
  }, [filtered, sortKey, sortDir])

  // paginate
  const totalRows = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const curPage = Math.min(page, totalPages)
  const start = (curPage - 1) * pageSize
  const pageRows = sorted.slice(start, start + pageSize)

  React.useEffect(() => {
    setPage(1) // reset saat filter berubah
  }, [keyword, dateFrom, dateTo, pageSize])

  function handleCreate(payload: Omit<Seat, 'id'>) {
    if (!isAdmin) return
    addSeat(payload)
    setModal({ open: false })
  }
  function handleUpdate(updated: Seat) {
    if (!isAdmin) return
    updateSeat(updated)
    setModal({ open: false })
  }
  function askDelete(id: string, label: string) {
    if (!isAdmin) return
    setConfirm({ open: true, id, label })
  }
  function confirmDelete() {
    if (!isAdmin) return setConfirm({ open: false })
    if (confirm.open) deleteSeat(confirm.id)
    setConfirm({ open: false })
  }
  function toggleSort(key: SortKey) {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDir('asc')
      return key
    })
  }

  // ====== IMPORT CSV ======
  // Format header yang disarankan: ID,Route,Airline,Date,Available,Price
  const fileRef = React.useRef<HTMLInputElement>(null)
  async function onPickCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    const rows = parseCsv(text)
    if (rows.length === 0) {
      alert('CSV kosong / tidak terbaca.')
      return
    }

    // normalisasi header
    const header = rows[0].map(h => h.trim().toLowerCase())
    const idx = {
      id: header.findIndex(h => ['id'].includes(h)),
      route: header.findIndex(h => ['route','rute'].includes(h)),
      airline: header.findIndex(h => ['airline','maskapai'].includes(h)),
      date: header.findIndex(h => ['date','tanggal'].includes(h)),
      available: header.findIndex(h => ['available','seat','available_seat'].includes(h)),
      price: header.findIndex(h => ['price','harga'].includes(h)),
    }
    const miss = Object.entries(idx).filter(([_, i]) => i < 0).map(([k]) => k)
    if (miss.length) {
      alert(`Header CSV kurang: ${miss.join(', ')}`)
      return
    }

    // parse rows → Seat[]
    const imported: Seat[] = []
    for (let r = 1; r < rows.length; r++) {
      const cols = rows[r]
      if (cols.every(c => c.trim() === '')) continue
      const seat: Seat = {
        id: cols[idx.id].trim(),
        route: cols[idx.route].trim(),
        airline: cols[idx.airline].trim(),
        date: cols[idx.date].trim(), // yyyy-mm-dd
        available: toInt(cols[idx.available]),
        price: toInt(cols[idx.price]),
      }
      // validasi minimal
      if (!seat.id || !seat.route || !seat.airline || !isDate(seat.date)) {
        console.warn('Row dilewati (data kurang valid):', rows[r]); continue
      }
      if (seat.available <= 0 || seat.price <= 0) {
        console.warn('Row dilewati (angka tidak valid):', rows[r]); continue
      }
      imported.push(seat)
    }

    if (imported.length === 0) {
      alert('Tidak ada baris valid untuk diimport.')
      return
    }

    if (!isAdmin) {
      alert('Hanya ADMIN yang boleh import.')
      return
    }

    const { created, updated } = upsertMany(imported)
    alert(`Import selesai.\nDibuat baru: ${created}\nDiupdate: ${updated}`)

    // reset input supaya bisa pilih file yang sama lagi
    if (fileRef.current) fileRef.current.value = ''
  }

  function triggerPickCsv() {
    if (!isAdmin) return
    fileRef.current?.click()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Kelola available seat, approval booking, dan monitoring pembayaran.</p>
        </div>
        <div className="flex gap-2">
          {/* Import CSV (ADMIN only) */}
          <input ref={fileRef} type="file" accept=".csv" onChange={onPickCsv} className="hidden" />
          <button
            onClick={triggerPickCsv}
            disabled={!isAdmin}
            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
            title={isAdmin ? 'Import CSV' : 'Khusus ADMIN'}
          >
            Import CSV
          </button>

          <button onClick={resetDemo} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">
            Reset Demo
          </button>

          <button
            onClick={() => setModal({ open: true, mode: 'create', initial: { route: PRESET_ROUTES[0], airline: PRESET_AIRLINES[0] } })}
            disabled={!isAdmin}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            title={isAdmin ? 'Tambah Seat' : 'Khusus ADMIN'}
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
      <FilterBar
        keyword={keyword} setKeyword={setKeyword}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        sortKey={sortKey} setSortKey={setSortKey}
        sortDir={sortDir} setSortDir={setSortDir}
        pageSize={pageSize} setPageSize={setPageSize}
      />

      {/* Tabel seat */}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-semibold">Available Seat</div>
          <div className="text-xs text-slate-500">
            {totalRows} item • Hal {curPage}/{totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <Th onClick={() => toggleSort('id')} active={sortKey === 'id'} dir={sortDir}>ID</Th>
                <Th onClick={() => toggleSort('route')} active={sortKey === 'route'} dir={sortDir}>Rute</Th>
                <Th onClick={() => toggleSort('airline')} active={sortKey === 'airline'} dir={sortDir}>Maskapai</Th>
                <Th onClick={() => toggleSort('date')} active={sortKey === 'date'} dir={sortDir}>Tanggal</Th>
                <Th onClick={() => toggleSort('available')} active={sortKey === 'available'} dir={sortDir}>Seat</Th>
                <Th onClick={() => toggleSort('price')} active={sortKey === 'price'} dir={sortDir}>Harga</Th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{s.id}</td>
                  <td className="px-4 py-2">{s.route}</td>
                  <td className="px-4 py-2">{s.airline}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{s.date}</span>
                      <DateBadge date={s.date} />
                    </div>
                  </td>
                  <td className="px-4 py-2">{s.available}</td>
                  <td className="px-4 py-2">Rp {s.price.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setModal({ open: true, mode: 'edit', initial: s })}
                        disabled={!isAdmin}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
                        title={isAdmin ? 'Edit' : 'Khusus ADMIN'}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => askDelete(s.id, `${s.route} – ${s.airline} (${s.date})`)}
                        disabled={!isAdmin}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
                        title={isAdmin ? 'Hapus' : 'Khusus ADMIN'}
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
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <Pagination
          curPage={curPage} totalPages={totalPages}
          totalRows={totalRows} pageRows={pageRows.length}
          setPage={setPage}
        />
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

function FilterBar(props: {
  keyword: string; setKeyword: (v: string) => void
  dateFrom: string; setDateFrom: (v: string) => void
  dateTo: string; setDateTo: (v: string) => void
  sortKey: SortKey; setSortKey: (k: SortKey) => void
  sortDir: SortDir; setSortDir: (d: SortDir) => void
  pageSize: number; setPageSize: (n: number) => void
}) {
  const { keyword, setKeyword, dateFrom, setDateFrom, dateTo, setDateTo, sortKey, setSortKey, sortDir, setSortDir, pageSize, setPageSize } = props
  return (
    <div className="mt-6 rounded-2xl border bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
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
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Per Halaman</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

function Pagination({
  curPage, totalPages, totalRows, pageRows, setPage,
}: {
  curPage: number; totalPages: number; totalRows: number; pageRows: number; setPage: (n: number | ((p:number)=>number)) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <div>Menampilkan {pageRows} dari {totalRows} data</div>
      <div className="flex items-center gap-2">
        <button onClick={() => setPage(1)} disabled={curPage === 1} className="rounded-md border px-2 py-1 disabled:opacity-50">«</button>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={curPage === 1} className="rounded-md border px-2 py-1 disabled:opacity-50">‹</button>
        <span>Hal {curPage} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={curPage === totalPages} className="rounded-md border px-2 py-1 disabled:opacity-50">›</button>
        <button onClick={() => setPage(totalPages)} disabled={curPage === totalPages} className="rounded-md border px-2 py-1 disabled:opacity-50">»</button>
      </div>
    </div>
  )
}

function Th({
  children, onClick, active, dir,
}: { children: React.ReactNode; onClick?: () => void; active?: boolean; dir?: SortDir }) {
  return (
    <th className="px-4 py-2">
      <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 ${onClick ? 'hover:underline' : ''}`}>
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
  const [route, setRoute] = React.useState(initial?.route ?? PRESET_ROUTES[0])
  const [airline, setAirline] = React.useState(initial?.airline ?? PRESET_AIRLINES[0])
  const [date, setDate] = React.useState<string>(initial?.date ?? '')
  const [available, setAvailable] = React.useState<number>(Number(initial?.available ?? 20))
  const [price, setPrice] = React.useState<number>(Number(initial?.price ?? 12_500_000))

  const MIN_SEAT = 1, MAX_SEAT = 500
  const MIN_PRICE = 500_000, MAX_PRICE = 100_000_000
  const [error, setError] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const errs: string[] = []
    if (!route.trim()) errs.push('Rute wajib diisi.')
    if (!airline.trim()) errs.push('Maskapai wajib diisi.')
    if (!date) errs.push('Tanggal wajib diisi.')
    if (!Number.isFinite(available) || available < MIN_SEAT || available > MAX_SEAT) errs.push(`Seat harus ${MIN_SEAT}–${MAX_SEAT}.`)
    if (!Number.isFinite(price) || price < MIN_PRICE || price > MAX_PRICE) errs.push(`Harga harus Rp ${MIN_PRICE.toLocaleString('id-ID')} – Rp ${MAX_PRICE.toLocaleString('id-ID')}.`)
    if (errs.length) return setError(errs.join(' '))

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
            <select value={route} onChange={(e) => setRoute(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500">
              {PRESET_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Maskapai">
            <select value={airline} onChange={(e) => setAirline(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500">
              {PRESET_AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Tanggal">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>
          <Field label={`Seat (${MIN_SEAT}–${MAX_SEAT})`}>
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

/* ================= */
/* Badge H-7 Tanggal */
/* ================= */
function DateBadge({ date }: { date: string }) {
  const d = daysUntil(date)
  if (d === null) return null
  if (d < 0) return <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">Lewat</span>
  if (d <= 3) return <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">H-{d}</span>
  if (d <= 7) return <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">H-{d}</span>
  return <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">H-{d}</span>
}

function daysUntil(isoDate: string): number | null {
  const d = new Date(isoDate + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  const today = new Date()
  // normalisasi ke tanggal saja
  d.setHours(0,0,0,0)
  today.setHours(0,0,0,0)
  const diff = d.getTime() - today.getTime()
  return Math.round(diff / (1000*60*60*24))
}

/* ================== */
/* CSV Helper (No lib)*/
/* ================== */
function parseCsv(text: string): string[][] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const rows: string[][] = []
  for (const line of lines) {
    if (line.trim() === '') continue
    rows.push(splitCsvLine(line))
  }
  return rows
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = '', inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++ } // escaped quote
      else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

function toInt(v: string) {
  const n = parseInt(v.replace(/[^\d-]/g, ''), 10)
  return isFinite(n) ? n : 0
}

function isDate(v: string) {
  // simple check yyyy-mm-dd
  return /^\d{4}-\d{2}-\d{2}$/.test(v)
}
