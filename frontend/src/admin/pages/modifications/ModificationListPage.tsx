import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type Paginated } from '../../../shared/api/admin';
import type { BookingModification } from '../../../shared/api/modifications';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';

export default function ModificationListPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const modifications = useQuery({
    queryKey: ['admin', 'modifications', filters],
    queryFn: async () => (await adminApi.modifications(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)))).data,
  });

  const detail = useQuery({
    queryKey: ['admin', 'modifications', selectedId],
    queryFn: async () => (await adminApi.modification(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => adminApi.approveModification(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'modifications'] });
      setConfirmAction(null);
      setSelectedId(null);
      setAdminNotes('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => adminApi.rejectModification(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'modifications'] });
      setConfirmAction(null);
      setSelectedId(null);
      setAdminNotes('');
    },
  });

  const columns = useMemo<ColumnDef<BookingModification>[]>(
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
      { header: 'User', cell: ({ row }) => row.original.user?.name ?? '-' },
      { header: 'Hotel', cell: ({ row }) => row.original.booking?.room_type?.hotel?.name ?? '-' },
      {
        header: 'Changes',
        cell: ({ row }) => (
          <span className="text-xs">
            {row.original.old_nights}N → {row.original.new_nights}N, {row.original.old_guests}G → {row.original.new_guests}G
          </span>
        ),
      },
      {
        header: 'Price Diff',
        cell: ({ row }) => {
          const diff = row.original.price_diff;
          return (
            <span className={diff > 0 ? 'font-medium text-amber-600' : diff < 0 ? 'font-medium text-green-600' : ''}>
              {diff > 0 ? '+' : ''}{formatCurrency(String(Math.abs(diff)))}
            </span>
          );
        },
      },
      { header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Requested', cell: ({ row }) => formatDate(row.original.created_at) },
    ],
    [],
  );

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));
  const modDetail = detail.data as BookingModification | undefined;
  const isPending = modDetail?.status === 'pending';

  return (
    <div>
      {pageTitle('Booking Modifications', 'Review and manage booking change requests from customers.')}

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
        </select>
      </div>

      <DataTable data={(modifications.data?.data ?? []) as BookingModification[]} columns={columns} emptyText={modifications.isLoading ? 'Loading...' : 'No modification requests found.'} />
      <Pagination pagination={modifications.data as Paginated<unknown> | undefined} onPageChange={setPage} />

      {/* Detail Modal */}
      <AdminModal open={selectedId !== null && !confirmAction} title="Modification Detail" width="lg" onClose={() => setSelectedId(null)}>
        {detail.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
        ) : modDetail ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Booking Code" value={modDetail.booking?.booking_code ?? `#${modDetail.booking_id}`} />
              <Field label="User" value={modDetail.user?.name ?? '-'} />
              <Field label="Status" value={<StatusBadge value={modDetail.status} />} />
              <Field label="Requested" value={formatDate(modDetail.created_at)} />
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Old Values</h4>
              <div className="grid gap-2 text-sm md:grid-cols-3">
                <span className="text-slate-600">Check-in: <span className="font-medium text-slate-950">{modDetail.old_check_in}</span></span>
                <span className="text-slate-600">Check-out: <span className="font-medium text-slate-950">{modDetail.old_check_out}</span></span>
                <span className="text-slate-600">Nights: <span className="font-medium text-slate-950">{modDetail.old_nights}</span></span>
                <span className="text-slate-600">Guests: <span className="font-medium text-slate-950">{modDetail.old_guests}</span></span>
                <span className="text-slate-600">Total: <span className="font-medium text-slate-950">{formatCurrency(modDetail.old_total_price)}</span></span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">New Values</h4>
              <div className="grid gap-2 text-sm md:grid-cols-3">
                <span className="text-slate-600">Check-in: <span className="font-medium text-slate-950">{modDetail.new_check_in}</span></span>
                <span className="text-slate-600">Check-out: <span className="font-medium text-slate-950">{modDetail.new_check_out}</span></span>
                <span className="text-slate-600">Nights: <span className="font-medium text-slate-950">{modDetail.new_nights}</span></span>
                <span className="text-slate-600">Guests: <span className="font-medium text-slate-950">{modDetail.new_guests}</span></span>
                <span className="text-slate-600">Total: <span className="font-medium text-slate-950">{formatCurrency(modDetail.new_total_price)}</span></span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Price Difference</span>
                <span className={`font-bold ${modDetail.price_diff > 0 ? 'text-amber-600' : modDetail.price_diff < 0 ? 'text-green-600' : 'text-slate-950'}`}>
                  {modDetail.price_diff > 0 ? '+' : ''}{formatCurrency(String(Math.abs(modDetail.price_diff)))}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {modDetail.price_diff > 0 ? 'Customer needs to pay additional amount.' : modDetail.price_diff < 0 ? 'Customer will receive a refund.' : 'No price change.'}
              </p>
            </div>

            {modDetail.admin_notes && (
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Notes</h4>
                <p className="text-sm text-slate-700">{modDetail.admin_notes}</p>
              </div>
            )}

            {isPending && (
              <div className="flex gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => { setAdminNotes(''); setConfirmAction({ id: modDetail.id, action: 'approve' }); }}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminNotes(''); setConfirmAction({ id: modDetail.id, action: 'reject' }); }}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Modification not found.</p>
        )}
      </AdminModal>

      {/* Confirm Action Modal */}
      <AdminModal open={confirmAction !== null} title={`Confirm ${confirmAction?.action === 'approve' ? 'Approval' : 'Rejection'}`} width="sm" onClose={() => setConfirmAction(null)}>
        {confirmAction && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Are you sure you want to <span className="font-semibold">{confirmAction.action}</span> this modification request?
            </p>
            <div>
              <label htmlFor="admin-notes" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Admin Notes (optional)
              </label>
              <textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this decision..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
              />
            </div>
            {(approveMutation.isError || rejectMutation.isError) && (
              <p role="alert" className="text-sm text-red-600">Action failed. Please try again.</p>
            )}
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setConfirmAction(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const notes = adminNotes.trim() || undefined;
                  if (confirmAction.action === 'approve') {
                    approveMutation.mutate({ id: confirmAction.id, notes });
                  } else {
                    rejectMutation.mutate({ id: confirmAction.id, notes });
                  }
                }}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {(approveMutation.isPending || rejectMutation.isPending) ? 'Processing...' : `Yes, ${confirmAction.action}`}
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
