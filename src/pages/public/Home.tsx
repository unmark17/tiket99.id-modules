import React from 'react'
import Shell from '@/components/layout/Shell'
import Card from '@/components/ui/Card'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <Shell>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Cari Seat Tersedia</h2>
          <p className="text-sm text-slate-600 mb-4">Lihat kursi <b>OPEN</b> & <b>LIMITED</b> yang bisa dipilih oleh agen. Filter rute & tanggal dapat ditambahkan.</p>
          <Link to="/seats" className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white">Lihat Available</Link>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-3">Feed IG/TikTok</h2>
          <p className="text-sm text-slate-600">Tampilkan konten terakhir (cache 10–30 menit). Backend: GET /social/feed</p>
          <div className="mt-3 h-36 rounded-lg bg-slate-100 grid place-items-center text-slate-400 text-sm">Embed Placeholder</div>
        </Card>
      </div>
    </Shell>
  )
}
