-- Cash Flow Intelligence Dashboard - Database Schema
-- Run this in your Supabase SQL editor or directly on your PostgreSQL instance

CREATE TABLE IF NOT EXISTS transactions (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  income      NUMERIC(15, 2) NOT NULL DEFAULT 0,
  expenses    NUMERIC(15, 2) NOT NULL DEFAULT 0,
  net         NUMERIC(15, 2) GENERATED ALWAYS AS (income - expenses) STORED,
  source      VARCHAR(100) DEFAULT 'csv_upload',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date-range queries (very common in financial dashboards)
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);

-- Useful view for cumulative balance tracking
CREATE OR REPLACE VIEW daily_balance AS
SELECT
  date,
  income,
  expenses,
  net,
  SUM(net) OVER (ORDER BY date ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_balance
FROM transactions
ORDER BY date ASC;
