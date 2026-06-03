import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi } from '../../../shared/api/admin';
import type { SupportTicket } from '../../../shared/api/support';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import AdminModal from '../../components/AdminModal';
import { formatDate, pageTitle } from '../adminUtils';
import { Send } from 'lucide-react';

export default function SupportListPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ status: '', category: '', search: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState('');

  const tickets = useQuery({
    queryKey: ['admin', 'support', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      return (await adminApi.supportTickets(filtered)).data;
    },
  });

  const detail = useQuery({
    queryKey: ['admin', 'support', selectedId],
    queryFn: async () => (await adminApi.supportTicket(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const replyMutation = useMutation({
    mutationFn: () => adminApi.replySupportTicket(selectedId!, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] });
      setReply('');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (data: { status?: string; priority?: string }) => adminApi.updateSupportTicketStatus(selectedId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] });
    },
  });

  const columns = useMemo<ColumnDef<SupportTicket>[]>(
    () => [
      { accessorKey: 'subject', header: 'Subject', cell: ({ row }) => (
        <button type="button" className="font-medium text-slate-950 underline underline-offset-2" onClick={() => setSelectedId(row.original.id)}>
          {row.original.subject}
        </button>
      )},
      { accessorKey: 'user', header: 'User', cell: ({ row }) => row.original.user?.name || '-' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => {
        const p = row.original.priority;
        const colors: Record<string, string> = { urgent: 'text-red-600 font-bold', high: 'text-orange-600 font-medium', normal: '', low: 'text-slate-400' };
        return <span className={colors[p] || ''}>{p}</span>;
      }},
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { accessorKey: 'created_at', header: 'Created', cell: ({ row }) => formatDate(row.original.created_at) },
    ],
    [],
  );

  const setPage = (page: number) => setParams((p) => ({ ...p, page }));
  const ticket = detail.data as SupportTicket | undefined;

  return (
    <div>
      {pageTitle('Support Tickets', 'Manage customer support requests')}

      <div className="mb-3 flex flex-wrap gap-2">
        <input type="text" placeholder="Search subject/booking code..." value={params.search} onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))} className="max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select value={params.status} onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={params.category} onChange={(e) => setParams((p) => ({ ...p, category: e.target.value, page: 1 }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          <option value="booking">Booking</option>
          <option value="payment">Payment</option>
          <option value="hotel">Hotel</option>
          <option value="transfer">Transfer</option>
          <option value="other">Other</option>
        </select>
      </div>

      <DataTable columns={columns} data={tickets.data?.data || []} />
      <Pagination pagination={tickets.data} onPageChange={setPage} />

      {selectedId && (
        <AdminModal open={selectedId !== null} title={ticket?.subject || 'Ticket Detail'} width="lg" onClose={() => { setSelectedId(null); setReply(''); }}>
          {detail.isLoading ? (
            <div className="py-8 text-center text-sm text-slate-600">Loading...</div>
          ) : ticket ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs font-semibold uppercase text-slate-500">User</span><div className="font-medium">{ticket.user?.name} ({ticket.user?.email})</div></div>
                <div><span className="text-xs font-semibold uppercase text-slate-500">Booking</span><div className="font-medium">{ticket.booking_code || '—'}</div></div>
                <div><span className="text-xs font-semibold uppercase text-slate-500">Category</span><div className="font-medium capitalize">{ticket.category}</div></div>
                <div><span className="text-xs font-semibold uppercase text-slate-500">Created</span><div className="font-medium">{formatDate(ticket.created_at)}</div></div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={ticket.status}
                  onChange={(e) => statusMutation.mutate({ status: e.target.value })}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={ticket.priority}
                  onChange={(e) => statusMutation.mutate({ priority: e.target.value })}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4 max-h-64 overflow-y-auto">
                {(ticket.messages || []).map((msg) => (
                  <div key={msg.id} className={`rounded-lg p-3 text-sm ${msg.is_admin ? 'bg-blue-50 border border-blue-100 ml-6' : 'bg-slate-50 mr-6'}`}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{msg.is_admin ? 'Admin' : msg.user_name}</span>
                      <span className="text-xs text-slate-400">{formatDate(msg.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>

              {ticket.status !== 'closed' && (
                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => reply.trim() && replyMutation.mutate()}
                    disabled={replyMutation.isPending || !reply.trim()}
                    className="flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    Reply
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </AdminModal>
      )}
    </div>
  );
}
