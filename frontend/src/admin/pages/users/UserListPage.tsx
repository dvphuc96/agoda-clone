import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type AdminUser } from '../../../shared/api/admin';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, pageTitle } from '../adminUtils';

export default function UserListPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', role: '' });
  const users = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => (await adminApi.users(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))).data,
  });
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'user' | 'admin' }) => adminApi.updateUserRole(id, role),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
  const activeMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleUserActive(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
    { accessorKey: 'name', header: 'Name' },
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
          <select aria-label="Thay đổi vai trò" value={row.original.role} onChange={(event) => roleMutation.mutate({ id: row.original.id, role: event.target.value as 'user' | 'admin' })} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="button" className="rounded-md border px-3 py-1.5 text-xs font-semibold" onClick={() => activeMutation.mutate(row.original.id)}>
            {row.original.is_active ? 'Disable' : 'Enable'}
          </button>
        </div>
      ),
    },
  ], [activeMutation, roleMutation]);

  return (
    <div>
      {pageTitle('Users', 'Manage user roles, account status, and customer records.')}
      <div className="mb-3 flex gap-2">
        <input aria-label="Tìm kiếm người dùng" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search users" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:max-w-sm" />
        <select aria-label="Lọc theo vai trò" value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <DataTable data={users.data?.data ?? []} columns={columns} emptyText={users.isLoading ? 'Loading...' : 'No users found.'} />
    </div>
  );
}
