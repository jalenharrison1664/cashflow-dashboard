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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Cash Flow Forecast</h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Predicted 7–30 days</span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={merged} margin={{ top: 8, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(value) => formatUSD(value)} />
            <Legend />
            <ReferenceLine y={0} stroke="#94a3b8" />
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
