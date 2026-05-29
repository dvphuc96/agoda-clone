import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type Paginated } from '../../../shared/api/admin';
import type { Booking, Payment } from '../../../shared/api/bookings';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';

type AdminPayment = Payment & { booking?: Booking };

export default function PaymentListPage() {
  const [filters, setFilters] = useState({ status: '', payment_method: '', date_from: '', date_to: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const payments = useQuery({
    queryKey: ['admin', 'payments', filters],
    queryFn: async () => (await adminApi.payments(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))).data,
  });

  const detail = useQuery({
    queryKey: ['admin', 'payments', selectedId],
    queryFn: async () => (await adminApi.payment(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const columns = useMemo<ColumnDef<AdminPayment>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <button type="button" className="font-medium text-slate-950 underline underline-offset-2" onClick={() => setSelectedId(row.original.id)}>
            {row.original.id}
          </button>
        ),
      },
      { header: 'Booking', cell: ({ row }) => row.original.booking?.booking_code ?? row.original.booking_id },
      { accessorKey: 'payment_method', header: 'Method' },
      { header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
      { header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { accessorKey: 'transaction_id', header: 'Transaction' },
      { header: 'Paid at', cell: ({ row }) => formatDate(row.original.paid_at) },
    ],
    [],
  );

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));
  const paymentDetail = detail.data as AdminPayment | undefined;

  return (
    <div>
      {pageTitle('Payments', 'Monitor payment records, transaction status, and gateway references.')}
      <div className="mb-3 flex flex-wrap gap-2">
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(event) => setFilters((f) => ({ ...f, status: event.target.value, page: 1 }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          aria-label="Filter by method"
          value={filters.payment_method}
          onChange={(event) => setFilters((f) => ({ ...f, payment_method: event.target.value, page: 1 }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All methods</option>
          <option value="vnpay">VNPay</option>
          <option value="momo">Momo</option>
        </select>
        <input
          aria-label="Filter by date from"
          type="date"
          value={filters.date_from}
          onChange={(event) => setFilters((f) => ({ ...f, date_from: event.target.value, page: 1 }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          aria-label="Filter by date to"
          type="date"
          value={filters.date_to}
          onChange={(event) => setFilters((f) => ({ ...f, date_to: event.target.value, page: 1 }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <DataTable data={(payments.data?.data ?? []) as AdminPayment[]} columns={columns} emptyText={payments.isLoading ? 'Loading…' : 'No payments found.'} />
      <Pagination pagination={payments.data as Paginated<unknown> | undefined} onPageChange={setPage} />

      <AdminModal open={selectedId !== null} title="Payment Detail" width="lg" onClose={() => setSelectedId(null)}>
        {detail.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
        ) : paymentDetail ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailField label="Booking Code" value={paymentDetail.booking?.booking_code ?? String(paymentDetail.booking_id)} />
              <DetailField label="Method" value={paymentDetail.payment_method} />
              <DetailField label="Amount" value={formatCurrency(paymentDetail.amount)} />
              <DetailField label="Currency" value={paymentDetail.currency} />
              <DetailField label="Status" value={<StatusBadge value={paymentDetail.status} />} />
              <DetailField label="Paid At" value={formatDate(paymentDetail.paid_at)} />
              <DetailField label="Transaction ID" value={paymentDetail.transaction_id ?? '-'} />
              <DetailField label="Created" value={formatDate(paymentDetail.created_at)} />
            </div>
            {paymentDetail.gateway_response && (
              <div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Gateway Response</span>
                <pre className="overflow-x-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
                  {typeof paymentDetail.gateway_response === 'string'
                    ? JSON.stringify(JSON.parse(paymentDetail.gateway_response), null, 2)
                    : JSON.stringify(paymentDetail.gateway_response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Payment not found.</p>
        )}
      </AdminModal>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-950">{value}</span>
    </div>
  );
}
