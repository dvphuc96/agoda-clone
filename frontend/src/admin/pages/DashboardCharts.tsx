import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const statusColors = ['#0f172a', '#2563eb', '#f59e0b', '#10b981', '#ef4444'];

export default function DashboardCharts({
  type,
  data,
  formatCurrency,
}: {
  type: 'bar' | 'pie';
  data: Record<string, unknown>[];
  formatCurrency?: (v: number | string | undefined) => string;
}) {
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `${Number(value) / 1000000}m`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCurrency?.(Number(value))} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={58} outerRadius={96} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={String(entry.status)} fill={statusColors[index % statusColors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
