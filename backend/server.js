/**
 * API server entrypoint.
 * Wires middleware, route modules, and global error handling for dashboard data + AI endpoints.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const uploadRoutes = require('./routes/upload');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const insightsRoutes = require('./routes/insights');
const aiInsightsRoutes = require('./routes/aiInsights');
const forecastRoutes = require('./routes/forecast');

const { errorHandler } = require('./middleware/errorHandler');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isLocalhostDevPort = /^http:\/\/localhost:\d+$/.test(origin);
      if (allowedOrigins.has(origin) || isLocalhostDevPort) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/ai-insights', aiInsightsRoutes);
app.use('/api/forecast', forecastRoutes);

// Spec-compatible aliases (without /api prefix)
app.use('/upload', uploadRoutes);
app.use('/transactions', transactionRoutes);
app.use('/summary', summaryRoutes);
app.use('/insights', insightsRoutes);
app.use('/ai-insights', aiInsightsRoutes);
app.use('/forecast', forecastRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Probe DB immediately on startup for early, clear feedback.
  pool.query('SELECT 1').then(() => {
    console.log('✅ Database connection verified');
  }).catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('   → Check DATABASE_URL in backend/.env and ensure the database is accessible.');
  });
});

module.exports = app;
