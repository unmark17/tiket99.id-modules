import React from 'react'
import { Link, useParams } from 'react-router-dom'

export default function BookingDetail() {
  const { id } = useParams()

  // mock detail
  const detail = {
    id,
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
        <Link to="/agent" className="text-sm text-blue-600 hover:underline">
          ← Kembali ke Dashboard Agen
        </Link>
      </div>

      {/* ringkasan */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Booking ID" value={detail.id || '-'} />
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
            <button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Unggah Bukti Pembayaran
            </button>
            <button className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
              Cetak Proforma Invoice
            </button>
          </div>
        </div>
      </div>
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
