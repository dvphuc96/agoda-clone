import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, Gift, TrendingUp, Award, Loader2 } from 'lucide-react';
import { loyaltyApi } from '../../shared/api/loyalty';
import { useI18n } from '../../shared/i18n/useI18n';

const tierColors: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-500 to-yellow-700',
  platinum: 'from-purple-500 to-purple-700',
};

const tierLabels: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export default function LoyaltyPage() {
  const { t } = useI18n();

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: () => loyaltyApi.getSummary().then(r => r.data.data),
  });

  const { data: txData } = useQuery({
    queryKey: ['loyalty', 'transactions'],
    queryFn: () => loyaltyApi.getTransactions().then(r => r.data),
  });

  const summary = summaryData;
  const transactions = Array.isArray(txData?.data) ? txData.data : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) return null;

  const progressPercent = summary.next_tier
    ? Math.min(100, ((summary.lifetime_points / summary.next_tier.threshold) * 100))
    : 100;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-navy">{t('loyalty.title')}</h1>

      {/* Tier Card */}
      <div className={`mb-8 overflow-hidden rounded-2xl bg-gradient-to-br ${tierColors[summary.tier] || tierColors.bronze} p-6 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="size-6" />
              <span className="text-lg font-bold">{tierLabels[summary.tier]}</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black">{summary.points_balance.toLocaleString()}</span>
              <span className="text-sm opacity-80">{t('loyalty.points')}</span>
            </div>
            <div className="mt-1 text-sm opacity-80">
              {t('loyalty.worth')}: {summary.discount_value.toLocaleString('vi-VN')}đ
            </div>
          </div>
          <div className="text-right text-sm opacity-80">
            <div>{t('loyalty.lifetime')}: {summary.lifetime_points.toLocaleString()}</div>
            <div>{t('loyalty.multiplier')}: {summary.tier_multiplier}x</div>
          </div>
        </div>

        {summary.next_tier && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs opacity-80">
              <span>{tierLabels[summary.tier]}</span>
              <span>{tierLabels[summary.next_tier.tier]} ({summary.next_tier.points_needed} {t('loyalty.pointsNeeded')})</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
          <Star className="mx-auto mb-1 size-5 text-amber-500" />
          <div className="text-lg font-bold text-navy">{summary.lifetime_points.toLocaleString()}</div>
          <div className="text-xs text-text-secondary">{t('loyalty.totalEarned')}</div>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
          <Gift className="mx-auto mb-1 size-5 text-primary" />
          <div className="text-lg font-bold text-navy">{summary.discount_value.toLocaleString('vi-VN')}đ</div>
          <div className="text-xs text-text-secondary">{t('loyalty.availableDiscount')}</div>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
          <TrendingUp className="mx-auto mb-1 size-5 text-green-500" />
          <div className="text-lg font-bold text-navy">{summary.tier_multiplier}x</div>
          <div className="text-xs text-text-secondary">{t('loyalty.earnRate')}</div>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="mb-4 text-lg font-semibold text-navy">{t('loyalty.history')}</h2>
      {transactions.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-8 text-center text-sm text-text-secondary">
          {t('loyalty.noTransactions')}
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className={`grid size-9 place-items-center rounded-full ${tx.type === 'earn' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {tx.type === 'earn' ? <TrendingUp className="size-4" /> : <Gift className="size-4" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-text">{tx.description}</div>
                  <div className="text-xs text-text-secondary">{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <span className={`text-sm font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                {tx.type === 'earn' ? '+' : '-'}{tx.points}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/bookings" className="text-sm font-medium text-primary hover:underline">
          {t('loyalty.viewBookings')} →
        </Link>
      </div>
    </div>
  );
}
