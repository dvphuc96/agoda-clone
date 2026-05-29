import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type Paginated } from '../../../shared/api/admin';
import type { Booking, Payment } from '../../../shared/api/bookings';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';

type AdminBooking = Booking & { user?: { name: string; email: string; phone?: string } };

export default function BookingListPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ search: '', status: '', hotel_id: '', date_from: '', date_to: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const bookings = useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      return (await adminApi.bookings(filtered)).data;
    },
  });

  const detail = useQuery({
    queryKey: ['admin', 'bookings', selectedId],
    queryFn: async () => (await adminApi.booking(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Booking['status'] }) => adminApi.updateBookingStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });

  const exportMutation = useMutation({
    mutationFn: () => adminApi.exportBookings(),
    onSuccess: (response) => {
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });

  const hotels = useQuery({
    queryKey: ['admin', 'hotels', 'select'],
    queryFn: async () => (await adminApi.hotels({ per_page: 200 })).data.data,
  });

  const columns = useMemo<ColumnDef<AdminBooking>[]>(
    () => [
      {
        accessorKey: 'booking_code',
        header: 'Code',
        cell: ({ row }) => (
          <button type="button" className="font-medium text-slate-950 underline underline-offset-2" onClick={() => setSelectedId(row.original.id)}>
            {row.original.booking_code}
          </button>
        ),
      },
      { header: 'Guest', cell: ({ row }) => row.original.user?.name ?? '-' },
      { header: 'Hotel', cell: ({ row }) => row.original.room_type?.hotel?.name ?? '-' },
      { header: 'Dates', cell: ({ row }) => `${formatDate(row.original.check_in)} - ${formatDate(row.original.check_out)}` },
      { header: 'Total', cell: ({ row }) => formatCurrency(row.original.total_price) },
      { header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        id: 'actions',
        header: 'Update',
        cell: ({ row }) => (
          <select
            aria-label="Update booking status"
            value={row.original.status}
            onChange={(event) => statusMutation.mutate({ id: row.original.id, status: event.target.value as Booking['status'] })}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        ),
      },
    ],
    [statusMutation],
  );

  const setPage = (page: number) => setParams((p) => ({ ...p, page }));

  const bookingData = detail.data as AdminBooking | undefined;

  return (
    <div>
      {pageTitle('Bookings', 'Review reservations, update lifecycle status, and export records.')}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            aria-label="Search booking code or guest"
            value={params.search}
            onChange={(event) => setParams((p) => ({ ...p, search: event.target.value, page: 1 }))}
            placeholder="Search code or guest"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:max-w-sm"
          />
          <select
            aria-label="Filter by status"
            value={params.status}
            onChange={(event) => setParams((p) => ({ ...p, status: event.target.value, page: 1 }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            aria-label="Filter by hotel"
            value={params.hotel_id}
            onChange={(event) => setParams((p) => ({ ...p, hotel_id: event.target.value, page: 1 }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All hotels</option>
            {(hotels.data ?? []).map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <input
            aria-label="Filter by check-in from"
            type="date"
            value={params.date_from}
            onChange={(event) => setParams((p) => ({ ...p, date_from: event.target.value, page: 1 }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            aria-label="Filter by check-in to"
            type="date"
            value={params.date_to}
            onChange={(event) => setParams((p) => ({ ...p, date_to: event.target.value, page: 1 }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => exportMutation.mutate()}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={exportMutation.isPending}
        >
          Export CSV
        </button>
      </div>

      <DataTable data={(bookings.data?.data ?? []) as AdminBooking[]} columns={columns} emptyText={bookings.isLoading ? 'Loading…' : 'No bookings found.'} />
      <Pagination pagination={bookings.data as Paginated<unknown> | undefined} onPageChange={setPage} />

      <AdminModal open={selectedId !== null} title="Booking Detail" width="lg" onClose={() => setSelectedId(null)}>
        {detail.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
        ) : bookingData ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Booking Code" value={bookingData.booking_code} />
              <Info label="Status" value={<StatusBadge value={bookingData.status} />} />
              <Info label="Guest" value={bookingData.user?.name ?? '-'} />
              <Info label="Hotel" value={bookingData.room_type?.hotel?.name ?? '-'} />
              <Info label="Room Type" value={bookingData.room_type?.name ?? '-'} />
              <Info label="Guests" value={String(bookingData.guests)} />
              <Info label="Check-in" value={formatDate(bookingData.check_in)} />
              <Info label="Check-out" value={formatDate(bookingData.check_out)} />
              <Info label="Nights" value={String(bookingData.nights)} />
              <Info label="Total" value={formatCurrency(bookingData.total_price)} />
              <Info label="Created" value={formatDate(bookingData.created_at)} />
            </div>
            {bookingData.special_requests && (
              <div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Special Requests</span>
                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{bookingData.special_requests}</p>
              </div>
            )}
            {(bookingData.payments?.length ?? 0) > 0 && (
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Payments</span>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Method</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Amount</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Transaction</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Paid At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookingData.payments.map((p: Payment) => (
                        <tr key={p.id}>
                          <td className="px-3 py-2">{p.payment_method}</td>
                          <td className="px-3 py-2">{formatCurrency(p.amount)}</td>
                          <td className="px-3 py-2"><StatusBadge value={p.status} /></td>
                          <td className="px-3 py-2 font-mono text-xs">{p.transaction_id ?? '-'}</td>
                          <td className="px-3 py-2">{formatDate(p.paid_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Booking not found.</p>
        )}
      </AdminModal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-950">{value}</span>
    </div>
  );
}
