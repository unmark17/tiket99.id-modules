
import React from 'react'


export default function Stat({ label, value }: { label: string; value: React.ReactNode }){
return (
<div className="px-4 py-3 rounded-xl bg-slate-50 border">
<div className="text-xs text-slate-500">{label}</div>
<div className="text-lg font-semibold">{value}</div>
</div>
)
}

