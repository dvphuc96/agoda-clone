import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supportApi, type TicketMessage } from '../../shared/api/support';
import { useI18n } from '../../shared/i18n/useI18n';
import { formatDateForLocale } from '../../shared/i18n/format';
import { MessageCircle, Plus, Send, X } from 'lucide-react';

const statusColors: Record<string, string> = {
  open: 'bg-badge-pending-bg text-badge-pending-text',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-badge-confirmed-bg text-badge-confirmed-text',
  closed: 'bg-slate-100 text-slate-600',
};

export default function SupportPage() {
  const { locale, t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: '', category: 'other', booking_code: '', message: '' });
  const [reply, setReply] = useState('');

  const tickets = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => (await supportApi.list()).data,
  });

  const detail = useQuery({
    queryKey: ['support-ticket', selectedId],
    queryFn: async () => (await supportApi.get(selectedId!)).data,
    enabled: selectedId !== null,
  });

  const createMutation = useMutation({
    mutationFn: () => supportApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setShowForm(false);
      setForm({ subject: '', category: 'other', booking_code: '', message: '' });
    },
  });

  const replyMutation = useMutation({
    mutationFn: () => supportApi.reply(selectedId!, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', selectedId] });
      setReply('');
    },
  });

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = { open: t('support.statusOpen'), in_progress: t('support.statusInProgress'), resolved: t('support.statusResolved'), closed: t('support.statusClosed') };
    return map[s] || s;
  };

  const getCategoryLabel = (c: string) => {
    const map: Record<string, string> = { booking: t('support.categoryBooking'), payment: t('support.categoryPayment'), hotel: t('support.categoryHotel'), transfer: t('support.categoryTransfer'), other: t('support.categoryOther') };
    return map[c] || c;
  };

  if (selectedId && detail.data) {
    const ticket = detail.data.data;
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button type="button" onClick={() => setSelectedId(null)} className="mb-4 text-sm text-primary hover:underline">&larr; {t('booking.backToList')}</button>
        <div className="overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
          <div className="rounded-[calc(1rem-6px)] bg-surface p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-text">{ticket.subject}</h2>
                <p className="mt-1 text-sm text-text-secondary">{getCategoryLabel(ticket.category)} &middot; {formatDateForLocale(ticket.created_at, locale)}</p>
              </div>
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${statusColors[ticket.status] || ''}`}>{getStatusLabel(ticket.status)}</span>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              {(ticket.messages || []).map((msg: TicketMessage) => (
                <div key={msg.id} className={`rounded-xl p-4 ${msg.is_admin ? 'bg-primary/5 border border-primary/10 ml-8' : 'bg-tab mr-8'}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary">{msg.is_admin ? 'GoStay Support' : msg.user_name}</span>
                    <span className="text-xs text-text-secondary">{formatDateForLocale(msg.created_at, locale)}</span>
                  </div>
                  <p className="text-sm text-text whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>

            {ticket.status !== 'closed' && (
              <div className="mt-4 flex gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t('support.replyPlaceholder')}
                  rows={2}
                  className="flex-1 rounded-xl border border-border bg-warm-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => reply.trim() && replyMutation.mutate()}
                  disabled={replyMutation.isPending || !reply.trim()}
                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  <Send className="size-4" />
                  {replyMutation.isPending ? t('support.sending') : t('support.reply')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('support.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('support.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? t('common.cancel') : t('support.createTicket')}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
          <form
            onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
            className="rounded-[calc(1rem-6px)] bg-surface p-6 space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-text">{t('support.subject')}</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={t('support.subjectPlaceholder')} required className="w-full rounded-xl border border-border bg-warm-surface px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">{t('support.category')}</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-border bg-warm-surface px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="booking">{t('support.categoryBooking')}</option>
                  <option value="payment">{t('support.categoryPayment')}</option>
                  <option value="hotel">{t('support.categoryHotel')}</option>
                  <option value="transfer">{t('support.categoryTransfer')}</option>
                  <option value="other">{t('support.categoryOther')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">{t('support.bookingCode')}</label>
                <input type="text" value={form.booking_code} onChange={(e) => setForm({ ...form, booking_code: e.target.value })} placeholder={t('support.bookingCodePlaceholder')} className="w-full rounded-xl border border-border bg-warm-surface px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">{t('support.message')}</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t('support.messagePlaceholder')} rows={4} required className="w-full rounded-xl border border-border bg-warm-surface px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
              <Send className="size-4" />
              {createMutation.isPending ? t('support.sending') : t('support.send')}
            </button>
          </form>
        </div>
      )}

      {tickets.isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full border-4 border-border border-t-primary h-8 w-8" /></div>
      ) : (
        <div className="space-y-3">
          {(tickets.data?.data || []).length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle className="mx-auto mb-3 size-12 text-text-secondary/40" />
              <p className="text-text-secondary">{t('support.noTickets')}</p>
            </div>
          ) : (
            (tickets.data?.data || []).map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className="w-full overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5 text-left transition-spring-fast hover:ring-primary/30"
              >
                <div className="rounded-[calc(1rem-6px)] bg-surface p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-text">{ticket.subject}</h3>
                      <p className="mt-0.5 text-xs text-text-secondary">{getCategoryLabel(ticket.category)} &middot; {formatDateForLocale(ticket.created_at, locale)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-medium ${statusColors[ticket.status] || ''}`}>{getStatusLabel(ticket.status)}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
