# Cash Flow Intelligence Dashboard

Full-stack SaaS dashboard for tracking, analyzing, and forecasting business cash flow using React, Node.js, PostgreSQL (Supabase-compatible), and Google Gemini.

## Backend (Step 1)

Backend folder structure follows clean architecture style:

- `backend/routes`
- `backend/controllers`
- `backend/services`
- `backend/utils`

### 1) Configure environment

1. Copy `backend/.env.example` to `backend/.env`
2. Fill these values:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - optional: `PORT`, `FRONTEND_URL`

### 2) Create database schema

Run `backend/config/schema.sql` in Supabase SQL editor (or your PostgreSQL instance).

### 3) Install and run backend

```bash
cd backend
npm install
npm run dev
```

Server starts at `http://localhost:5000` by default.

### 4) API endpoints

Exact spec-compatible endpoints:

- `POST /upload`
- `GET /transactions`
- `GET /summary`
- `GET /insights`
- `GET /ai-insights`
- `GET /forecast`

Also available with `/api` prefix:

- `POST /api/upload`
- `GET /api/transactions`
- `GET /api/summary`
- `GET /api/insights`
- `GET /api/ai-insights`
- `GET /api/forecast`

### 5) CSV upload format

CSV must include these columns:

- `date`
- `income`
- `expenses`

Use `sample_data.csv` to test quickly.

## Frontend (Step 2)

### 1) Configure frontend env

1. Copy `frontend/.env.example` to `frontend/.env`
2. Set `VITE_API_URL` (default: `http://localhost:5000/api`)

### 2) Install and run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

## Current Feature Coverage

- Stripe-style SaaS layout (left sidebar, top navbar, card-based content)
- KPI cards: revenue, expenses, net cash flow, runway
- Cash flow chart (revenue green, expenses red, net blue)
- AI insights panel (Gemini-backed, non-hardcoded)
- Forecast chart with dashed predicted line
- CSV upload page wired to backend
