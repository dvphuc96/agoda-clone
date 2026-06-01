import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { adminApi, type Paginated } from '../../../shared/api/admin';
import type { BookingPolicy, BookingPolicyPayload } from '../../../shared/api/policies';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { pageTitle } from '../adminUtils';

const emptyForm: BookingPolicyPayload = {
  name: '',
  description: '',
  hotel_id: null,
  room_type_id: null,
  free_cancellation_hours: 24,
  cancellation_fee_percent: 0,
  is_non_refundable: false,
  is_active: true,
};

export default function PolicyListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BookingPolicy | null>(null);
  const [form, setForm] = useState<BookingPolicyPayload>(emptyForm);
  const [formError, setFormError] = useState('');

  const policies = useQuery({
    queryKey: ['admin', 'booking-policies', { page }],
    queryFn: async () => (await adminApi.bookingPolicies({ page })).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: BookingPolicyPayload) => adminApi.createBookingPolicy(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'booking-policies'] }); closeModal(); },
    onError: () => setFormError('Failed to create policy. Please try again.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingPolicyPayload }) => adminApi.updateBookingPolicy(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'booking-policies'] }); closeModal(); },
    onError: () => setFormError('Failed to update policy. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBookingPolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'booking-policies'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = useCallback((policy: BookingPolicy) => {
    setEditing(policy);
    setForm({
      name: policy.name,
      description: policy.description ?? '',
      hotel_id: policy.hotel_id,
      room_type_id: policy.room_type_id,
      free_cancellation_hours: policy.free_cancellation_hours,
      cancellation_fee_percent: policy.cancellation_fee_percent,
      is_non_refundable: policy.is_non_refundable,
      is_active: policy.is_active,
    });
    setFormError('');
    setModalOpen(true);
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Policy name is required.');
      return;
    }
    if (!form.hotel_id) {
      setFormError('Hotel ID is required.');
      return;
    }
    if (form.free_cancellation_hours < 0) {
      setFormError('Free cancellation hours must be 0 or greater.');
      return;
    }
    if (form.cancellation_fee_percent < 0 || form.cancellation_fee_percent > 100) {
      setFormError('Cancellation fee percent must be between 0 and 100.');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const columns = useMemo<ColumnDef<BookingPolicy>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <button type="button" className="font-medium text-slate-950 underline underline-offset-2" onClick={() => openEdit(row.original)}>
            {row.original.id}
          </button>
        ),
      },
      { header: 'Name', cell: ({ row }) => row.original.name },
      { header: 'Hotel', cell: ({ row }) => row.original.hotel?.name ?? (row.original.hotel_id ? `#${row.original.hotel_id}` : 'All') },
      { header: 'Room Type', cell: ({ row }) => row.original.room_type?.name ?? (row.original.room_type_id ? `#${row.original.room_type_id}` : 'All') },
      { header: 'Free Cancel', cell: ({ row }) => `${row.original.free_cancellation_hours}h` },
      { header: 'Fee', cell: ({ row }) => `${row.original.cancellation_fee_percent}%` },
      { header: 'Non-Refundable', cell: ({ row }) => row.original.is_non_refundable ? 'Yes' : 'No' },
      { header: 'Active', cell: ({ row }) => row.original.is_active ? 'Yes' : 'No' },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button type="button" onClick={() => openEdit(row.original)} className="text-xs font-medium text-blue-600 hover:underline">Edit</button>
            <button
              type="button"
              onClick={() => { if (confirm('Delete this policy?')) deleteMutation.mutate(row.original.id); }}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation, openEdit],
  );

  return (
    <div>
      {pageTitle('Booking Policies', 'Manage cancellation policies for hotels and room types.')}
      <div className="mb-4">
        <button type="button" onClick={openCreate} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Add Policy
        </button>
      </div>

      <DataTable data={(policies.data?.data ?? []) as BookingPolicy[]} columns={columns} emptyText={policies.isLoading ? 'Loading…' : 'No policies found.'} />
      <Pagination pagination={policies.data as Paginated<unknown> | undefined} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <AdminModal open={modalOpen} title={editing ? 'Edit Policy' : 'Create Policy'} width="md" onClose={closeModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}

          <Field label="Policy Name">
            <input
              aria-label="Policy name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:ring-1 focus:ring-slate-950 outline-none"
            />
          </Field>

          <Field label="Description (optional)">
            <textarea
              aria-label="Description"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:ring-1 focus:ring-slate-950 outline-none"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Hotel ID">
              <input
                aria-label="Hotel ID"
                type="number"
                value={form.hotel_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, hotel_id: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Required"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:ring-1 focus:ring-slate-950 outline-none"
              />
            </Field>
            <Field label="Room Type ID (optional)">
              <input
                aria-label="Room Type ID"
                type="number"
                value={form.room_type_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, room_type_id: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Leave empty for all room types"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:ring-1 focus:ring-slate-950 outline-none"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Free Cancellation Hours">
              <input
                aria-label="Free cancellation hours"
                type="number"
                min={0}
                value={form.free_cancellation_hours}
                onChange={(e) => setForm((f) => ({ ...f, free_cancellation_hours: Number(e.target.value) }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:ring-1 focus:ring-slate-950 outline-none"
              />
            </Field>
            <Field label="Cancellation Fee Percent">
              <input
                aria-label="Cancellation fee percent"
                type="number"
                min={0}
                max={100}
                value={form.cancellation_fee_percent}
                onChange={(e) => setForm((f) => ({ ...f, cancellation_fee_percent: Number(e.target.value) }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:ring-1 focus:ring-slate-950 outline-none"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_non_refundable ?? false}
              onChange={(e) => setForm((f) => ({ ...f, is_non_refundable: e.target.checked }))}
              className="size-4 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Non-refundable (no cancellation allowed)</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="size-4 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Active</span>
          </label>

          <div className="flex gap-3 justify-end border-t border-slate-200 pt-4">
            <button type="button" onClick={closeModal} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : editing ? 'Update Policy' : 'Create Policy'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </div>
  );
}
