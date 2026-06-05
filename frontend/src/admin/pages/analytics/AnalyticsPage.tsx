import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, DollarSign, TrendingUp, CalendarDays } from 'lucide-react';
import { adminApi, type TopHotel } from '../../../shared/api/admin';
import { formatCurrency, pageTitle } from '../adminUtils';
import DateRangePicker from '../../components/DateRangePicker';

type Tab = 'revenue' | 'occupancy' | 'top-hotels';

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  return d.toISOString().split('T')[0];
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('revenue');
  const [startDate, setStartDate] = useState(() => dateNDaysAgo(30));
  const [endDate, setEndDate] = useState(() => todayISO());

  const params = { start_date: startDate, end_date: endDate };

  const revenue = useQuery({
    queryKey: ['admin', 'analytics', 'revenue', params],
    queryFn: async () => (await adminApi.analyticsRevenue(params)).data.data,
  });

  const occupancy = useQuery({
    queryKey: ['admin', 'analytics', 'occupancy', params],
    queryFn: async () => (await adminApi.analyticsOccupancy(params)).data.data,
  });

  const topHotels = useQuery({
    queryKey: ['admin', 'analytics', 'top-hotels', params],
    queryFn: async () => (await adminApi.analyticsTopHotels(params)).data.data,
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await adminApi.analyticsExport(params);
      const url = window.URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${startDate}-to-${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const totalRevenue = (revenue.data ?? []).reduce((sum, r) => sum + r.revenue, 0);
  const totalBookings = (revenue.data ?? []).reduce((sum, r) => sum + r.booking_count, 0);
  const avgRevenuePerDay = (revenue.data ?? []).length > 0
    ? totalRevenue / (revenue.data?.length ?? 0)
    : 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'occupancy', label: 'Occupancy' },
    { key: 'top-hotels', label: 'Top Hotels' },
  ];

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  const formatVND = (value: number) => value.toLocaleString('vi-VN') + ' ₫';

  return (
    <div>
      {pageTitle('Analytics', 'Revenue reports, occupancy rates, and top-performing hotels.')}

      {/* Header controls */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
        <button
          type="button"
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Download className="size-4" />
          {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<DollarSign className="size-5" />}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          accent="blue"
        />
        <SummaryCard
          icon={<TrendingUp className="size-5" />}
          label="Avg Revenue / Day"
          value={formatCurrency(avgRevenuePerDay)}
          accent="amber"
        />
        <SummaryCard
          icon={<CalendarDays className="size-5" />}
          label="Total Bookings"
          value={totalBookings.toLocaleString()}
          accent="emerald"
        />
      </div>

      {/* Tab buttons */}
      <div className="mt-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
              tab === t.key
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {tab === 'revenue' && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-950">Revenue Over Time</h2>
              <p className="text-sm text-slate-500">Daily revenue from successful payments.</p>
            </div>
            <div className="h-96">
              {revenue.isLoading ? (
                <Skeleton />
              ) : (revenue.data ?? []).length === 0 ? (
                <EmptyState message="No revenue data for the selected period." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenue.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${Number(value) / 1000000}m`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [formatVND(Number(value)), 'Revenue']}
                      labelFormatter={(label) => formatShortDate(String(label))}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {tab === 'occupancy' && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-950">Occupancy Rate</h2>
              <p className="text-sm text-slate-500">Percentage of rooms booked per day.</p>
            </div>
            <div className="h-96">
              {occupancy.isLoading ? (
                <Skeleton />
              ) : (occupancy.data ?? []).length === 0 ? (
                <EmptyState message="No occupancy data for the selected period." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancy.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy']}
                      labelFormatter={(label) => formatShortDate(String(label))}
                    />
                    <Bar
                      dataKey="rate"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {tab === 'top-hotels' && (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="p-5 pb-3">
              <h2 className="text-base font-semibold text-slate-950">Top Performing Hotels</h2>
              <p className="text-sm text-slate-500">Ranked by total revenue in the selected period.</p>
            </div>
            {topHotels.isLoading ? (
              <div className="p-5 pt-0"><Skeleton /></div>
            ) : (topHotels.data ?? []).length === 0 ? (
              <div className="p-5 pt-0"><EmptyState message="No hotel data for the selected period." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 font-semibold text-slate-600">#</th>
                      <th className="px-5 py-3 font-semibold text-slate-600">Hotel Name</th>
                      <th className="px-5 py-3 text-right font-semibold text-slate-600">Revenue</th>
                      <th className="px-5 py-3 text-right font-semibold text-slate-600">Bookings</th>
                      <th className="px-5 py-3 text-right font-semibold text-slate-600">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(topHotels.data ?? []).map((hotel: TopHotel, idx: number) => (
                      <tr key={hotel.hotel.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-5 py-3 text-slate-500">{idx + 1}</td>
                        <td className="px-5 py-3 font-medium text-slate-950">{hotel.hotel.name}</td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-950">{formatCurrency(hotel.revenue)}</td>
                        <td className="px-5 py-3 text-right text-slate-700">{hotel.bookings.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right">
                          <span className="inline-flex items-center gap-1">
                            <StarRating value={hotel.avg_rating} />
                            <span className="text-slate-600">{hotel.avg_rating.toFixed(1)}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: 'blue' | 'amber' | 'emerald' }) {
  const accentMap = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-lg ${accentMap[accent]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25;

  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`size-4 ${i < full ? 'text-amber-400' : i === full && hasHalf ? 'text-amber-300' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-400" />
        <p className="text-sm text-slate-400">Loading data...</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
