import { TrendingDown, TrendingUp } from 'lucide-react';

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

function KpiCard({ title, value, change, isCurrency = true, accent = 'text-slate-900' }) {
  const changeNumber = change === null || change === undefined ? null : Number(change);
  const positive = changeNumber !== null ? changeNumber >= 0 : true;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <h3 className={`text-3xl font-semibold tracking-tight ${accent}`}>
          {isCurrency ? formatMoney(value) : value ?? '-'}
        </h3>
        {changeNumber !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              positive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
            }`}
          >
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(changeNumber).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">vs previous period</p>
    </div>
  );
}

export default KpiCard;
