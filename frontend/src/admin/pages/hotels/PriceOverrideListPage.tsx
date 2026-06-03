import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../../shared/api/admin';
import type { PriceOverride } from '../../../shared/api/price-overrides';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';
import { Check, X, Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';

export default function PriceOverrideListPage() {
  const { roomTypeId } = useParams<{ roomTypeId: string }>();
  const rtId = Number(roomTypeId);
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PriceOverride>>({});

  const overrides = useQuery({
    queryKey: ['admin', 'price-overrides', rtId, params],
    queryFn: async () => {
      const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null));
      return (await adminApi.priceOverrides(rtId, filtered)).data;
    },
    enabled: !!rtId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<PriceOverride>) => adminApi.createPriceOverride(rtId, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'price-overrides', rtId] });
      setIsEditing(false);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PriceOverride> }) => adminApi.updatePriceOverride(rtId, id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'price-overrides', rtId] });
      setIsEditing(false);
      setSelectedId(null);
      setFormData({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deletePriceOverride(rtId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'price-overrides', rtId] });
      setSelectedId(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminApi.togglePriceOverrideActive(rtId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'price-overrides', rtId] });
    },
  });

  const columns = useMemo<ColumnDef<PriceOverride>[]>(
    () => [
      {
        accessorKey: 'label',
        header: 'Label',
        cell: ({ row }) => (
          <button type="button" className="font-medium text-slate-950 underline underline-offset-2" onClick={() => setSelectedId(row.original.id)}>
            {row.original.label || '—'}
          </button>
        ),
      },
      {
        accessorKey: 'start_date',
        header: 'Start',
        cell: ({ row }) => formatDate(row.original.start_date),
      },
      {
        accessorKey: 'end_date',
        header: 'End',
        cell: ({ row }) => formatDate(row.original.end_date),
      },
      {
        accessorKey: 'price_per_night',
        header: 'Price/Night',
        cell: ({ row }) => (
          <span className="font-semibold text-emerald-700">{formatCurrency(row.original.price_per_night)}</span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => <StatusBadge value={row.original.is_active ? 'Active' : 'Inactive'} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setFormData(row.original);
                setIsEditing(true);
                setSelectedId(row.original.id);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Edit"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this rate override?')) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleMutation.mutate(row.original.id)}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
              aria-label={row.original.is_active ? 'Deactivate' : 'Activate'}
            >
              {row.original.is_active ? <X className="size-4" /> : <Check className="size-4" />}
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation, toggleMutation],
  );

  const setPage = (page: number) => setParams((p) => ({ ...p, page }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedId) {
      updateMutation.mutate({ id: selectedId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/admin/hotels" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="size-4" />
          Back to Hotels
        </Link>
      </div>

      {pageTitle('Rate Plans', 'Manage seasonal pricing for this room type')}

      {overrides.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full border-4 border-slate-200 border-t-slate-950 h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div />
            <button
              type="button"
              onClick={() => {
                setFormData({ is_active: true });
                setIsEditing(false);
                setSelectedId(null);
              }}
              className="flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Create Override
            </button>
          </div>

          {isEditing && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold">{selectedId ? 'Edit Override' : 'Create Override'}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Label</label>
                  <input
                    type="text"
                    value={formData.label || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    placeholder="e.g. High Season, Tet, Weekend"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Price per night (VND)</label>
                  <input
                    type="number"
                    value={formData.price_per_night || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, price_per_night: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Start date</label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">End date</label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Active</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{formData.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : selectedId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({});
                    }}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <DataTable columns={columns} data={overrides.data?.data || []} />
          <Pagination pagination={overrides.data} onPageChange={setPage} />

          {selectedId && !isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedId(null)}>
              <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-4 text-lg font-semibold">Override Details</h3>
                {(() => {
                  const item = overrides.data?.data?.find((o) => o.id === selectedId);
                  if (!item) return null;
                  return (
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium">Label:</span> {item.label || '—'}</div>
                      <div><span className="font-medium">Date range:</span> {formatDate(item.start_date)} — {formatDate(item.end_date)}</div>
                      <div><span className="font-medium">Price/night:</span> <span className="font-semibold text-emerald-700">{formatCurrency(item.price_per_night)}</span></div>
                      <div><span className="font-medium">Status:</span> {item.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                  );
                })()}
                <button type="button" onClick={() => setSelectedId(null)} className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Close</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
