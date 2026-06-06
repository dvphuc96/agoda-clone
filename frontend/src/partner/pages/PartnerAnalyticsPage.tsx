import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, CalendarDays, Star } from 'lucide-react';
import { partnerApi } from '../../shared/api/partner';
import { formatCurrency, pageTitle } from '../partnerUtils';

type Tab = 'revenue' | 'occupancy' | 'top-room-types' | 'reviews';
type Period = 'daily' | 'weekly' | 'monthly';

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  return d.toISOString().split('T')[0];
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function PartnerAnalyticsPage() {
  const [tab, setTab] = useState<Tab>('revenue');
  const [period, setPeriod] = useState<Period>('daily');
  const [startDate, setStartDate] = useState(() => dateNDaysAgo(30));
  const [endDate, setEndDate] = useState(() => todayISO());

  const dateParams = { start_date: startDate, end_date: endDate };

  const revenue = useQuery({
    queryKey: ['partner', 'analytics', 'revenue', period, dateParams],
    queryFn: async () => (await partnerApi.revenueChart({ ...dateParams, period })).data.data,
  });

  const occupancy = useQuery({
    queryKey: ['partner', 'analytics', 'occupancy', dateParams],
    queryFn: async () => (await partnerApi.occupancy(dateParams)).data.data,
  });

  const topRoomTypes = useQuery({
    queryKey: ['partner', 'analytics', 'top-room-types'],
    queryFn: async () => (await partnerApi.topRoomTypes({ limit: 5 })).data.data,
  });

  const reviews = useQuery({
    queryKey: ['partner', 'analytics', 'reviews-summary'],
    queryFn: async () => (await partnerApi.reviewsSummary()).data.data,
  });

  const revenueItems = revenue.data ?? [];
  const totalRevenue = revenueItems.reduce((sum, r) => sum + r.revenue, 0);
  const totalBookings = revenueItems.reduce((sum, r) => sum + r.bookings, 0);
  const avgRevenuePerDay = revenueItems.length > 0
    ? totalRevenue / revenueItems.length
    : 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'occupancy', label: 'Occupancy' },
    { key: 'top-room-types', label: 'Top Room Types' },
    { key: 'reviews', label: 'Reviews' },
  ];

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  const formatVND = (value: number) => value.toLocaleString('vi-VN') + ' ₫';

  return (
    <div>
      {pageTitle('Analytics', 'Revenue reports, occupancy rates, and guest feedback for your hotels.')}

      {/* Header controls */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="text-sm text-slate-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {tab === 'revenue' && (
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<DollarSign className="size-5" />}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          accent="emerald"
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
          accent="blue"
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
              <p className="text-sm text-slate-500">Revenue from confirmed and completed bookings.</p>
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
                    <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${Number(v) / 1000000}m`} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [formatVND(Number(value)), 'Revenue']}
                      labelFormatter={(label) => formatShortDate(String(label))}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#047857"
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
                    <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy']}
                      labelFormatter={(label) => formatShortDate(String(label))}
                    />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {tab === 'top-room-types' && (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="p-5 pb-3">
              <h2 className="text-base font-semibold text-slate-950">Top Performing Room Types</h2>
              <p className="text-sm text-slate-500">Ranked by total revenue.</p>
            </div>
            {topRoomTypes.isLoading ? (
              <div className="p-5 pt-0"><Skeleton /></div>
            ) : (topRoomTypes.data ?? []).length === 0 ? (
              <div className="p-5 pt-0"><EmptyState message="No room type data available." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 font-semibold text-slate-600">#</th>
                      <th className="px-5 py-3 font-semibold text-slate-600">Room Type</th>
                      <th className="px-5 py-3 text-right font-semibold text-slate-600">Revenue</th>
                      <th className="px-5 py-3 text-right font-semibold text-slate-600">Bookings</th>
                      <th className="px-5 py-3 text-right font-semibold text-slate-600">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(topRoomTypes.data ?? []).map((rt, idx) => (
                      <tr key={rt.room_type.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-5 py-3 text-slate-500">{idx + 1}</td>
                        <td className="px-5 py-3 font-medium text-slate-950">{rt.room_type.name}</td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-950">{formatCurrency(rt.revenue)}</td>
                        <td className="px-5 py-3 text-right text-slate-700">{rt.bookings.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-slate-700">{rt.occupancy_rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-6">
            {/* Review summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Star className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg Rating</p>
                    <p className="text-xl font-semibold text-slate-950">
                      {reviews.data ? `${reviews.data.avg_rating.toFixed(1)} / 5` : '...'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Reviews</p>
                    <p className="text-xl font-semibold text-slate-950">
                      {reviews.data?.total_reviews.toLocaleString() ?? '...'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Response Rate</p>
                    <p className="text-xl font-semibold text-slate-950">
                      {reviews.data ? `${reviews.data.response_rate.toFixed(0)}%` : '...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating trend chart */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-950">Rating Trend</h2>
                <p className="text-sm text-slate-500">Average rating over time.</p>
              </div>
              <div className="h-72">
                {reviews.isLoading ? (
                  <Skeleton />
                ) : (reviews.data?.rating_trend ?? []).length === 0 ? (
                  <EmptyState message="No review data available." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reviews.data?.rating_trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [Number(value).toFixed(1), 'Avg Rating']}
                        labelFormatter={(label) => formatShortDate(String(label))}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg_rating"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
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
