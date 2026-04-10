import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearch } from '../context/SearchContext.jsx';
import AIInsightsPanel from '../components/AIInsightsPanel';
import CashflowChart from '../components/CashflowChart';
import ForecastChart from '../components/ForecastChart';
import KpiCard from '../components/KpiCard';
import {
  fetchAIInsights,
  fetchForecast,
  fetchStructuredInsights,
  fetchSummary,
  fetchTransactions,
} from '../utils/api';

// Build deterministic insights so the panel remains useful even when Gemini is unavailable.
const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const toNumber = (value) => Number.parseFloat(value || 0);

const buildFallbackInsights = (structured) => {
  const monthlyRevenue = toNumber(structured?.monthly?.revenue);
  const monthlyExpenses = toNumber(structured?.monthly?.expenses);
  const monthlyNet = toNumber(structured?.monthly?.net);
  const runway = structured?.cashRunway;
  const avgDailyExpense = toNumber(structured?.avgDailyExpense);
  const revenueTrend = structured?.revenueTrend || 'stable';
  const expenseSpikes = structured?.expenseSpikes || [];
  const negativeFlow = Boolean(structured?.isNegativeCashFlow);

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      70 + (monthlyNet > 0 ? 15 : -20) + (revenueTrend === 'increasing' ? 10 : revenueTrend === 'decreasing' ? -10 : 0) -
        Math.min(15, expenseSpikes.length * 4)
    )
  );

  return {
    summary: `This month generated ${formatMoney(monthlyRevenue)} in revenue and ${formatMoney(monthlyExpenses)} in expenses, resulting in ${formatMoney(monthlyNet)} net cash flow. Revenue trend is ${revenueTrend}.`,
    insights: [
      `Average daily expense is ${formatMoney(avgDailyExpense)} over the last 30 days.`,
      `Cash runway is ${runway === null ? 'currently unknown' : `${runway} day(s)`}.`,
      `Monthly net cash flow is ${monthlyNet >= 0 ? 'positive' : 'negative'} at ${formatMoney(monthlyNet)}.`,
    ],
    risks: [
      negativeFlow ? 'Business is currently running negative monthly cash flow.' : 'No immediate negative monthly cash flow detected.',
      expenseSpikes.length > 0
        ? `${expenseSpikes.length} unusual expense spike day(s) were detected recently.`
        : 'No recent abnormal expense spikes detected.',
    ],
    recommendations: [
      'Upload data weekly so trend and forecast signals stay reliable.',
      'Investigate large expense spike days and tag recurring cost drivers.',
      'Set runway targets and trigger alerts when runway drops below threshold.',
    ],
    healthScore,
    generatedBy: 'rules',
  };
};

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [lastAiUpdatedAt, setLastAiUpdatedAt] = useState(null);
  const [aiInsights, setAIInsights] = useState(null);
  const { debouncedQuery, registerData } = useSearch();

  useEffect(() => {
    document.title = 'LedgerFlow Dashboard';
  }, []);

  const loadAIInsights = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);

    // Try AI + structured insights together: AI for narrative, structured data for safe fallback.
    const [aiRes, structuredRes] = await Promise.allSettled([
      fetchAIInsights(),
      fetchStructuredInsights(),
    ]);

    if (aiRes.status === 'fulfilled') {
      setAIInsights({ ...aiRes.value, generatedBy: 'gemini' });
      setLastAiUpdatedAt(new Date());
      setAiLoading(false);
      registerData({ aiInsights: { ...aiRes.value, generatedBy: 'gemini' } });
      return;
    }

    if (structuredRes.status === 'fulfilled') {
      const fallback = buildFallbackInsights(structuredRes.value);
      setAIInsights(fallback);
      setAiError(
        aiRes.reason?.response?.data?.error ||
          'Gemini insights are unavailable right now. Showing rule-based insights instead.'
      );
      setLastAiUpdatedAt(new Date());
      setAiLoading(false);
      registerData({ aiInsights: fallback });
      return;
    }

    setAIInsights(null);
    setAiError('AI insights are unavailable. Check GEMINI_API_KEY and try again.');
    setAiLoading(false);
  }, [registerData]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setApiError(null);

      const [summaryRes, txRes, forecastRes] = await Promise.allSettled([
        fetchSummary(),
        fetchTransactions(),
        fetchForecast(30),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value);
      if (forecastRes.status === 'fulfilled') setForecastData(forecastRes.value?.forecast || []);

      registerData({
        transactions: txRes.status === 'fulfilled' ? txRes.value : [],
        summary: summaryRes.status === 'fulfilled' ? summaryRes.value : null,
      });

      const allFailed = [summaryRes, txRes, forecastRes].every((r) => r.status === 'rejected');
      if (allFailed) {
        const msg = summaryRes.reason?.response?.data?.error || summaryRes.reason?.message || 'Backend unreachable';
        setApiError(msg);
      }

      setLoading(false);
      loadAIInsights();
    };

    load();
  }, [loadAIInsights]);

  const chartData = useMemo(() => {
    const lower = debouncedQuery.toLowerCase();
    const filtered = debouncedQuery
      ? (transactions || []).filter((tx) => {
          const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          });
          return (
            dateStr.toLowerCase().includes(lower) ||
            String(tx.income).includes(lower) ||
            String(tx.expenses).includes(lower)
          );
        })
      : transactions || [];

    return filtered.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      income: Number(item.income || 0),
      expenses: Number(item.expenses || 0),
      net: Number(item.net || 0),
    }));
  }, [transactions, debouncedQuery]);

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
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-16 text-sm text-slate-400 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 transition-colors duration-300 dark:border-amber-800 dark:bg-amber-950/40">
        <p className="font-semibold text-amber-900 dark:text-amber-200">Database not connected</p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{apiError}</p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-amber-800 dark:text-amber-300">
          <li>Add your real <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">DATABASE_URL</code> to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">backend/.env</code></li>
          <li>Run <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">backend/config/schema.sql</code> on that database</li>
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
            accent="text-emerald-700 dark:text-emerald-300"
          />
          <KpiCard
            title="Total Expenses"
            value={summary?.totalExpenses}
            change={summary?.periodComparison?.expensesChange}
            accent="text-rose-700 dark:text-rose-300"
          />
          <KpiCard
            title="Net Cash Flow"
            value={summary?.netCashFlow}
            change={summary?.periodComparison?.revenueChange}
            accent="text-blue-700 dark:text-blue-300"
          />
          <KpiCard title="Cash Runway (days)" value={summary?.cashRunway} isCurrency={false} change={null} accent="text-slate-900 dark:text-slate-100" />
        </div>

        {debouncedQuery && (
          <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 transition-colors duration-300 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <span>Showing transactions matching <span className="font-semibold">"{debouncedQuery}"</span> — {chartData.length} result(s)</span>
          </div>
        )}

        <CashflowChart data={chartData} />

        <ForecastChart historical={historicalRecent} forecast={forecastSeries} />
      </section>

      <AIInsightsPanel
        loading={aiLoading}
        insights={aiInsights}
        error={aiError}
        onRefresh={loadAIInsights}
        lastUpdatedAt={lastAiUpdatedAt}
      />
    </div>
  );
}

export default DashboardPage;
