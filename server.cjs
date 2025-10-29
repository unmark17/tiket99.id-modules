const express = require('express');
const cors = require('cors');
const body = require('body-parser');

const app = express();
app.use(cors());
app.use(body.json({ limit: '5mb' }));

// --- In-memory DB (demo) ---
let bookingAuto = 1001, paymentAuto = 5001;
const users = [
  { id: 10, role: 'AGENT', name: 'PT Berkah Travel', email: 'agent@demo.test', password: 'secret' },
  { id: 1, role: 'ADMIN', name: 'Admin Tiket99', email: 'admin@demo.test', password: 'secret' },
];
const seats = [
  { id:1, code:'SUB-JED-2025-12-13-12D', route_from:'SUB', route_to:'JED', depart_at:'2025-12-13T08:00:00Z', program_days:12, seat_total:180, seat_available:64, price_idr:13500000, airline:'Lion Air', cabin_class:'Economy', status:'OPEN' },
  { id:2, code:'SUB-MED-2025-11-22-12D', route_from:'SUB', route_to:'MED', depart_at:'2025-11-22T09:00:00Z', program_days:12, seat_total:180, seat_available:7,  price_idr:14250000, airline:'Lion Air', cabin_class:'Economy', status:'LIMITED' },
  { id:3, code:'SUB-JED-2026-01-03-13D', route_from:'SUB', route_to:'JED', depart_at:'2026-01-03T03:00:00Z', program_days:13, seat_total:180, seat_available:0,  price_idr:15500000, airline:'Garuda',  cabin_class:'Economy', status:'CLOSED' },
];
const bookings = [];
const invoices = [];
const payments = [];

// --- Helpers ---
function authUser(req){ // simpel: pakai email di header untuk mock
  const email = req.headers['x-demo-email'] || 'agent@demo.test';
  return users.find(u=>u.email===email) || users[0];
}

// --- AUTH ---
app.post('/auth/login', (req,res)=>{
  const { email, password } = req.body||{};
  const u = users.find(x=>x.email===email && x.password===password);
  if(!u) return res.status(401).json({ message: 'Email atau password salah' });
  res.json({ token:'mock.jwt', user:{ id:u.id, role:u.role, name:u.name, email:u.email } });
});
app.post('/auth/logout', (req,res)=> res.json({ ok:true }));

// --- PUBLIC ---
app.get('/seats', (req,res)=>{
  const { status } = req.query;
  let rows = [...seats];
  if(status) rows = rows.filter(s=>s.status===status);
  res.json(rows);
});
app.get('/seats/:id', (req,res)=>{
  const s = seats.find(x=>x.id===Number(req.params.id));
  if(!s) return res.status(404).end();
  res.json(s);
});

// --- AGENT ---
app.get('/me/bookings', (req,res)=>{
  const u = authUser(req);
  const rows = bookings
    .filter(b=> u.role==='ADMIN' ? true : b.agent_id===u.id)
    .map(b=>({ ...b, seat: seats.find(s=>s.id===b.seat_id) }));
  res.json(rows);
});
app.post('/bookings', (req,res)=>{
  const u = authUser(req);
  const { seat_id, qty, notes } = req.body||{};
  const seat = seats.find(s=>s.id===Number(seat_id));
  if(!seat) return res.status(404).json({ message:'Seat not found' });
  const b = { id: bookingAuto++, agent_id: u.id, seat_id: seat.id, qty:Number(qty||1), notes, status:'PENDING', requested_at: new Date().toISOString() };
  bookings.push(b);
  res.json({ ...b, seat });
});
app.get('/bookings/:id/invoice', (req,res)=>{
  const inv = invoices.find(i=>i.booking_id===Number(req.params.id));
  if(!inv) return res.status(404).json({ message:'Invoice belum terbit' });
  res.json(inv);
});
app.post('/invoices/:invoiceId/payments', (req,res)=>{
  const invoice_id = Number(req.params.invoiceId);
  const { amount_idr, method } = req.body||{};
  const p = { id: paymentAuto++, invoice_id, amount_idr:Number(amount_idr), method:method||'TRANSFER', reference_no:`TRX-${Math.random().toString(36).slice(2,8).toUpperCase()}`, status:'PENDING', paid_at:new Date().toISOString(), created_at:new Date().toISOString(), proof_url:'', notes:'' };
  payments.push(p);
  res.json(p);
});
app.post('/payments/:id/proof', (req,res)=>{
  const p = payments.find(x=>x.id===Number(req.params.id));
  if(!p) return res.status(404).end();
  p.proof_url = 'data:application/octet-stream;base64,PROOFDEMO';
  res.json(p);
});

// --- ADMIN ---
app.get('/bookings', (req,res)=>{
  const { status } = req.query;
  let rows = bookings.map(b=>({ ...b, seat: seats.find(s=>s.id===b.seat_id) }));
  if(status) rows = rows.filter(b=>b.status===status);
  res.json(rows);
});
app.post('/bookings/:id/approve', (req,res)=>{
  const b = bookings.find(x=>x.id===Number(req.params.id));
  if(!b) return res.status(404).end();
  const seat = seats.find(s=>s.id===b.seat_id);
  if(seat.seat_available < b.qty) return res.status(400).json({ message:'Stok tidak cukup' });
  seat.seat_available -= b.qty;
  b.status='APPROVED'; b.decided_at=new Date().toISOString();
  const inv = { id:b.id, booking_id:b.id, number:`INV-${String(b.id).padStart(6,'0')}`, subtotal_idr: seat.price_idr*b.qty, dp_percent:30, dp_amount_idr: Math.round(seat.price_idr*b.qty*0.3), paid_amount_idr:0, status:'ISSUED', due_date:new Date(Date.now()+3*86400000).toISOString(), issued_at:new Date().toISOString(), created_at:new Date().toISOString() };
  invoices.push(inv);
  res.json({ booking:b, invoice:inv });
});
app.post('/bookings/:id/decline', (req,res)=>{
  const b = bookings.find(x=>x.id===Number(req.params.id));
  if(!b) return res.status(404).end();
  b.status='DECLINED'; b.decided_at=new Date().toISOString(); b.decline_reason = req.body?.reason||'';
  res.json(b);
});
app.get('/payments', (req,res)=>{
  const { status } = req.query;
  let rows = payments.map(p=>({ ...p, invoice: invoices.find(i=>i.id===p.invoice_id) }));
  if(status) rows = rows.filter(p=>p.status===status);
  res.json(rows);
});
app.post('/payments/:id/confirm', (req,res)=>{
  const p = payments.find(x=>x.id===Number(req.params.id));
  if(!p) return res.status(404).end();
  p.status='CONFIRMED'; p.verified_at=new Date().toISOString();
  const inv = invoices.find(i=>i.id===p.invoice_id);
  inv.paid_amount_idr = (inv.paid_amount_idr||0)+p.amount_idr;
  inv.status = inv.paid_amount_idr >= inv.subtotal_idr ? 'PAID' : 'PARTIALLY_PAID';
  res.json({ payment:p, invoice:inv });
});
app.post('/payments/:id/fail', (req,res)=>{
  const p = payments.find(x=>x.id===Number(req.params.id));
  if(!p) return res.status(404).end();
  p.status='FAILED'; p.notes = req.body?.notes||'Tidak valid';
  res.json(p);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=> console.log('Mock API on http://localhost:'+PORT));
