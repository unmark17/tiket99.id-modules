import React from 'react'
import { Link, useParams } from 'react-router-dom'

type Proof = { id: string; name: string; type: string; url: string; size: number; uploadedAt: string }

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>()
  const bookingId = id || 'UNKNOWN'

  // mock detail (tetap sama)
  const detail = {
    id: bookingId,
    route: 'SUB–JED',
    airline: 'Garuda (GA972)',
    pax: 8,
    departAt: '2025-11-25 09:10',
    returnAt: '2025-12-05 18:45',
    price: 12500000,
    dpPercent: 30,
    status: 'PENDING',
    notes: 'Mohon unggah bukti pembayaran DP maksimal H+2.',
    passengers: [
      { name: 'Ahmad Fulan', passport: 'C1234567' },
      { name: 'Budi Santoso', passport: 'C1234568' },
      { name: 'Siti Aminah', passport: 'C1234569' },
    ],
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Detail Booking</h1>
        <Link to="/agent" className="text-sm text-blue-600 hover:underline">← Kembali ke Dashboard Agen</Link>
      </div>

      {/* ringkasan */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Booking ID" value={detail.id} />
        <InfoCard label="Rute" value={detail.route} />
        <InfoCard label="Maskapai" value={detail.airline} />
        <InfoCard label="Pax" value={String(detail.pax)} />
        <InfoCard label="Berangkat" value={detail.departAt} />
        <InfoCard label="Pulang" value={detail.returnAt} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <InfoCard label="Harga Tiket" value={`Rp ${detail.price.toLocaleString('id-ID')}`} />
        <InfoCard label="DP (%)" value={`${detail.dpPercent}%`} />
        <InfoCard label="Status" value={detail.status} />
      </div>

      {/* penumpang */}
      <div className="mt-8 overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-4 py-3 font-semibold">Daftar Penumpang</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">No. Paspor</th>
              </tr>
            </thead>
            <tbody>
              {detail.passengers.map((p, i) => (
                <tr key={p.passport} className="border-t">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.passport}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* catatan & aksi */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 md:col-span-2">
          <div className="text-sm font-semibold">Catatan</div>
          <p className="mt-1 text-sm text-slate-700">{detail.notes}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm font-semibold">Aksi Cepat</div>
          <div className="mt-3 space-y-2">
            <UploadProof bookingId={bookingId} />
          </div>
        </div>
      </div>

      {/* daftar bukti */}
      <ProofList bookingId={bookingId} />
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  )
}

/* =============================== */
/* Upload & List Bukti Pembayaran  */
/* =============================== */

const k = (id: string) => `t99.payments:${id}`

function UploadProof({ bookingId }: { bookingId: string }) {
  const [busy, setBusy] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !files.length) return
    setBusy(true)
    try {
      const list = Array.from(files)
      const existing: Proof[] = JSON.parse(localStorage.getItem(k(bookingId)) || '[]')
      const newItems: Proof[] = []

      for (const f of list) {
        const url = await readAsDataURL(f)
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: f.name,
          type: f.type || 'application/octet-stream',
          url, // data URL untuk demo (di produksi: upload ke server/storage)
          size: f.size,
          uploadedAt: new Date().toISOString(),
        })
      }
      const next = [...newItems, ...existing]
      localStorage.setItem(k(bookingId), JSON.stringify(next))
      // reset input agar bisa upload file yang sama lagi
      if (inputRef.current) inputRef.current.value = ''
      alert('Bukti pembayaran berhasil diunggah (tersimpan lokal untuk demo).')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={onPick}
        className="hidden"
        id="proof-input"
      />
      <label htmlFor="proof-input" className="block">
        <span className="w-full cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700">
          {busy ? 'Mengunggah…' : 'Unggah Bukti Pembayaran'}
        </span>
      </label>
      <p className="mt-2 text-xs text-slate-500">Format: JPG/PNG/PDF. Maksimal beberapa file sekaligus.</p>
    </div>
  )
}

function ProofList({ bookingId }: { bookingId: string }) {
  const [items, setItems] = React.useState<Proof[]>(() => JSON.parse(localStorage.getItem(k(bookingId)) || '[]'))
  React.useEffect(() => {
    const t = setInterval(() => setItems(JSON.parse(localStorage.getItem(k(bookingId)) || '[]')), 600)
    return () => clearInterval(t)
  }, [bookingId])

  function remove(id: string) {
    const next = items.filter(i => i.id !== id)
    localStorage.setItem(k(bookingId), JSON.stringify(next))
    setItems(next)
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="font-semibold">Bukti Pembayaran</div>
        <div className="text-xs text-slate-500">{items.length} file</div>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-center text-slate-500 text-sm">Belum ada bukti pembayaran diunggah.</div>
      ) : (
        <div className="divide-y">
          {items.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{f.name}</div>
                <div className="text-xs text-slate-500">
                  {f.type} • {(f.size / 1024).toFixed(1)} KB • {new Date(f.uploadedAt).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <a href={f.url} target="_blank" rel="noreferrer"
                   className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">
                  Lihat/Unduh
                </a>
                <button onClick={() => remove(f.id)}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
