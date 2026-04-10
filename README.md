# LedgerFlow — Financial Intelligence Dashboard

## Overview

LedgerFlow is a full-stack analytics platform that transforms raw transaction CSVs into actionable financial intelligence. The system automates ingestion, KPI computation, trend analysis, forecasting, and AI-generated recommendations so teams can make faster financial decisions with less manual analysis. It is engineered to provide immediate operational visibility into revenue, expense behavior, runway risk, and near-term cash outlook.

## Features

- **Global search** — real-time, debounced search across transactions, KPIs, and AI insights directly from the navbar.
- Automates CSV ingestion and normalization into a PostgreSQL-backed transaction pipeline.
- Delivers real-time executive KPIs, including revenue, expenses, net cash flow, and runway.
- Visualizes historical financial behavior and projected trends with interactive charts.
- Generates structured insights and AI-assisted recommendations for risk detection and planning (Gemini AI with rule-based fallback).
- Supports resilient AI UX with fallback insights when external model calls fail.
- Includes dark mode toggle with `localStorage` persistence.
- Includes guided onboarding UI (help modal, notifications, upload workflow) for faster adoption.

## Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- Recharts
- Axios
- Lucide React

### Backend

- Node.js
- Express
- PostgreSQL (`pg`) / Supabase-compatible
- Multer + `csv-parse`
- Google Generative AI SDK (Gemini)

### Dev Tools

- Nodemon
- ESLint
- PostCSS

## Architecture

- The React client calls backend REST endpoints through an API utility layer.
- Express routes delegate to controllers, which orchestrate service-layer business logic.
- Services query PostgreSQL for aggregation, trend analysis, and forecasting.
- AI insights route combines structured analytics with Gemini output, then returns standardized JSON to the dashboard.
- The upload pipeline validates CSV schema (`date`, `income`, `expenses`) and persists cleaned rows for downstream analytics.

## Demo / Screenshots

- Dashboard view: _Add screenshot here_
- Upload workflow: _Add screenshot here_
- AI insights panel: _Add screenshot here_

## How to Run

### 1) Clone and install

```bash
git clone https://github.com/jalenharrison1664/cashflow-dashboard.git
cd cashflow-dashboard
```

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2) Configure environment files

Create `backend/.env` from `backend/.env.example` and set:

- `DATABASE_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (recommended: a model available to your key)
- optional: `PORT`, `FRONTEND_URL`

Create `frontend/.env` from `frontend/.env.example` (optional for local dev when using Vite proxy).

### 3) Initialize database schema

Run `backend/config/schema.sql` in your PostgreSQL/Supabase SQL editor.

### 4) Start backend

```bash
cd backend
npm run dev
```

Default backend URL: `http://localhost:5000`

### 5) Start frontend

```bash
cd frontend
npm run dev
```

Default frontend URL: `http://localhost:5173` (or next available Vite port).

### 6) Load sample data

- Open the Upload page.
- Upload `sample_data.csv`.
- Return to the dashboard to view KPIs, charts, and insights.

## Future Improvements

- Add role-based authentication and multi-tenant data isolation.
- Implement scheduled ETL ingestion from accounting APIs (Stripe, QuickBooks, Plaid).
- Add model observability (latency, token usage, failure reasons) and insight quality scoring.
- Introduce alerting workflows for runway thresholds and abnormal spend spikes.

## Author

Jalen Harrison
