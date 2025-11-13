// src/routes.tsx
import React from 'react'
import Shell from '@/components/layout/Shell'

import Home from '@/pages/public/Home'
import SeatsList from '@/pages/public/SeatsList'
import SeatDetail from '@/pages/public/SeatDetail'
import SearchResults from '@/pages/public/SearchResults'

import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

import AgentHome from '@/pages/agent/AgentHome'
import BookingDetail from '@/pages/agent/BookingDetail'
import AdminHome from '@/pages/admin/AdminHome'
import { RequireAuth } from '@/lib/store/auth'

const routes = [
  // PUBLIC
  { path: '/', element: <Shell><Home/></Shell> },
  { path: '/seats', element: <Shell><SeatsList/></Shell> },
  { path: '/seats/:id', element: <Shell><SeatDetail/></Shell> },

  // ✅ hasil pencarian (JANGAN /seats)
  { path: '/search', element: <Shell><SearchResults/></Shell> },

  // AUTH
  { path: '/login', element: <Shell><Login/></Shell> },
  { path: '/register', element: <Shell><Register/></Shell> },

  // ROLE-BASED
  { path: '/agent', element: <RequireAuth role="AGENT"><Shell><AgentHome/></Shell></RequireAuth> },
  { path: '/agent/bookings/:id', element: <RequireAuth role="AGENT"><Shell><BookingDetail/></Shell></RequireAuth> },
  { path: '/admin', element: <RequireAuth role="ADMIN"><Shell><AdminHome/></Shell></RequireAuth> },

  // 404
  { path: '*', element: <Shell><div className="p-6">404 Not Found</div></Shell> },
]

export default routes
