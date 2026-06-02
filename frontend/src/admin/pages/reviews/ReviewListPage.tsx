import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type Paginated } from '../../../shared/api/admin';
import type { Review } from '../../../shared/api/reviews';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, pageTitle } from '../adminUtils';

export default function ReviewListPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ status: '', hotel_id: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const reviews = useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      return (await adminApi.reviews(filtered)).data;
    },
  });

  const detail = useQuery({
    queryKey: ['admin', 'review', selectedId],
    queryFn: async () => (await adminApi.review(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.updateReviewStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      setSelectedId(null);
    },
  });

  const hotels = useQuery({
    queryKey: ['admin', 'hotels', 'select'],
    queryFn: async () => (await adminApi.hotels({ per_page: 200 })).data.data,
  });

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        accessorKey: 'hotel_name',
        header: 'Hotel',
      },
      {
        header: 'User',
        cell: ({ row }) => (row.original as Review & { user?: { name: string } }).user?.name ?? '-',
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-500">&#9733;</span>
            <span className="font-medium">{row.original.rating}</span>
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => row.original.title ?? '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            {row.original.status === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ id: row.original.id, status: 'approved' })}
                  className="rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ id: row.original.id, status: 'rejected' })}
                  className="rounded px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Reject
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setSelectedId(row.original.id)}
              className="rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              View
            </button>
          </div>
        ),
      },
    ],
    [statusMutation],
  );

  const setPage = (page: number) => setParams((p) => ({ ...p, page }));

  const reviewDetail = detail.data as (Review & { user?: { name: string; avatar?: string }; hotel_name?: string; booking?: { booking_code: string } }) | undefined;

  return (
    <div>
      {pageTitle('Reviews', 'Moderate guest reviews and manage ratings across all hotels.')}
      <div className="mb-3 flex flex-wrap gap-2">
        <select
          aria-label="Filter by status"
          value={params.status}
          onChange={(event) => setParams((p) => ({ ...p, status: event.target.value, page: 1 }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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
      </div>

      <DataTable data={(reviews.data?.data ?? []) as Review[]} columns={columns} emptyText={reviews.isLoading ? 'Loading...' : 'No reviews found.'} />
      <Pagination pagination={reviews.data as Paginated<unknown> | undefined} onPageChange={setPage} />

      <AdminModal open={selectedId !== null} title="Review Detail" width="md" onClose={() => setSelectedId(null)}>
        {detail.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
        ) : reviewDetail ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Hotel" value={reviewDetail.hotel_name ?? '-'} />
              <Info label="User" value={reviewDetail.user?.name ?? '-'} />
              <Info label="Rating" value={`${reviewDetail.rating} / 5`} />
              <Info label="Status" value={<StatusBadge value={reviewDetail.status} />} />
              <Info label="Title" value={reviewDetail.title ?? '-'} />
              <Info label="Created" value={formatDate(reviewDetail.created_at)} />
            </div>
            {reviewDetail.comment && (
              <div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Comment</span>
                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{reviewDetail.comment}</p>
              </div>
            )}
            <div className="flex gap-2 border-t border-slate-200 pt-4">
              {reviewDetail.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => statusMutation.mutate({ id: reviewDetail.id, status: 'approved' })}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => statusMutation.mutate({ id: reviewDetail.id, status: 'rejected' })}
                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this review?')) deleteMutation.mutate(reviewDetail.id);
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Review not found.</p>
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
