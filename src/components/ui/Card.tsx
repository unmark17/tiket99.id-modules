
import React from 'react'
import { clsx } from 'clsx'


export default function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>){
return <div className={clsx('bg-white rounded-2xl shadow-sm border p-4', className)} {...props} />
}
