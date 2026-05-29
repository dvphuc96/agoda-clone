import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type AdminUser, type Paginated } from '../../../shared/api/admin';
import type { Booking } from '../../../shared/api/bookings';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';

export default function UserListPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', role: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const users = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => (await adminApi.users(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))).data,
  });

  const detail = useQuery({
    queryKey: ['admin', 'users', selectedId],
    queryFn: async () => (await adminApi.user(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'user' | 'admin' }) => adminApi.updateUserRole(id, role),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
  const activeMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleUserActive(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <button type="button" className="font-medium text-slate-950 underline underline-offset-2" onClick={() => setSelectedId(row.original.id)}>
            {row.original.name}
          </button>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      { header: 'Role', cell: ({ row }) => <StatusBadge value={row.original.role} /> },
      { header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.is_active ? 'active' : 'inactive'} /> },
      { header: 'Bookings', cell: ({ row }) => row.original.bookings_count ?? 0 },
      { header: 'Joined', cell: ({ row }) => formatDate(row.original.created_at) },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <select
              aria-label="Change user role"
              value={row.original.role}
              onChange={(event) => roleMutation.mutate({ id: row.original.id, role: event.target.value as 'user' | 'admin' })}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="button" className="rounded-md border px-3 py-1.5 text-xs font-semibold" onClick={() => activeMutation.mutate(row.original.id)}>
              {row.original.is_active ? 'Disable' : 'Enable'}
            </button>
          </div>
        ),
      },
    ],
    [activeMutation, roleMutation],
  );

  const userData = detail.data as AdminUser | undefined;

  return (
    <div>
      {pageTitle('Users', 'Manage user roles, account status, and customer records.')}
      <div className="mb-3 flex gap-2">
        <input
          aria-label="Search users"
          value={filters.search}
          onChange={(event) => setFilters((f) => ({ ...f, search: event.target.value, page: 1 }))}
          placeholder="Search users"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:max-w-sm"
        />
        <select
          aria-label="Filter by role"
          value={filters.role}
          onChange={(event) => setFilters((f) => ({ ...f, role: event.target.value, page: 1 }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <DataTable data={users.data?.data ?? []} columns={columns} emptyText={users.isLoading ? 'Loading…' : 'No users found.'} />
      <Pagination pagination={users.data as Paginated<unknown> | undefined} onPageChange={setPage} />

      <AdminModal open={selectedId !== null} title="User Detail" width="lg" onClose={() => setSelectedId(null)}>
        {detail.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
        ) : userData ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <ProfileField label="Name" value={userData.name} />
              <ProfileField label="Email" value={userData.email} />
              <ProfileField label="Phone" value={userData.phone ?? '-'} />
              <ProfileField label="Role" value={<StatusBadge value={userData.role} />} />
              <ProfileField label="Status" value={<StatusBadge value={userData.is_active ? 'active' : 'inactive'} />} />
              <ProfileField label="Joined" value={formatDate(userData.created_at)} />
              <ProfileField label="Total Bookings" value={String(userData.bookings_count ?? 0)} />
            </div>
            {(userData.bookings?.length ?? 0) > 0 && (
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Booking History</span>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Code</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Hotel</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Dates</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Total</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userData.bookings!.map((b: Booking) => (
                        <tr key={b.id}>
                          <td className="px-3 py-2 font-mono text-xs">{b.booking_code}</td>
                          <td className="px-3 py-2">{b.room_type?.hotel?.name ?? '-'}</td>
                          <td className="px-3 py-2">
                            {formatDate(b.check_in)} - {formatDate(b.check_out)}
                          </td>
                          <td className="px-3 py-2">{formatCurrency(b.total_price)}</td>
                          <td className="px-3 py-2">
                            <StatusBadge value={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">User not found.</p>
        )}
      </AdminModal>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-950">{value}</span>
    </div>
  );
}
