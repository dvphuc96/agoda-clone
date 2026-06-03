import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { partnerApi } from '../../shared/api/partner';
import type { Booking } from '../../shared/api/bookings';
import DataTable from '../../admin/components/DataTable';
import Pagination from '../../admin/components/Pagination';
import StatusBadge from '../../admin/components/StatusBadge';
import AdminModal from '../../admin/components/AdminModal';
import { formatCurrency, formatDate, pageTitle } from '../partnerUtils';

export default function PartnerBookingsPage() {
  const [params, setParams] = useState({ search: '', status: '', hotel_id: '', date_from: '', date_to: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const bookings = useQuery({
    queryKey: ['partner', 'bookings', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      return (await partnerApi.bookings(filtered)).data;
    },
  });

  const hotels = useQuery({
    queryKey: ['partner', 'hotels'],
    queryFn: async () => (await partnerApi.hotels()).data,
  });

  const detail = useQuery({
    queryKey: ['partner', 'bookings', selectedId],
    queryFn: async () => (await partnerApi.booking(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const hotelArray = Array.isArray(hotels.data) ? hotels.data : [];

  const setPage = (page: number) => setParams((p) => ({ ...p, page }));

  const bookingData = detail.data as (Booking & { user?: { name: string; email: string; phone?: string } }) | undefined;

  const columns = useMemo<ColumnDef<Booking>[]>(
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
      {
        header: 'Guest',
        cell: ({ row }) => (row.original as Booking & { user?: { name: string } }).user?.name ?? '-',
      },
      {
        header: 'Hotel',
        cell: ({ row }) => row.original.room_type?.hotel?.name ?? '-',
      },
      {
        header: 'Room',
        cell: ({ row }) => row.original.room_type?.name ?? '-',
      },
      {
        header: 'Check-in',
        cell: ({ row }) => formatDate(row.original.check_in),
      },
      {
        header: 'Check-out',
        cell: ({ row }) => formatDate(row.original.check_out),
      },
      {
        header: 'Total',
        cell: ({ row }) => formatCurrency(row.original.total_price),
      },
      {
        header: 'Status',
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
    ],
    [],
  );

  const bookingRows = (bookings.data?.data ?? []) as Booking[];

  return (
    <div>
      {pageTitle('Bookings', 'Review reservations for your hotels.')}

      <div className="mb-3 flex flex-col gap-3 md:flex-row md:flex-wrap">
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
          {hotelArray.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
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

      <DataTable data={bookingRows} columns={columns} emptyText={bookings.isLoading ? 'Loading...' : 'No bookings found.'} />
      <Pagination pagination={bookings.data as import('../../shared/api/admin').Paginated<unknown> | undefined} onPageChange={setPage} />

      {/* Booking Detail Modal */}
      <AdminModal open={selectedId !== null} title="Booking Detail" width="lg" onClose={() => setSelectedId(null)}>
        {detail.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
        ) : bookingData ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Detail label="Booking Code" value={bookingData.booking_code} />
              <Detail label="Status" value={<StatusBadge value={bookingData.status} />} />
              <Detail label="Guest" value={(bookingData as Booking & { user?: { name: string } }).user?.name ?? '-'} />
              <Detail label="Hotel" value={bookingData.room_type?.hotel?.name ?? '-'} />
              <Detail label="Room Type" value={bookingData.room_type?.name ?? '-'} />
              <Detail label="Guests" value={String(bookingData.guests)} />
              <Detail label="Check-in" value={formatDate(bookingData.check_in)} />
              <Detail label="Check-out" value={formatDate(bookingData.check_out)} />
              <Detail label="Nights" value={String(bookingData.nights)} />
              <Detail label="Total" value={formatCurrency(bookingData.total_price)} />
              <Detail label="Created" value={formatDate(bookingData.created_at)} />
            </div>
            {bookingData.special_requests && (
              <div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Special Requests</span>
                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{bookingData.special_requests}</p>
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

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-950">{value}</span>
    </div>
  );
}
