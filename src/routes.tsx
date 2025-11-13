import React from 'react'
import Shell from '@/components/layout/Shell'
import Home from '@/pages/public/Home'
import SeatsList from '@/pages/public/SeatsList'
import SeatDetail from '@/pages/public/SeatDetail'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import AgentHome from '@/pages/agent/AgentHome'
import BookingDetail from '@/pages/agent/BookingDetail'
import AdminHome from '@/pages/admin/AdminHome'
import { RequireAuth } from '@/lib/store/auth' // kalau belum ada, abaikan import ini
import SearchResults from '@/pages/public/SearchResults'

const routes = [
  // Publik
  { path: '/', element: <Shell><Home /></Shell> },
  { path: '/seats', element: <Shell><SeatsList /></Shell> },
  { path: '/seats', element: <Shell><SearchResults /></Shell> },
  { path: '/seats/:id', element: <Shell><SeatDetail /></Shell> },
  { path: '/login', element: <Shell><Login /></Shell> },
  { path: '/register', element: <Shell><Register /></Shell> },

  // Proteksi (opsional; jika belum pakai auth, Anda bisa komentari 3 baris ini)
  { path: '/agent', element: <RequireAuth role="AGENT"><AgentHome /></RequireAuth> },
  { path: '/agent/bookings/:id', element: <RequireAuth role="AGENT"><BookingDetail /></RequireAuth> },
  { path: '/admin', element: <RequireAuth role="ADMIN"><AdminHome /></RequireAuth> },

  // 404
  { path: '*', element: <Shell><div className="p-6">404 Not Found</div></Shell> },
]

export default routes