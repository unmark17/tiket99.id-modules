import React from 'react'
import Shell from '@/components/layout/Shell'
import Home from '@/pages/public/Home'
import SeatsList from '@/pages/public/SeatsList'
import SeatDetail from '@/pages/public/SeatDetail'
import Login from '@/pages/auth/Login'
import AgentHome from '@/pages/agent/AgentHome'
import BookingDetail from '@/pages/agent/BookingDetail'
import AdminHome from '@/pages/admin/AdminHome'
import { RequireAuth } from '@/lib/store/auth'

const routes = [
  { path: '/', element: <Home/> },
  { path: '/seats', element: <SeatsList/> },
  { path: '/seats/:id', element: <SeatDetail/> },
  { path: '/login', element: <Login/> },
  { path: '/agent', element: <RequireAuth role="AGENT"><AgentHome/></RequireAuth> },
  { path: '/agent/bookings/:id', element: <RequireAuth role="AGENT"><BookingDetail/></RequireAuth> },
  { path: '/admin', element: <RequireAuth role="ADMIN"><AdminHome/></RequireAuth> },
  { path: '*', element: <Shell><div className='p-6'>404 Not Found</div></Shell> },
]
export default routes
