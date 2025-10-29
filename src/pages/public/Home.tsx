import React from 'react'
import Shell from '@/components/layout/Shell'
import Hero from '@/components/home/Hero'
import FlightSearchCard from '@/components/home/FlightSearchCard'
import Card from '@/components/ui/Card'

export default function Home(){
  return (
    <div className="bg-slate-50">
      <HeaderSpacer />
      <Hero />
      <FlightSearchCard />

      <div className="mx-auto max-w-6xl px-4 mt-10 grid md:grid-cols-3 gap-6 pb-12">
        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Promo & Informasi</h2>
          <p className="text-sm text-slate-600">Tempatkan banner promo umroh, kebijakan bagasi, dan info jadwal keberangkatan.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-3">Feed IG/TikTok</h2>
          <div className="mt-3 h-36 rounded-lg bg-slate-100 grid place-items-center text-slate-400 text-sm">Embed Placeholder</div>
        </Card>
      </div>
    </div>
  )
}

function HeaderSpacer(){ return <div className="h-[1px]" /> } // trik supaya header sticky tidak mengganggu hero
