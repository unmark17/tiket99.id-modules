# Tiket99 Frontend


Frontend React + Vite + TypeScript. Siap sambung ke backend.


## Setup
1. `npm i`
2. Salin `.env.example` menjadi `.env` dan isi `VITE_API_BASE_URL`.
3. `npm run dev`


## Build
- `npm run build` → output di `dist/`


## Catatan Integrasi
- Semua panggilan API tersentral di `src/lib/api/endpoints.ts`.
- Auth JWT otomatis diinject via `Authorization: Bearer <token>` dari `auth.store`.
- Proteksi route pakai `<RequireAuth role="..."/>`.
