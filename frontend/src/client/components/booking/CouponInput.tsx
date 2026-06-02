import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { couponsApi, type Coupon, type ValidateCouponResponseData } from '../../../shared/api/coupons';
import { formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { AlertCircle, Check, Tag, X, Loader2 } from 'lucide-react';

interface CouponInputProps {
  bookingValue: number;
  hotelId?: number;
  onCouponApplied: (coupon: Coupon, discountAmount: number) => void;
  onCouponRemoved: () => void;
}

export default function CouponInput({ bookingValue, hotelId, onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const { locale, t } = useI18n();
  const [code, setCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [error, setError] = useState('');

  const validateMutation = useMutation({
    mutationFn: () => couponsApi.validate({ code: code.trim(), booking_value: bookingValue, hotel_id: hotelId }),
    onSuccess: (response: { data: ValidateCouponResponseData }) => {
      const { coupon, discount_amount } = response.data.data;
      setAppliedCoupon(coupon);
      setDiscountAmount(discount_amount);
      setError('');
      onCouponApplied(coupon, discount_amount);
      setCode('');
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || t('coupons.invalid');
      setError(errorMessage);
    },
  });

  const handleApply = () => {
    if (!code.trim()) {
      setError(t('coupons.enterCode'));
      return;
    }
    setError('');
    validateMutation.mutate();
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setError('');
    onCouponRemoved();
  };

  const formatPrice = (price: string | number) => formatVndForLocale(price, locale);

  if (appliedCoupon) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">{appliedCoupon.code}</span>
              <span className="text-xs bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                {t('coupons.applied')}
              </span>
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">
              {appliedCoupon.discount_type === 'percentage'
                ? `${appliedCoupon.discount_value}% ${t('coupons.off')}`
                : formatPrice(appliedCoupon.discount_value) + ' ' + t('coupons.off')}
            </p>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">{t('coupons.discountAmount')}:</span> {formatPrice(discountAmount)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded transition-colors"
            aria-label={t('coupons.remove')}
          >
            <X className="size-4 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError('');
          }}
          placeholder={t('coupons.enterCode')}
          className="w-full pl-10 pr-24 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text placeholder:text-text-secondary"
          disabled={validateMutation.isPending}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || validateMutation.isPending}
          className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          {validateMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : null}
          {validateMutation.isPending ? t('common.loading') : t('coupons.apply')}
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="text-xs text-text-secondary">
        {t('coupons.enterCouponCode')}
      </div>
    </div>
  );
}