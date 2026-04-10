import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

function ForecastChart({ historical = [], forecast = [] }) {
  const merged = [...historical, ...forecast].map((item) => ({
    ...item,
    netHistorical: item.predicted ? null : item.net,
    netPredicted: item.predicted ? item.net : null,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">LedgerFlow Forecast</h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Predicted 7–30 days</span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={merged} margin={{ top: 8, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
            <Tooltip
              formatter={(value) => formatUSD(value)}
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
                color: 'var(--chart-tooltip-text)',
              }}
              labelStyle={{ color: 'var(--chart-tooltip-text)' }}
              itemStyle={{ color: 'var(--chart-tooltip-text)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--chart-legend)' }} />
            <ReferenceLine y={0} stroke="var(--chart-axis)" />
            <Line type="monotone" dataKey="netHistorical" name="Historical Net" stroke="#1d4ed8" strokeWidth={2.5} dot={false} />
            <Line
              type="monotone"
              dataKey="netPredicted"
              name="Predicted Net"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              strokeDasharray="6 6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ForecastChart;
