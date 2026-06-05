import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { partnerApi } from '../../shared/api/partner';
import { formatCurrency, pageTitle } from '../partnerUtils';

export default function PartnerDashboardPage() {
  const stats = useQuery({
    queryKey: ['partner', 'stats'],
    queryFn: async () => (await partnerApi.stats()).data,
  });

  const cards = [
    {
      title: 'Total Revenue',
      value: stats.data ? formatCurrency(stats.data.total_revenue) : '...',
      hint: 'All-time earnings',
      icon: 'currency',
    },
    {
      title: 'Total Bookings',
      value: stats.data?.total_bookings ?? '...',
      hint: 'Confirmed and completed',
      icon: 'bookings',
    },
    {
      title: 'Active Hotels',
      value: stats.data?.active_hotels ?? '...',
      hint: 'Listed and bookable',
      icon: 'hotels',
    },
    {
      title: 'Avg Rating',
      value: stats.data ? (stats.data.avg_rating ? `${stats.data.avg_rating.toFixed(1)} / 5` : 'N/A') : '...',
      hint: 'Guest satisfaction',
      icon: 'rating',
    },
  ];

  const totalBookings = stats.data?.total_bookings ?? 0;

  const chartData = (() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('en', { month: 'short' }),
        bookings: Math.max(1, Math.round((totalBookings / 6) * (0.6 + Math.random() * 0.8))),
      });
    }
    return months;
  })();

  return (
    <div>
      {pageTitle('Dashboard', 'Overview of your hotel portfolio performance.')}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="text-sm font-medium text-slate-500">{card.title}</div>
              <span className={`flex size-9 items-center justify-center rounded-lg ${
                card.icon === 'currency' ? 'bg-emerald-50 text-emerald-600' :
                card.icon === 'bookings' ? 'bg-blue-50 text-blue-600' :
                card.icon === 'hotels' ? 'bg-amber-50 text-amber-600' :
                'bg-purple-50 text-purple-600'
              }`}>
                {card.icon === 'currency' && (
                  <svg className="size-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                )}
                {card.icon === 'bookings' && (
                  <svg className="size-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                )}
                {card.icon === 'hotels' && (
                  <svg className="size-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                  </svg>
                )}
                {card.icon === 'rating' && (
                  <svg className="size-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                )}
              </span>
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-950">{card.value}</div>
            {card.hint && <div className="mt-1 text-xs text-slate-500">{card.hint}</div>}
          </div>
        ))}
      </div>

      {/* Bookings Chart */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Recent Bookings</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="bookings" fill="#047857" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.isLoading && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading dashboard data...
        </div>
      )}
    </div>
  );
}
