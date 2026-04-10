import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const toCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

function CashflowChart({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">LedgerFlow Trends</h2>
        <span className="text-xs text-slate-400 dark:text-slate-500">Revenue / Expenses / Net</span>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
            <Tooltip
              formatter={(value) => toCurrency(value)}
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
                color: 'var(--chart-tooltip-text)',
              }}
              labelStyle={{ color: 'var(--chart-tooltip-text)' }}
              itemStyle={{ color: 'var(--chart-tooltip-text)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--chart-legend)' }} />
            <Line type="monotone" dataKey="income" name="Revenue" stroke="#16a34a" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="net" name="Net Cash Flow" stroke="#2563eb" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CashflowChart;
