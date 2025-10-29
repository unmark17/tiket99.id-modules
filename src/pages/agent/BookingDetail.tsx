import React, { useEffect, useState } from 'react'
import Shell from '@/components/layout/Shell'
import Card from '@/components/ui/Card'
import { useParams } from 'react-router-dom'
import { getInvoiceByBooking, getMyBookings, postCreatePayment, postUploadProof } from '@/lib/api/endpoints'
import type { Booking, Invoice, Payment } from '@/lib/types'

export default function BookingDetail(){
  const { id } = useParams()
  const [row, setRow] = useState<Booking | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = ()=> getMyBookings().then(list=>{
    const r = list.find(x=>x.id===Number(id)) || null
    setRow(r)
    if(r) getInvoiceByBooking(r.id).then(setInvoice)
  }).finally(()=>setLoading(false))

  useEffect(()=>{ reload() }, [id])

  if(loading) return <Shell><div>Loading…</div></Shell>
  if(!row) return <Shell><div>Booking tidak ditemukan.</div></Shell>

  return (
    <Shell>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <h1 className="text-xl font-semibold mb-3">Detail Booking #{row.id}</h1>
          <div className="text-sm text-slate-600 mb-3">{row.seat?.route_from} → {row.seat?.route_to} · {new Date(row.seat?.depart_at||'').toLocaleString()} · Qty {row.qty}</div>
          <div className="text-xs px-2 py-1 rounded-full border inline-block mb-4">Status: {row.status}</div>
          {row.status==='APPROVED' && invoice && (<InvoicePanel invoice={invoice} onChange={reload} />)}
          {row.status==='PENDING' && (<div className="text-sm">Menunggu persetujuan Admin.</div>)}
          {row.status==='DECLINED' && (<div className="text-sm text-rose-600">Ditolak: {row.decline_reason||'-'}</div>)}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-2">Manifest & Ticket</h2>
          <p className="text-sm text-slate-600">Upload manifest setelah invoice ISSUED/PAID. (integrasi nantinya)</p>
          <button className="mt-2 px-3 py-1.5 rounded-xl border">Upload Manifest (CSV)</button>
          <div className="mt-3 text-xs text-slate-500">Ticket akan muncul setelah manifest APPROVED.</div>
        </Card>
      </div>
    </Shell>
  )
}

function InvoicePanel({ invoice, onChange }: { invoice: Invoice; onChange?: ()=>void }){
  const [amount, setAmount] = useState(invoice.dp_amount_idr)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])

  async function createPayment(){
    setCreating(true)
    const p = await postCreatePayment(invoice.id, { amount_idr: Number(amount), method: 'TRANSFER' }).finally(()=>setCreating(false))
    setPayments(prev=>[p, ...prev])
    onChange?.()
  }

  async function uploadProof(payment_id: number, file: File){
    setUploading(true)
    await postUploadProof(payment_id, file).finally(()=>setUploading(false))
    onChange?.()
  }

  return (
    <div className="border rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Invoice {invoice.number}</div>
          <div className="text-xs text-slate-500">Status: {invoice.status} · Jatuh tempo {new Date(invoice.due_date).toLocaleDateString()}</div>
        </div>
        <div className="text-right text-sm">
          <div>Total: <b>Rp {invoice.subtotal_idr.toLocaleString('id-ID')}</b></div>
          <div>Dibayar: <b>Rp {invoice.paid_amount_idr.toLocaleString('id-ID')}</b></div>
        </div>
      </div>
      <div className="mt-3 grid md:grid-cols-3 gap-2">
        <div className="md:col-span-2 flex gap-2">
          <input className="border rounded-xl px-3 py-2 w-full" type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
          <button onClick={createPayment} disabled={creating} className="px-3 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-50">{creating? 'Membuat…':'Buat Payment'}</button>
        </div>
        <div className="text-xs text-slate-500">Upload bukti setelah membuat payment.</div>
      </div>
      <div className="mt-3 grid gap-2">
        {payments.length===0 && <div className="text-sm text-slate-500">Belum ada payment.</div>}
        {payments.map(p=> (
          <div key={p.id} className="border rounded-xl p-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">Payment #{p.id} · {p.method} · Rp {p.amount_idr.toLocaleString('id-ID')}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full border ${p.status==='PENDING'?'':'bg-slate-50'}`}>{p.status}</div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input type="file" accept="image/*,application/pdf" onChange={e=> e.currentTarget.files?.[0] && uploadProof(p.id, e.currentTarget.files[0])} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
