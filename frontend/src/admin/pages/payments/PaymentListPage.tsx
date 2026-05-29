import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi } from '../../../shared/api/admin';
import type { Booking, Payment } from '../../../shared/api/bookings';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';

type AdminPayment = Payment & { booking?: Booking };

export default function PaymentListPage() {
  const [filters, setFilters] = useState({ status: '', payment_method: '' });
  const payments = useQuery({
    queryKey: ['admin', 'payments', filters],
    queryFn: async () => (await adminApi.payments(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))).data,
  });

  const columns = useMemo<ColumnDef<AdminPayment>[]>(() => [
    { accessorKey: 'id', header: 'ID' },
    { header: 'Booking', cell: ({ row }) => row.original.booking?.booking_code ?? row.original.booking_id },
    { accessorKey: 'payment_method', header: 'Method' },
    { header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    { header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { accessorKey: 'transaction_id', header: 'Transaction' },
    { header: 'Paid at', cell: ({ row }) => formatDate(row.original.paid_at) },
  ], []);

  return (
    <div>
      {pageTitle('Payments', 'Monitor payment records, transaction status, and gateway references.')}
      <div className="mb-3 flex gap-2">
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={filters.payment_method} onChange={(event) => setFilters({ ...filters, payment_method: event.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All methods</option>
          <option value="vnpay">VNPay</option>
          <option value="momo">Momo</option>
        </select>
      </div>
      <DataTable data={(payments.data?.data ?? []) as AdminPayment[]} columns={columns} emptyText={payments.isLoading ? 'Loading...' : 'No payments found.'} />
    </div>
  );
}
