
import React, { useEffect, useState } from 'react'
import { getAdminPendingBookings, postApproveBooking, postDeclineBooking } from '@/lib/api/endpoints'
import type { Booking } from '@/lib/types'


export default function BookingsReview(){
const [rows, setRows] = useState<Booking[]>([])
const [loading, setLoading] = useState(true)


const reload = ()=>{ setLoading(true); getAdminPendingBookings().then(setRows).finally(()=>setLoading(false)) }
useEffect(()=>{ reload() }, [])


async function approve(id: number){ await postApproveBooking(id); reload() }
async function decline(id: number){ await postDeclineBooking(id, 'Data kurang lengkap'); reload() }


return (
<div>
<h2 className="text-lg font-semibold mb-2">Review Booking (PENDING)</h2>
{loading? <div>Loading…</div> : (
<div className="grid gap-3">
{rows.map(b=> (
<div key={b.id} className="border rounded-xl p-3">
<div className="flex items-center justify-between">
<div>
<div className="text-sm font-medium">#{b.id} · {b.seat?.route_from}→{b.seat?.route_to} · Qty {b.qty}</div>
<div className="text-xs text-slate-500">Code {b.seat?.code}</div>
</div>
<div className="flex gap-2">
<button onClick={()=>approve(b.id)} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white">Approve</button>
<button onClick={()=>decline(b.id)} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white">Decline</button>
</div>
</div>
</div>
))}
{rows.length===0 && <div className="text-sm text-slate-500">Tidak ada booking pending.</div>}
</div>
)}
</div>
)
}

