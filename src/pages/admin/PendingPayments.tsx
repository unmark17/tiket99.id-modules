import React, { useEffect, useState } from 'react'
import { getAdminPendingPayments, postConfirmPayment, postFailPayment } from '@/lib/api/endpoints'
import type { Invoice, Payment } from '@/lib/types'

export default function PendingPayments(){
  const [rows, setRows] = useState<(Payment & { invoice: Invoice })[]>([])
  const [loading, setLoading] = useState(true)

  const reload = ()=>{ setLoading(true); getAdminPendingPayments().then(setRows).finally(()=>setLoading(false)) }
  useEffect(()=>{ reload() }, [])

  async function confirm(id: number){ await postConfirmPayment(id); reload() }
  async function fail(id: number){ await postFailPayment(id, 'Bukti tidak jelas'); reload() }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Pembayaran Pending</h2>
        <button onClick={reload} className="text-sm px-3 py-1.5 rounded-xl border">Refresh</button>
      </div>
      {loading? <div>Loading…</div> : (
        <div className="grid gap-3">
          {rows.map(p=> (
            <div key={p.id} className="border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">INV {p.invoice?.number} · Rp {p.amount_idr.toLocaleString('id-ID')}</div>
                  <div className="text-xs text-slate-500">Ref: {p.reference_no} · {new Date(p.paid_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  {p.proof_url ? <a className="text-xs underline" href={p.proof_url} target="_blank">Lihat Bukti</a> : <span className="text-xs text-amber-700">Bukti belum diupload</span>}
                  <button onClick={()=>confirm(p.id)} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white">Confirm</button>
                  <button onClick={()=>fail(p.id)} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white">Fail</button>
                </div>
              </div>
            </div>
          ))}
          {rows.length===0 && <div className="text-sm text-slate-500">Tidak ada payment pending.</div>}
        </div>
      )}
    </div>
  )
}
