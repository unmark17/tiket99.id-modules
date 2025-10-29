import React from 'react'
import Shell from '@/components/layout/Shell'
import Card from '@/components/ui/Card'
import PendingPayments from './PendingPayments'
import BookingsReview from './BookingsReview'
import SeatsAdmin from './SeatsAdmin'

export default function AdminHome(){
  return (
    <Shell>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2"><PendingPayments/></Card>
        <Card><AdminQuickActions/></Card>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <Card><BookingsReview/></Card>
        <Card><SeatsAdmin/></Card>
      </div>
    </Shell>
  )
}

function AdminQuickActions(){
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Aksi Cepat</h2>
      <div className="grid gap-2 text-sm">
        <button className="px-3 py-2 rounded-xl border">Tambah Seat</button>
        <button className="px-3 py-2 rounded-xl border">Export Sales (CSV)</button>
        <button className="px-3 py-2 rounded-xl border">Export Overdue (CSV)</button>
      </div>
      <p className="mt-3 text-xs text-slate-500">Proses sesuai endpoint admin.</p>
    </div>
  )
}
