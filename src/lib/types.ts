export type Role = 'PUBLIC' | 'AGENT' | 'ADMIN'

export interface Seat {
  id: number
  code: string
  route_from: string
  route_to: string
  depart_at: string
  program_days: number
  seat_total: number
  seat_available: number
  price_idr: number
  airline: string
  cabin_class: string
  status: 'OPEN' | 'LIMITED' | 'CLOSED' | 'HIDDEN'
}

export interface Booking {
  id: number
  agent_id: number
  seat_id: number
  qty: number
  notes?: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED'
  requested_at: string
  decided_at?: string
  decline_reason?: string
  seat?: Seat
}

export interface Invoice {
  id: number
  booking_id: number
  number: string
  subtotal_idr: number
  dp_percent: number
  dp_amount_idr: number
  paid_amount_idr: number
  status: 'ISSUED' | 'PARTIALLY_PAID' | 'PAID'
  due_date: string
  issued_at: string
  created_at: string
}

export interface Payment {
  id: number
  invoice_id: number
  amount_idr: number
  method: 'TRANSFER' | 'CASH'
  reference_no: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  paid_at: string
  created_at: string
  proof_url?: string
  notes?: string
}

export interface UserSummary {
  id: number
  role: Role
  name: string
  email: string
}
