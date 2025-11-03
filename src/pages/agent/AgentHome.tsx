import React from 'react'
import { Link } from 'react-router-dom'

type Booking = {
  id: string
  route: string
  airline: string
  pax: number
  departAt: string
  status: 'PENDING' | 'APPROVED' | 'UNPAID' | 'PAID'
}

const mockBookings: Booking[] = [
  { id: 'BK-23001', route: 'SUB–JED', airline: 'Garuda (GA972)', pax: 8, departAt: '2025-11-25 09:10', status: 'PENDING' },
  { id: 'BK-23002', route: 'CGK–MED', airline: 'Saudia (SV819)', pax: 12, departAt: '2025-12-03 22:30', status: 'APPROVED' },
  { id: 'BK-23003', route: 'SUB–JED', airline: 'Lion (JT96)', pax: 5, departAt: '2025-12-10 06:00', status: 'UNPAID' },
]

export default function AgentHome() {
  const totalPax = mockBookings.reduce((a, b) => a + b.pax, 0)
  const approved = mockBookings.filter(b => b.status === 'APPROVED').length
  const unpaid = mockBookings.filter(b => b.status === 'UNPAID').length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Agen</h1>
      <p className="text-slate-600">Ringkasan booking & status pembayaran.</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Booking" value={mockBookings.length} subtitle="Bulan berjalan" />
        <StatCard title="Total Pax" value={totalPax} subtitle="Semua booking" />
        <StatCard title="Approved / Unpaid" value={`${approved} / ${unpaid}`} subtitle="Status ringkas" />
      </div>

      {/* Tabel booking */}
      <div className="mt-8 overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-4 py-3 font-semibold">Booking Terbaru</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Rute</th>
                <th className="px-4 py-2">Maskapai</th>
                <th className="px-4 py-2">Pax</th>
                <th className="px-4 py-2">Keberangkatan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((b, i) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 font-medium">{b.id}</td>
                  <td className="px-4 py-2">{b.route}</td>
                  <td className="px-4 py-2">{b.airline}</td>
                  <td className="px-4 py-2">{b.pax}</td>
                  <td className="px-4 py-2">{b.departAt}</td>
                  <td className="px-4 py-2">
                    <span className={badgeClass(b.status)}>{b.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/agent/bookings/${b.id}`}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {mockBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data booking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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

function badgeClass(status: Booking['status']) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold'
  if (status === 'APPROVED') return `${base} bg-green-100 text-green-700`
  if (status === 'UNPAID') return `${base} bg-amber-100 text-amber-700`
  if (status === 'PAID') return `${base} bg-blue-100 text-blue-700`
  return `${base} bg-slate-100 text-slate-700` // PENDING
}
