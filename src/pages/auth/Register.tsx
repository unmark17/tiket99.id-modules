import React from 'react'

export default function Register() {
  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Daftar Akun Baru</h1>
      <p className="text-slate-600 mb-6">
        Halaman ini masih dalam pengembangan. Silakan kembali nanti.
      </p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
          <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500" />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700"
        >
          Daftar
        </button>
      </form>
    </div>
  )
}