import { useEffect, useMemo, useState } from 'react';
import AIInsightsPanel from '../components/AIInsightsPanel';
import CashflowChart from '../components/CashflowChart';
import ForecastChart from '../components/ForecastChart';
import KpiCard from '../components/KpiCard';
import {
  fetchAIInsights,
  fetchForecast,
  fetchSummary,
  fetchTransactions,
} from '../utils/api';

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [aiInsights, setAIInsights] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setApiError(null);

      const [summaryRes, txRes, forecastRes, aiRes] = await Promise.allSettled([
        fetchSummary(),
        fetchTransactions(),
        fetchForecast(30),
        fetchAIInsights(),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value);
      if (forecastRes.status === 'fulfilled') setForecastData(forecastRes.value?.forecast || []);
      if (aiRes.status === 'fulfilled') setAIInsights(aiRes.value);

      const allFailed = [summaryRes, txRes, forecastRes, aiRes].every(
        (r) => r.status === 'rejected'
      );
      if (allFailed) {
        const msg = summaryRes.reason?.response?.data?.error || summaryRes.reason?.message || 'Backend unreachable';
        setApiError(msg);
      }

      setLoading(false);
    };

    load();
  }, []);

  const chartData = useMemo(
    () =>
      (transactions || []).map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: Number(item.income || 0),
        expenses: Number(item.expenses || 0),
        net: Number(item.net || 0),
      })),
    [transactions]
  );

  const historicalRecent = useMemo(
    () =>
      chartData.slice(-21).map((row) => ({
        ...row,
        predicted: false,
      })),
    [chartData]
  );

  const forecastSeries = useMemo(
    () =>
      (forecastData || []).map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        net: Number(item.net || 0),
        predicted: true,
      })),
    [forecastData]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-16 text-sm text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold text-amber-900">Database not connected</p>
        <p className="mt-1 text-sm text-amber-700">{apiError}</p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-amber-800">
          <li>Add your real <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> to <code className="rounded bg-amber-100 px-1">backend/.env</code></li>
          <li>Run <code className="rounded bg-amber-100 px-1">backend/config/schema.sql</code> on that database</li>
          <li>Restart the backend server</li>
          <li>Upload a CSV from the <a href="/upload" className="underline">Upload Data</a> page</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_350px]">
      <section className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            value={summary?.totalRevenue}
            change={summary?.periodComparison?.revenueChange}
            accent="text-emerald-700"
          />
          <KpiCard
            title="Total Expenses"
            value={summary?.totalExpenses}
            change={summary?.periodComparison?.expensesChange}
            accent="text-rose-700"
          />
          <KpiCard title="Net Cash Flow" value={summary?.netCashFlow} change={summary?.periodComparison?.revenueChange} accent="text-blue-700" />
          <KpiCard title="Cash Runway (days)" value={summary?.cashRunway} isCurrency={false} change={null} accent="text-slate-900" />
        </div>

        <CashflowChart data={chartData} />

        <ForecastChart historical={historicalRecent} forecast={forecastSeries} />
      </section>

      <AIInsightsPanel loading={loading} insights={aiInsights} />
    </div>
  );
}

export default DashboardPage;
