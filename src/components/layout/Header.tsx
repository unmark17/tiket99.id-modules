import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 flex h-14 items-center justify-between rounded-2xl bg-white/80 px-3 shadow-sm backdrop-blur">
          {/* Kiri: logo + menu */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-blue-600" />
              <span className="font-extrabold tracking-tight">
                tiket<span className="text-blue-600">99</span>.id
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm text-slate-700">
              <NavLink to="/seats" className="hover:text-blue-600">Available Seat</NavLink>
            </nav>
          </div>

          {/* Kanan: tombol Masuk/Daftar */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="inline-flex h-9 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}