import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminApi } from '../../shared/api/admin';
import StatsCard from '../components/StatsCard';
import { formatCurrency, pageTitle } from './adminUtils';

const statusColors = ['#0f172a', '#2563eb', '#f59e0b', '#10b981', '#ef4444'];

export default function DashboardPage() {
  const stats = useQuery({ queryKey: ['admin', 'stats'], queryFn: async () => (await adminApi.stats()).data });
  const revenue = useQuery({ queryKey: ['admin', 'revenue'], queryFn: async () => (await adminApi.revenueChart()).data.data });
  const statuses = useQuery({ queryKey: ['admin', 'booking-status'], queryFn: async () => (await adminApi.bookingStatus()).data.data });

  return (
    <div>
      {pageTitle('Dashboard', 'Operational snapshot for GoStay administrators.')}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Bookings this month" value={stats.data?.bookings.month ?? '...'} hint={`${stats.data?.bookings.today ?? 0} today`} />
        <StatsCard title="Revenue this month" value={formatCurrency(stats.data?.revenue.month)} hint={`${formatCurrency(stats.data?.revenue.today)} today`} />
        <StatsCard title="Active hotels" value={stats.data?.active_hotels ?? '...'} hint="Live bookable properties" />
        <StatsCard title="New users" value={stats.data?.new_users ?? '...'} hint="Last 30 days" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-950">Revenue trend</h2>
            <p className="text-sm text-slate-500">Daily successful payment revenue.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}m`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-950">Booking status</h2>
            <p className="text-sm text-slate-500">Current distribution.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statuses.data ?? []} dataKey="count" nameKey="status" innerRadius={58} outerRadius={96} paddingAngle={2}>
                  {(statuses.data ?? []).map((entry, index) => (
                    <Cell key={entry.status} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {(statuses.data ?? []).map((entry, index) => (
              <div key={entry.status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 capitalize text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColors[index % statusColors.length] }} />
                  {entry.status}
                </span>
                <span className="font-semibold text-slate-950">{entry.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
