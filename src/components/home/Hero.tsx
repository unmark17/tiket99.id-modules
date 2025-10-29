import React from 'react'

export default function Hero(){
  return (
    <section className="relative">
      {/* Background foto/gradien */}
      <div className="absolute inset-0">
        <div className="h-[360px] w-full bg-[url('/hero.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/10" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 h-[360px] flex items-center">
        <div className="text-white drop-shadow">
          <h1 className="text-3xl md:text-4xl font-extrabold">Hai kamu, mau ke mana?</h1>
          <p className="mt-2 text-sm md:text-base opacity-90">Tiket99.id – Fokus tiket pesawat untuk Umroh.</p>
        </div>
      </div>
    </section>
  )
}
