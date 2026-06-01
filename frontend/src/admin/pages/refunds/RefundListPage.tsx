import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type Paginated } from '../../../shared/api/admin';
import type { Refund } from '../../../shared/api/refunds';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';

export default function RefundListPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: string } | null>(null);

  const refunds = useQuery({
    queryKey: ['admin', 'refunds', filters],
    queryFn: async () => (await adminApi.refunds(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)))).data,
  });

  const detail = useQuery({
    queryKey: ['admin', 'refunds', selectedId],
    queryFn: async () => (await adminApi.refund(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Refund['status'] }) => adminApi.updateRefundStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
      setConfirmAction(null);
      setSelectedId(null);
    },
  });

  const columns = useMemo<ColumnDef<Refund>[]>(
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
      { header: 'Booking', cell: ({ row }) => row.original.booking?.booking_code ?? `#${row.original.booking_id}` },
      { header: 'User', cell: ({ row }) => row.original.requester?.name ?? '-' },
      { header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
      { header: 'Reason', cell: ({ row }) => <span className="line-clamp-1">{row.original.reason}</span> },
      { header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Requested', cell: ({ row }) => formatDate(row.original.created_at) },
    ],
    [],
  );

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));
  const refundDetail = detail.data as Refund | undefined;
  const canApprove = refundDetail?.status === 'pending';
  const canProcess = refundDetail?.status === 'approved';

  return (
    <div>
      {pageTitle('Refunds', 'Review and process refund requests from customers.')}

      <div className="mb-3 flex flex-wrap gap-2">
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="processed">Processed</option>
        </select>
      </div>

      <DataTable data={(refunds.data?.data ?? []) as Refund[]} columns={columns} emptyText={refunds.isLoading ? 'Loading…' : 'No refunds found.'} />
      <Pagination pagination={refunds.data as Paginated<unknown> | undefined} onPageChange={setPage} />

      {/* Detail Modal */}
      <AdminModal open={selectedId !== null && !confirmAction} title="Refund Detail" width="lg" onClose={() => setSelectedId(null)}>
        {detail.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
        ) : refundDetail ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Booking Code" value={refundDetail.booking?.booking_code ?? `#${refundDetail.booking_id}`} />
              <Field label="User" value={refundDetail.requester?.name ?? '-'} />
              <Field label="Amount" value={formatCurrency(refundDetail.amount)} />
              <Field label="Status" value={<StatusBadge value={refundDetail.status} />} />
              <Field label="Reason" value={refundDetail.reason || '-'} />
              <Field label="Requested" value={formatDate(refundDetail.created_at)} />
              {refundDetail.processor && <Field label="Processed By" value={refundDetail.processor.name} />}
              {refundDetail.processed_at && <Field label="Processed At" value={formatDate(refundDetail.processed_at)} />}
            </div>

            {refundDetail.booking && (
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Booking Context</h4>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <span className="text-slate-600">Hotel: <span className="font-medium text-slate-950">{refundDetail.booking.room_type?.hotel?.name ?? '-'}</span></span>
                  <span className="text-slate-600">Room: <span className="font-medium text-slate-950">{refundDetail.booking.room_type?.name ?? '-'}</span></span>
                  <span className="text-slate-600">Total: <span className="font-medium text-slate-950">{formatCurrency(refundDetail.booking.total_price)}</span></span>
                  <span className="text-slate-600">Status: <StatusBadge value={refundDetail.booking.status} /></span>
                </div>
              </div>
            )}

            {refundDetail.payment && (
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Context</h4>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <span className="text-slate-600">Method: <span className="font-medium text-slate-950">{refundDetail.payment.payment_method}</span></span>
                  <span className="text-slate-600">Paid: <span className="font-medium text-slate-950">{formatCurrency(refundDetail.payment.amount)}</span></span>
                  <span className="text-slate-600">Status: <StatusBadge value={refundDetail.payment.status} /></span>
                </div>
              </div>
            )}

            {(canApprove || canProcess) && (
              <div className="flex gap-3 border-t border-slate-200 pt-4">
                {canApprove && (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfirmAction({ id: refundDetail.id, action: 'approve' })}
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAction({ id: refundDetail.id, action: 'reject' })}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {canProcess && (
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ id: refundDetail.id, action: 'process' })}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Process Refund
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Refund not found.</p>
        )}
      </AdminModal>

      {/* Confirm Action Modal */}
      <AdminModal open={confirmAction !== null} title="Confirm Action" width="sm" onClose={() => setConfirmAction(null)}>
        {confirmAction && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Are you sure you want to <span className="font-semibold">{confirmAction.action}</span> this refund request?
              {confirmAction.action === 'approve' && ' This will authorize the refund for processing.'}
              {confirmAction.action === 'reject' && ' This will deny the customer\'s refund request.'}
              {confirmAction.action === 'process' && ' This will execute the refund to the customer.'}
            </p>
            {statusMutation.isError && (
              <p role="alert" className="text-sm text-red-600">Action failed. Please try again.</p>
            )}
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setConfirmAction(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const statusMap: Record<string, Refund['status']> = { approve: 'approved', reject: 'rejected', process: 'processed' };
                  statusMutation.mutate({ id: confirmAction.id, status: statusMap[confirmAction.action] });
                }}
                disabled={statusMutation.isPending}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {statusMutation.isPending ? 'Processing…' : `Yes, ${confirmAction.action}`}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-950">{value}</span>
    </div>
  );
}
