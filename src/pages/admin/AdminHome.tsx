import React from 'react'
import { Link } from 'react-router-dom'
import { useSeats, Seat } from '@/lib/store/seats'
import { useAuth } from '@/lib/store/auth'
import * as XLSX from 'xlsx'

type ModalState =
  | { open: false }
  | { open: true; mode: 'create'; initial?: Partial<Seat> }
  | { open: true; mode: 'edit'; initial: Seat }

type ConfirmState =
  | { open: false }
  | { open: true; id: string; label: string }

type SortKey = 'id' | 'route' | 'airline' | 'date' | 'programDays' | 'tripType' | 'available' | 'price'
type SortDir = 'asc' | 'desc'

const PRESET_ROUTES = ['SUB–JED', 'CGK–MED', 'SUB–MED', 'CGK–JED']
const PRESET_AIRLINES = ['Garuda (GA972)', 'Saudia (SV819)', 'Lion (JT96)']
const TRIP_TYPES: Array<{ value: 'PP' | 'ONE_WAY'; label: string }> = [
  { value: 'PP', label: 'PP (Pulang-Pergi)' },
  { value: 'ONE_WAY', label: 'One Way' },
]

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

  // multi-select filters
  const [routeFilter, setRouteFilter] = React.useState<string[]>([])
  const [airlineFilter, setAirlineFilter] = React.useState<string[]>([])

  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')

  // pagination
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // unique options untuk filter dropdown
  const routeOptions = React.useMemo(() => uniqStrings(seats.map(s => s.route)), [seats])
  const airlineOptions = React.useMemo(() => uniqStrings(seats.map(s => s.airline)), [seats])

  const totalSeat = seats.reduce((a, b) => a + b.available, 0)
  const avgPrice = Math.round(seats.reduce((a, b) => a + b.price, 0) / (seats.length || 1))

  // filter
  const filtered = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    const inRange = (d: string) => (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo)
    const inMulti = (selected: string[], value: string) => selected.length === 0 || selected.includes(value)

    return seats.filter(s => {
      const hitKw =
        !kw ||
        s.id.toLowerCase().includes(kw) ||
        s.route.toLowerCase().includes(kw) ||
        s.airline.toLowerCase().includes(kw)
      return hitKw && inMulti(routeFilter, s.route) && inMulti(airlineFilter, s.airline) && inRange(s.date)
    })
  }, [seats, keyword, dateFrom, dateTo, routeFilter, airlineFilter])

  // sort
  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    const mul = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const va = a[sortKey] as any
      const vb = b[sortKey] as any
      if (['price', 'available', 'programDays'].includes(sortKey)) return (va - vb) * mul
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
  }, [keyword, dateFrom, dateTo, pageSize, routeFilter, airlineFilter])

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

  // ====== IMPORT CSV/TSV/XLSX ======
  const fileRef = React.useRef<HTMLInputElement>(null)
  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const ext = (f.name.split('.').pop() || '').toLowerCase()

    let rows: string[][] = []
    if (ext === 'xlsx' || ext === 'xls' || ext === 'xlsm') {
      const data = await f.arrayBuffer()
      const wb = XLSX.read(data, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const json: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 })
      rows = (json as string[][]).filter(r => r && r.length && r.some(c => String(c).trim() !== ''))
    } else {
      const text = await f.text()
      rows = parseTable(text)
    }

    if (rows.length === 0) return alert('File kosong / tidak terbaca.')

    const header = rows[0].map(h => String(h).trim().toLowerCase())
    const idx = {
      id: header.findIndex(h => ['id'].includes(h)),
      route: header.findIndex(h => ['route','rute'].includes(h)),
      airline: header.findIndex(h => ['airline','maskapai'].includes(h)),
      date: header.findIndex(h => ['date','tanggal'].includes(h)),
      programDays: header.findIndex(h => ['program','programdays','program_hari','program_days'].includes(h)), // NEW
      tripType: header.findIndex(h => ['trip','triptype','trip_type','tipe','pp/oneway','pp_oneway'].includes(h)), // NEW
      available: header.findIndex(h => ['available','seat','available_seat'].includes(h)),
      price: header.findIndex(h => ['price','harga'].includes(h)),
    }
    const miss = Object.entries(idx).filter(([_, i]) => i < 0).map(([k]) => k)
    if (miss.length) return alert(`Header kurang: ${miss.join(', ')}`)

    const imported: Seat[] = []
    for (let r = 1; r < rows.length; r++) {
      const cols = rows[r]
      if (!cols || cols.every(c => String(c ?? '').trim() === '')) continue

      const programDays = toInt(String(cols[idx.programDays] ?? '')) || 9
      const tripType = normalizeTrip(String(cols[idx.tripType] ?? 'PP'))

      const seat: Seat = {
        id: String(cols[idx.id] ?? '').trim(),
        route: String(cols[idx.route] ?? '').trim(),
        airline: String(cols[idx.airline] ?? '').trim(),
        date: String(cols[idx.date] ?? '').trim(),
        programDays,
        tripType,
        available: toInt(String(cols[idx.available] ?? '')),
        price: toInt(String(cols[idx.price] ?? '')),
      }
      if (!seat.id || !seat.route || !seat.airline || !isDate(seat.date)) continue
      if (seat.available <= 0 || seat.price <= 0) continue
      imported.push(seat)
    }
    if (imported.length === 0) return alert('Tidak ada baris valid untuk diimport.')
    if (!isAdmin) return alert('Hanya ADMIN yang boleh import.')

    const { created, updated } = upsertMany(imported)
    alert(`Import selesai.\nDibuat baru: ${created}\nDiupdate: ${updated}`)
    if (fileRef.current) fileRef.current.value = ''
  }
  function triggerPickFile() {
    if (!isAdmin) return
    fileRef.current?.click()
  }

  // ===== Export CSV =====
  function exportCSV() {
    const rows = [
      ['ID', 'Route', 'Airline', 'Date', 'ProgramDays', 'TripType', 'Available', 'Price'],
      ...sorted.map(s => [s.id, s.route, s.airline, s.date, String(s.programDays), s.tripType, String(s.available), String(s.price)]),
    ]
    const csv = rows.map(r => r.map(escapeCsv).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `tiket99_seats_${todayIso()}.csv`)
  }

  // ===== Export XLSX =====
  function exportXLSX() {
    const aoa = [
      ['ID', 'Route', 'Airline', 'Date', 'ProgramDays', 'TripType', 'Available', 'Price'],
      ...sorted.map(s => [s.id, s.route, s.airline, s.date, s.programDays, s.tripType, s.available, s.price]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Seats')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    downloadBlob(blob, `tiket99_seats_${todayIso()}.xlsx`)
  }

  // ===== Export Template (header-only) =====
  function exportTemplateCSV() {
    const header = ['ID','Route','Airline','Date','ProgramDays','TripType','Available','Price']
    const csv = header.join(',') + '\r\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, 'tiket99_template_seats.csv')
  }
  function exportTemplateXLSX() {
    const ws = XLSX.utils.aoa_to_sheet([['ID','Route','Airline','Date','ProgramDays','TripType','Available','Price']])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    downloadBlob(blob, 'tiket99_template_seats.xlsx')
  }

  // ===== Export PDF (print-friendly) =====
  function exportPDF() {
    const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Daftar Seat — Tiket99.id</title>
<style>
*{box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
h1{margin:0 0 4px}.muted{color:#64748b;font-size:12px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left}
th{background:#f8fafc}
.tag{display:inline-block;border-radius:9999px;padding:2px 8px;font-size:10px;font-weight:700;color:white}
.tag.red{background:#dc2626}.tag.amber{background:#f59e0b}.tag.green{background:#10b981}
.tag.gray{background:#94a3b8}.tag.rose{background:#e11d48}
@page{margin:18mm}
</style>
</head>
<body>
<h1>Daftar Seat</h1>
<div class="muted">Tiket99.id • Dicetak: ${new Date().toLocaleString('id-ID')}</div>
<table>
<thead>
<tr>
  <th>ID</th><th>Rute</th><th>Maskapai</th><th>Tanggal</th><th>Program</th><th>Tipe</th><th>Seat</th><th>Harga</th><th>Badge</th>
</tr>
</thead>
<tbody>
${sorted.map(s => {
  const h = daysUntil(s.date)
  const hBadge = h === null ? '' :
    h < 0 ? `<span class="tag gray">Lewat</span>` :
    h <= 1 ? `<span class="tag rose">H-${h}</span>` :
    h <= 3 ? `<span class="tag red">H-${h}</span>` :
    h <= 7 ? `<span class="tag amber">H-${h}</span>` :
             `<span class="tag green">H-${h}</span>`
  const seatBadge = s.available < 10 ? `<span class="tag red">Low ${s.available}</span>` :
                    s.available < 20 ? `<span class="tag amber">Med ${s.available}</span>` :
                                       `<span class="tag green">OK ${s.available}</span>`
  return `<tr>
    <td>${s.id}</td><td>${s.route}</td><td>${s.airline}</td><td>${s.date}</td>
    <td>${s.programDays}H</td><td>${s.tripType === 'PP' ? 'PP' : 'One Way'}</td>
    <td>${s.available}</td><td>Rp ${s.price.toLocaleString('id-ID')}</td><td>${hBadge} ${seatBadge}</td>
  </tr>`
}).join('')}
</tbody>
</table>
<script>window.print()</script>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Kelola available seat, approval booking, dan monitoring pembayaran.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Import (ADMIN only) */}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,text/csv,text/tab-separated-values,.xlsx,.xls,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={onPickFile}
            className="hidden"
          />
          <button onClick={triggerPickFile} disabled={!isAdmin} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50" title={isAdmin ? 'Import CSV/TSV/XLSX' : 'Khusus ADMIN'}>
            Import CSV/TSV/XLSX
          </button>

          <button onClick={exportCSV} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">Export CSV</button>
          <button onClick={exportXLSX} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">Export XLSX</button>
          <button onClick={exportPDF} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">Export PDF</button>

          <button onClick={exportTemplateCSV} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">Template CSV</button>
          <button onClick={exportTemplateXLSX} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">Template XLSX</button>

          <button onClick={resetDemo} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">Reset Demo</button>

          <button
            onClick={() => setModal({ open: true, mode: 'create', initial: { route: PRESET_ROUTES[0], airline: PRESET_AIRLINES[0], programDays: 9, tripType: 'PP' } })}
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
        routeFilter={routeFilter} setRouteFilter={setRouteFilter} routeOptions={routeOptions}
        airlineFilter={airlineFilter} setAirlineFilter={setAirlineFilter} airlineOptions={airlineOptions}
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
                <Th onClick={() => toggleSort('programDays')} active={sortKey === 'programDays'} dir={sortDir}>Program</Th>
                <Th onClick={() => toggleSort('tripType')} active={sortKey === 'tripType'} dir={sortDir}>Tipe</Th>
                <Th onClick={() => toggleSort('available')} active={sortKey === 'available'} dir={sortDir}>Seat</Th>
                <Th onClick={() => toggleSort('price')} active={sortKey === 'price'} dir={sortDir}>Harga</Th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => {
                const h = daysUntil(s.date)
                let rowClass = ''
                if (h !== null) {
                  if (h < 0) rowClass = 'bg-slate-50'
                  else if (h <= 1 && s.available < 10) rowClass = 'bg-rose-100'
                  else if (h <= 3 && s.available < 10) rowClass = 'bg-red-50'
                  else if (h <= 7) rowClass = 'bg-amber-50'
                }
                return (
                  <tr key={s.id} className={`border-t ${rowClass}`}>
                    <td className="px-4 py-2 font-medium">{s.id}</td>
                    <td className="px-4 py-2">{s.route}</td>
                    <td className="px-4 py-2">{s.airline}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span>{s.date}</span>
                        <DateBadge date={s.date} />
                      </div>
                    </td>
                    <td className="px-4 py-2">{s.programDays}H</td>
                    <td className="px-4 py-2">{s.tripType === 'PP' ? 'PP' : 'One Way'}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span>{s.available}</span>
                        <SeatBadge n={s.available} />
                      </div>
                    </td>
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
                )
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
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
  routeFilter: string[]; setRouteFilter: (v: string[]) => void; routeOptions: string[]
  airlineFilter: string[]; setAirlineFilter: (v: string[]) => void; airlineOptions: string[]
  sortKey: SortKey; setSortKey: (k: SortKey) => void
  sortDir: SortDir; setSortDir: (d: SortDir) => void
  pageSize: number; setPageSize: (n: number) => void
}) {
  const {
    keyword, setKeyword,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    routeFilter, setRouteFilter, routeOptions,
    airlineFilter, setAirlineFilter, airlineOptions,
    sortKey, setSortKey, sortDir, setSortDir,
    pageSize, setPageSize
  } = props

  function onMultiSelectChange(e: React.ChangeEvent<HTMLSelectElement>, setter: (v: string[]) => void) {
    const values = Array.from(e.target.selectedOptions).map(o => o.value)
    setter(values)
  }

  const ctl = 'h-10 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500'
  const listCtl = 'h-[100px] w-full rounded-md border border-slate-300 px-2 py-2 focus:border-blue-500 focus:ring-blue-500'

  return (
    <div className="mt-6 rounded-2xl border bg-white p-4">
      {/* ROW 1: search + multi-selects */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <label className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Cari (ID/Route/Maskapai)</span>
          </label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="mis. SUB–JED atau Garuda"
            className={ctl}
          />
        </div>

        <div className="md:col-span-4">
          <label className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Rute (multi)</span>
            <span className="space-x-2 text-xs">
              <button type="button" onClick={() => setRouteFilter(routeOptions)} className="text-blue-600 hover:underline">Pilih semua</button>
              <button type="button" onClick={() => setRouteFilter([])} className="text-slate-600 hover:underline">Bersihkan</button>
            </span>
          </label>
          <select
            multiple
            value={routeFilter}
            onChange={(e) => onMultiSelectChange(e, setRouteFilter)}
            className={listCtl}
          >
            {routeOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="mt-1 text-xs text-slate-500">{routeFilter.length ? `${routeFilter.length} dipilih` : 'Semua rute'}</div>
        </div>

        <div className="md:col-span-4">
          <label className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Maskapai (multi)</span>
            <span className="space-x-2 text-xs">
              <button type="button" onClick={() => setAirlineFilter(airlineOptions)} className="text-blue-600 hover:underline">Pilih semua</button>
              <button type="button" onClick={() => setAirlineFilter([])} className="text-slate-600 hover:underline">Bersihkan</button>
            </span>
          </label>
          <select
            multiple
            value={airlineFilter}
            onChange={(e) => onMultiSelectChange(e, setAirlineFilter)}
            className={listCtl}
          >
            {airlineOptions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="mt-1 text-xs text-slate-500">{airlineFilter.length ? `${airlineFilter.length} dipilih` : 'Semua maskapai'}</div>
        </div>
      </div>

      {/* ROW 2: date range + sort + page size */}
      <div className="mt-4 grid grid-cols-1 items-end gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">Dari Tanggal</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={ctl} />
        </div>
        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">Sampai Tanggal</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={ctl} />
        </div>

        <div className="md:col-span-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Urutkan</label>
          <div className="flex gap-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={ctl}
            >
              <option value="date">Tanggal</option>
              <option value="route">Rute</option>
              <option value="airline">Maskapai</option>
              <option value="programDays">Program</option>
              <option value="tripType">Tipe</option>
              <option value="available">Seat</option>
              <option value="price">Harga</option>
              <option value="id">ID</option>
            </select>
            <button
              onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
              className="h-10 shrink-0 rounded-md border px-3 text-sm hover:bg-slate-50"
              title={sortDir === 'asc' ? 'Urutan menaik' : 'Urutan menurun'}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Per Halaman</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className={ctl}
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

function Th({ children, onClick, active, dir }:{ children: React.ReactNode; onClick?: () => void; active?: boolean; dir?: SortDir }) {
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
  mode, initial, onClose, onCreate, onUpdate,
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
  const [programDays, setProgramDays] = React.useState<number>(Number(initial?.programDays ?? 9))
  const [tripType, setTripType] = React.useState<'PP'|'ONE_WAY'>((initial?.tripType as any) ?? 'PP')
  const [available, setAvailable] = React.useState<number>(Number(initial?.available ?? 20))
  const [price, setPrice] = React.useState<number>(Number(initial?.price ?? 12_500_000))

  const MIN_SEAT = 1, MAX_SEAT = 500
  const MIN_PRICE = 500_000, MAX_PRICE = 100_000_000
  const MIN_PROG = 1, MAX_PROG = 30

  const [error, setError] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const errs: string[] = []
    if (!route.trim()) errs.push('Rute wajib diisi.')
    if (!airline.trim()) errs.push('Maskapai wajib diisi.')
    if (!date) errs.push('Tanggal wajib diisi.')
    if (!Number.isFinite(programDays) || programDays < MIN_PROG || programDays > MAX_PROG) errs.push(`Program harus ${MIN_PROG}–${MAX_PROG} hari.`)
    if (!Number.isFinite(available) || available < MIN_SEAT || available > MAX_SEAT) errs.push(`Seat harus ${MIN_SEAT}–${MAX_SEAT}.`)
    if (!Number.isFinite(price) || price < MIN_PRICE || price > MAX_PRICE) errs.push(`Harga harus Rp ${MIN_PRICE.toLocaleString('id-ID')} – Rp ${MAX_PRICE.toLocaleString('id-ID')}.`)
    if (errs.length) return setError(errs.join(' '))

    const common = { route: route.trim(), airline: airline.trim(), date, programDays, tripType, available, price }
    if (isEdit && initial?.id) onUpdate({ id: initial.id!, ...common })
    else onCreate(common)
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
            <select value={route} onChange={(e) => setRoute(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500">
              {PRESET_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Maskapai">
            <select value={airline} onChange={(e) => setAirline(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500">
              {PRESET_AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>

          <Field label="Tanggal">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>
          <Field label="Program (hari)">
            <input type="number" min={MIN_PROG} max={MAX_PROG} value={Number.isFinite(programDays) ? programDays : 0} onChange={(e) => setProgramDays(parseInt(e.target.value || '0', 10))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>

          <Field label="Tipe Perjalanan">
            <select value={tripType} onChange={(e)=>setTripType(e.target.value as any)} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500">
              {TRIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label={`Seat (${MIN_SEAT}–${MAX_SEAT})`}>
            <input type="number" min={MIN_SEAT} max={MAX_SEAT} value={Number.isFinite(available) ? available : 0} onChange={(e) => setAvailable(parseInt(e.target.value || '0', 10))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
          </Field>

          <Field label={`Harga (Rp)`} span2>
            <input type="number" min={MIN_PRICE} max={MAX_PRICE} value={Number.isFinite(price) ? price : 0} onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
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
  title, message, onCancel, onConfirm,
}: { title: string; message: React.ReactNode; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl">
        <div className="mb-2 text-lg font-semibold">{title}</div>
        <div className="text-sm text-slate-700">{message}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Batal</button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Hapus</button>
        </div>
      </div>
    </div>
  )
}

/* ================= */
/* Badge H-7 & Seat  */
/* ================= */
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

/* =============== */
/* Helper functions*/
/* =============== */
function uniqStrings(arr: string[]) { return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b)) }
function daysUntil(isoDate: string): number | null {
  const d = new Date(isoDate + 'T00:00:00'); if (isNaN(d.getTime())) return null
  const today = new Date(); d.setHours(0,0,0,0); today.setHours(0,0,0,0)
  const diff = d.getTime() - today.getTime(); return Math.round(diff / (1000*60*60*24))
}
function parseTable(text: string): string[][] {
  const norm = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  const lines = norm.split('\n').filter(l => l.trim() !== '')
  const delimiter = detectDelimiter(lines)
  if (delimiter === ',') return parseCsv(norm)
  return parseTsv(norm)
}
function detectDelimiter(lines: string[]): ',' | '\t' {
  let comma = 0, tab = 0
  for (const l of lines.slice(0, 10)) {
    comma += (l.match(/,/g) || []).length
    tab += (l.match(/\t/g) || []).length
  }
  return tab > comma ? '\t' : ','
}
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  for (const line of text.split('\n')) { if (line.trim() === '') continue; rows.push(splitCsvLine(line)) }
  return rows
}
function splitCsvLine(line: string): string[] {
  const out: string[] = []; let cur = '', inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { if (inQuotes && line[i+1] === '"') { cur += '"'; i++ } else { inQuotes = !inQuotes } }
    else if (ch === ',' && !inQuotes) { out.push(cur); cur = '' }
    else { cur += ch }
  }
  out.push(cur); return out.map(s => s.trim())
}
function parseTsv(text: string): string[][] { return text.split('\n').map(l => l.split('\t').map(s => s.trim())).filter(r => r.some(c => c !== '')) }
function escapeCsv(v: string) { return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v }
function toInt(v: string) { const n = parseInt(v.replace(/[^\d-]/g, ''), 10); return isFinite(n) ? n : 0 }
function isDate(v: string) { return /^\d{4}-\d{2}-\d{2}$/.test(v) }
function normalizeTrip(v: string): 'PP'|'ONE_WAY' {
  const s = v.toLowerCase().replace(/\s|[-_]/g,'')
  if (['pp','return','roundtrip','pulangpergi','rt'].includes(s)) return 'PP'
  if (['oneway','ow','sekalijalan'].includes(s)) return 'ONE_WAY'
  return 'PP'
}
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a')
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
function todayIso() { return new Date().toISOString().slice(0,10) }
