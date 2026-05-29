import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type AdminUser } from '../../../shared/api/admin';
import type { Booking } from '../../../shared/api/bookings';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';

type AdminBooking = Booking & { user?: AdminUser };

export default function BookingListPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ search: '', status: '' });
  const bookings = useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: async () => (await adminApi.bookings(Object.fromEntries(Object.entries(params).filter(([, value]) => value)))).data,
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

  const columns = useMemo<ColumnDef<AdminBooking>[]>(() => [
    { accessorKey: 'booking_code', header: 'Code' },
    { header: 'Guest', cell: ({ row }) => row.original.user?.name ?? '-' },
    { header: 'Hotel', cell: ({ row }) => row.original.room_type?.hotel?.name ?? '-' },
    { header: 'Dates', cell: ({ row }) => `${formatDate(row.original.check_in)} - ${formatDate(row.original.check_out)}` },
    { header: 'Total', cell: ({ row }) => formatCurrency(row.original.total_price) },
    { header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    {
      id: 'actions',
      header: 'Update',
      cell: ({ row }) => (
        <select aria-label="Cập nhật trạng thái đặt phòng" value={row.original.status} onChange={(event) => statusMutation.mutate({ id: row.original.id, status: event.target.value as Booking['status'] })} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
  ], [statusMutation]);

  return (
    <div>
      {pageTitle('Bookings', 'Review reservations, update lifecycle status, and export records.')}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <input aria-label="Tìm kiếm mã đặt phòng hoặc khách" value={params.search} onChange={(event) => setParams({ ...params, search: event.target.value })} placeholder="Search code or guest" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:max-w-sm" />
          <select aria-label="Lọc theo trạng thái" value={params.status} onChange={(event) => setParams({ ...params, status: event.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="button" onClick={() => exportMutation.mutate()} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={exportMutation.isPending}>
          Export CSV
        </button>
      </div>
      <DataTable data={(bookings.data?.data ?? []) as AdminBooking[]} columns={columns} emptyText={bookings.isLoading ? 'Loading...' : 'No bookings found.'} />
    </div>
  );
}
