import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi, type AuditLogEntry } from '../../../shared/api/admin';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, pageTitle } from '../adminUtils';

const actionColors: Record<string, string> = {
  created: 'bg-emerald-100 text-emerald-800',
  updated: 'bg-blue-100 text-blue-800',
  deleted: 'bg-red-100 text-red-800',
  toggled: 'bg-amber-100 text-amber-800',
};

export default function AuditLogPage() {
  const [params, setParams] = useState({ action: '', subject_type: '', date_from: '', date_to: '', page: 1 });

  const logs = useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      return (await adminApi.auditLogs(filtered)).data;
    },
  });

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      { accessorKey: 'created_at', header: 'Time', cell: ({ row }) => formatDate(row.original.created_at) },
      { accessorKey: 'user_name', header: 'User', cell: ({ row }) => row.original.user_name || 'System' },
      { accessorKey: 'action', header: 'Action', cell: ({ row }) => (
        <StatusBadge value={row.original.action} />
      )},
      { accessorKey: 'subject_label', header: 'Subject', cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.subject_label}</span>
      )},
      { accessorKey: 'ip_address', header: 'IP', cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.original.ip_address || '—'}</span>
      )},
    ],
    [],
  );

  const setPage = (page: number) => setParams((p) => ({ ...p, page }));

  return (
    <div>
      {pageTitle('Audit Log', 'Track all admin actions for security and compliance')}

      <div className="mb-3 flex flex-wrap gap-2">
        <select value={params.action} onChange={(e) => setParams((p) => ({ ...p, action: e.target.value, page: 1 }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
        </select>
        <select value={params.subject_type} onChange={(e) => setParams((p) => ({ ...p, subject_type: e.target.value, page: 1 }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All subjects</option>
          <option value="Hotel">Hotels</option>
          <option value="RoomType">Room types</option>
          <option value="Booking">Bookings</option>
          <option value="Coupon">Coupons</option>
        </select>
        <input type="date" value={params.date_from} onChange={(e) => setParams((p) => ({ ...p, date_from: e.target.value, page: 1 }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" value={params.date_to} onChange={(e) => setParams((p) => ({ ...p, date_to: e.target.value, page: 1 }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {logs.isLoading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full border-4 border-slate-200 border-t-slate-950 h-8 w-8" /></div>
      ) : (
        <>
          <DataTable columns={columns} data={logs.data?.data || []} />
          <Pagination pagination={logs.data} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
