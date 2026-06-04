import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { adminApi } from '../../../shared/api/admin';
import type { Coupon } from '../../../shared/api/coupons';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';
import { useI18n } from '../../../shared/i18n/useI18n';
import { Check, X, Pencil, Trash2, Plus, Clock, Percent, DollarSign, Users } from 'lucide-react';

export default function CouponListPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ search: '', is_active: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({});

  const coupons = useQuery({
    queryKey: ['admin', 'coupons', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));
      return (await adminApi.coupons(filtered)).data;
    },
  });

  const detail = useQuery({
    queryKey: ['admin', 'coupons', selectedId],
    queryFn: async () => (await adminApi.coupon(selectedId!)).data.data,
    enabled: selectedId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Coupon>) => adminApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setShowForm(false);
      setIsEditing(false);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Coupon> }) => adminApi.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setShowForm(false);
      setIsEditing(false);
      setSelectedId(null);
      setFormData({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setSelectedId(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleCouponActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });

  const columns = useMemo<ColumnDef<Coupon>[]>(
    () => [
      {
        accessorKey: 'code',
        header: t('coupons.code'),
        cell: ({ row }) => (
          <button type="button" className="font-medium text-slate-950 underline underline-offset-2" onClick={() => setSelectedId(row.original.id)}>
            {row.original.code}
          </button>
        ),
      },
      {
        accessorKey: 'discount_type',
        header: t('coupons.discountType'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.discount_type === 'percentage' ? (
              <Percent className="size-4" />
            ) : (
              <DollarSign className="size-4" />
            )}
            <span>
              {row.original.discount_type === 'percentage'
                ? `${row.original.discount_value}%`
                : formatCurrency(row.original.discount_value)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'min_booking_value',
        header: t('coupons.minBookingValue'),
        cell: ({ row }) => (row.original.min_booking_value ? formatCurrency(row.original.min_booking_value) : '-'),
      },
      {
        accessorKey: 'used_count',
        header: `${t('coupons.usedCount')}/${t('coupons.maxUses')}`,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="size-4" />
            <span>
              {row.original.used_count}
              {row.original.max_uses && `/${row.original.max_uses}`}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'expires_at',
        header: t('coupons.expiresAt'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{row.original.expires_at ? formatDate(row.original.expires_at) : t('coupons.noCoupons')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: t('coupons.isActive'),
        cell: ({ row }) => <StatusBadge value={row.original.is_active ? t('coupons.active') : t('coupons.inactive')} />,
      },
      {
        id: 'actions',
        header: t('coupons.actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setFormData(row.original);
                setIsEditing(true);
                setSelectedId(row.original.id);
                setShowForm(true);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
              aria-label={t('coupons.edit')}
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('coupons.deleteConfirm'))) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
              aria-label={t('coupons.delete')}
            >
              <Trash2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleActiveMutation.mutate(row.original.id)}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
              aria-label={row.original.is_active ? t('coupons.inactive') : t('coupons.active')}
            >
              {row.original.is_active ? <X className="size-4" /> : <Check className="size-4" />}
            </button>
          </div>
        ),
      },
    ],
    [t, deleteMutation, toggleActiveMutation],
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

  const couponData = detail.data as Coupon | undefined;

  return (
    <div>
      {pageTitle(t('coupons.title'), t('coupons.subtitle'))}

      {coupons.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full border-4 border-slate-200 border-t-slate-950 h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap gap-2">
              <input
                type="text"
                placeholder={t('coupons.code')}
                value={params.search}
                onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
                className="max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={params.is_active}
                onChange={(e) => setParams((p) => ({ ...p, is_active: e.target.value, page: 1 }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t('coupons.status')}</option>
                <option value="true">{t('coupons.active')}</option>
                <option value="false">{t('coupons.inactive')}</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  discount_type: 'percentage',
                  discount_value: 10,
                  max_uses_per_user: 1,
                  is_active: true,
                });
                setIsEditing(false);
                setSelectedId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              {t('coupons.create')}
            </button>
          </div>

          {showForm && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold">{selectedId ? t('coupons.edit') : t('coupons.create')}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('coupons.code')}</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    required={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('coupons.discountType')}</label>
                  <select
                    value={formData.discount_type || 'percentage'}
                    onChange={(e) => setFormData((p) => ({ ...p, discount_type: e.target.value as 'percentage' | 'fixed_amount' }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    <option value="percentage">{t('coupons.percentage')}</option>
                    <option value="fixed_amount">{t('coupons.fixedAmount')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('coupons.discountValue')}</label>
                  <input
                    type="number"
                    value={formData.discount_value || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, discount_value: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('coupons.minBookingValue')}</label>
                  <input
                    type="number"
                    value={formData.min_booking_value || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, min_booking_value: parseFloat(e.target.value) || null }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('coupons.maxUses')}</label>
                  <input
                    type="number"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, max_uses: parseInt(e.target.value) || null }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('coupons.maxUsesPerUser')}</label>
                  <input
                    type="number"
                    value={formData.max_uses_per_user || 1}
                    onChange={(e) => setFormData((p) => ({ ...p, max_uses_per_user: parseInt(e.target.value) || 1 }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('coupons.startsAt')}</label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, starts_at: e.target.value || null }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('coupons.expiresAt')}</label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, expires_at: e.target.value || null }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">{t('coupons.description')}</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">{t('coupons.isActive')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{formData.is_active ? t('coupons.active') : t('coupons.inactive')}</span>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? t('common.loading') : selectedId ? t('coupons.edit') : t('coupons.create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setFormData({});
                    }}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <DataTable columns={columns} data={coupons.data?.data || []} />

          <Pagination pagination={coupons.data} onPageChange={setPage} />

          {selectedId && !isEditing && (
            <AdminModal
              open={selectedId !== null}
              onClose={() => setSelectedId(null)}
              title={`${t('coupons.code')}: ${couponData?.code}`}
            >
              {detail.isLoading ? (
                <div className="py-8 text-center text-sm text-slate-600">{t('common.loading')}</div>
              ) : couponData ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-semibold">{t('coupons.description')}</h4>
                    <p className="text-sm text-slate-600">{couponData.description || t('coupons.noCoupons')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-1 font-semibold">{t('coupons.discountType')}</h4>
                      <p className="text-sm text-slate-600">
                        {couponData.discount_type === 'percentage'
                          ? `${couponData.discount_value}%`
                          : formatCurrency(couponData.discount_value)}
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">{t('coupons.minBookingValue')}</h4>
                      <p className="text-sm text-slate-600">
                        {couponData.min_booking_value ? formatCurrency(couponData.min_booking_value) : t('coupons.noCoupons')}
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">{t('coupons.usedCount')}</h4>
                      <p className="text-sm text-slate-600">
                        {couponData.used_count}
                        {couponData.max_uses && `/${couponData.max_uses}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">{t('coupons.maxUsesPerUser')}</h4>
                      <p className="text-sm text-slate-600">{couponData.max_uses_per_user}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">{t('coupons.startsAt')}</h4>
                      <p className="text-sm text-slate-600">{couponData.starts_at ? formatDate(couponData.starts_at) : t('coupons.noCoupons')}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">{t('coupons.expiresAt')}</h4>
                      <p className="text-sm text-slate-600">{couponData.expires_at ? formatDate(couponData.expires_at) : t('coupons.noCoupons')}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </AdminModal>
          )}
        </>
      )}
    </div>
  );
}