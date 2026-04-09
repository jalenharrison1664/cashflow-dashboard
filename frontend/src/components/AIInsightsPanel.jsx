import { AlertTriangle, Sparkles } from 'lucide-react';

function AIInsightsPanel({ loading, insights }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-blue-600" />
        <h2 className="text-base font-semibold text-slate-900">AI Insights</h2>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-500">Analyzing financial patterns...</p>}

      {!loading && !insights && (
        <p className="mt-4 text-sm text-slate-500">Upload data to generate AI-powered recommendations.</p>
      )}

      {!loading && insights && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm leading-6 text-slate-700">{insights.summary}</p>
          </div>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key Insights</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {(insights.insights || []).map((item) => (
                <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risks</h3>
            <ul className="mt-2 space-y-2 text-sm text-rose-700">
              {(insights.risks || []).map((risk) => (
                <li key={risk} className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommendations</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {(insights.recommendations || []).map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </section>

          <div className="rounded-xl bg-blue-50 p-3 text-sm font-medium text-blue-800">
            Financial Health Score: {insights.healthScore ?? 'N/A'} / 100
          </div>
        </div>
      )}
    </aside>
  );
}

export default AIInsightsPanel;
