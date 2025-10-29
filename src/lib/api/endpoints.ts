
const { data } = await api.get(`/seats/${id}`)
return data
}


/* AGENT */
export async function getMyBookings(): Promise<Booking[]>{
const { data } = await api.get('/me/bookings')
return data
}
export async function postCreateBooking(payload: { seat_id: number; qty: number; notes?: string }): Promise<Booking>{
const { data } = await api.post('/bookings', payload)
return data
}
export async function getInvoiceByBooking(booking_id: number): Promise<Invoice>{
const { data } = await api.get(`/bookings/${booking_id}/invoice`)
return data
}
export async function postCreatePayment(invoice_id: number, payload: { amount_idr: number; method: 'TRANSFER' | 'CASH' }): Promise<Payment>{
const { data } = await api.post(`/invoices/${invoice_id}/payments`, payload)
return data
}
export async function postUploadProof(payment_id: number, file: File){
const form = new FormData()
form.append('file', file)
await api.post(`/payments/${payment_id}/proof`, form)
}


/* ADMIN */
export async function getAdminPendingPayments(): Promise<(Payment & { invoice: Invoice })[]>{
const { data } = await api.get('/payments', { params: { status: 'PENDING' }})
return data
}
export async function postConfirmPayment(payment_id: number){ await api.post(`/payments/${payment_id}/confirm`) }
export async function postFailPayment(payment_id: number, notes = 'Tidak valid'){ await api.post(`/payments/${payment_id}/fail`, { notes }) }


export async function getAdminPendingBookings(): Promise<Booking[]>{
const { data } = await api.get('/bookings', { params: { status: 'PENDING' } })
return data
}
export async function postApproveBooking(booking_id: number){ await api.post(`/bookings/${booking_id}/approve`) }
export async function postDeclineBooking(booking_id: number, reason = 'Data kurang lengkap'){ await api.post(`/bookings/${booking_id}/decline`, { reason }) }


export async function postSeat(payload: Partial<Seat>){ await api.post('/seats', payload) }
export async function patchSeat(id: number, payload: Partial<Seat>){ await api.patch(`/seats/${id}`, payload) }
export async function deleteSeat(id: number){ await api.delete(`/seats/${id}`) }
