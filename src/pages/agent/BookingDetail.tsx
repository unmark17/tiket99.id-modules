
{row.status==='DECLINED' && (
<div className="text-sm text-rose-600">Ditolak: {row.decline_reason||'-'}</div>
)}
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


useEffect(()=>{ /* optional: fetch payments list if disediakan backend */ }, [])


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

