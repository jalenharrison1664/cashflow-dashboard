import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

function AIInsightsPanel({ loading, insights, error, onRefresh, lastUpdatedAt }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">AI Insights</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {lastUpdatedAt && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Last updated: {new Date(lastUpdatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      )}

      {error && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{error}</p>}

      {loading && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Analyzing financial patterns...</p>}

      {!loading && !insights && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Upload data to generate AI-powered recommendations.</p>
      )}

      {!loading && insights && (
        <div className="mt-4 space-y-4">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Source: {insights.generatedBy === 'gemini' ? 'Gemini AI' : 'Rule-based fallback'}
          </div>

          <div>
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{insights.summary}</p>
          </div>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Key Insights</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {(insights.insights || []).map((item) => (
                <li key={item} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Risks</h3>
            <ul className="mt-2 space-y-2 text-sm text-rose-700 dark:text-rose-300">
              {(insights.risks || []).map((risk) => (
                <li key={risk} className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-900/30">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Recommendations</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {(insights.recommendations || []).map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </section>

          <div className="rounded-xl bg-blue-50 p-3 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Financial Health Score: {insights.healthScore ?? 'N/A'} / 100
          </div>
        </div>
      )}
    </aside>
  );
}

export default AIInsightsPanel;
