import React from 'react'
import { clsx } from 'clsx'
export default function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>){
  return <button className={clsx('px-4 py-2 rounded-xl border bg-slate-900 text-white disabled:opacity-50', className)} {...props} />
}
