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


# Project Structuresrc/
src/
├── assets/          # static images, fonts
├── components/      # UI components (Button, Card, Layout, etc.)
│   └── common/      # shared across pages
├── features/        # or pages/ – feature-based or page components
├── lib/
│   ├── api/         # endpoints.ts, axios instance
│   └── utils/       # helpers, formatters
├── routes/          # ProtectedRoute, RequireAuth, router config
├── stores/          # auth.store, zustand/pinia if used
├── types/           # TypeScript interfaces
├── App.tsx
├── main.tsx
└── vite-env.d.ts
