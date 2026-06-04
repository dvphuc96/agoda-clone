import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { couponsApi, type Coupon, type ValidateCouponResponseData } from '../../../shared/api/coupons';
import { formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { useToast } from '../../../shared/components/Toast';
import { AlertCircle, Check, Tag, X, Loader2, ChevronDown, ChevronUp, Percent, DollarSign } from 'lucide-react';

interface CouponInputProps {
  bookingValue: number;
  hotelId?: number;
  onCouponApplied: (coupon: Coupon, discountAmount: number) => void;
  onCouponRemoved: () => void;
}

export default function CouponInput({ bookingValue, hotelId, onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const { locale, t } = useI18n();
  const { addToast } = useToast();
  const [code, setCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [error, setError] = useState('');
  const [showList, setShowList] = useState(false);

  const { data: availableCoupons } = useQuery({
    queryKey: ['available-coupons', hotelId, bookingValue],
    queryFn: () => couponsApi.available({ hotel_id: hotelId, booking_value: bookingValue }).then(r => r.data.data),
    enabled: !appliedCoupon,
  });

  const validateMutation = useMutation({
    mutationFn: (couponCode: string) =>
      couponsApi.validate({ code: couponCode, booking_value: bookingValue, hotel_id: hotelId }),
    onSuccess: (response: { data: ValidateCouponResponseData }) => {
      const { coupon, discount_amount } = response.data.data;
      setAppliedCoupon(coupon);
      setDiscountAmount(discount_amount);
      setError('');
      onCouponApplied(coupon, discount_amount);
      addToast('success', t('coupons.applied'));
      setCode('');
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || t('coupons.invalid');
      setError(errorMessage);
      addToast('error', errorMessage);
    },
  });

  const handleApplyCode = () => {
    if (!code.trim()) {
      setError(t('coupons.enterCode'));
      return;
    }
    setError('');
    validateMutation.mutate(code.trim());
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    setError('');
    validateMutation.mutate(coupon.code);
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Check className="size-4 text-emerald-600" />
              <span className="font-semibold text-emerald-700">{appliedCoupon.code}</span>
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs text-emerald-800">
                {t('coupons.applied')}
              </span>
            </div>
            <p className="mb-1 text-sm text-emerald-600">
              {appliedCoupon.discount_type === 'percentage'
                ? `${appliedCoupon.discount_value}% ${t('coupons.off')}`
                : formatPrice(appliedCoupon.discount_value) + ' ' + t('coupons.off')}
            </p>
            <div className="text-xs text-emerald-600">
              <span className="font-medium">{t('coupons.discountAmount')}:</span> {formatPrice(discountAmount)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded p-1.5 transition-colors hover:bg-emerald-200"
            aria-label={t('coupons.remove')}
          >
            <X className="size-4 text-emerald-600" />
          </button>
        </div>
      </div>
    );
  }

  const coupons = availableCoupons ?? [];

  return (
    <div className="space-y-3">
      {/* Manual code input */}
      <div className="relative">
        <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError('');
          }}
          placeholder={t('coupons.enterCode')}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-24 text-sm text-text placeholder:text-text-secondary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={validateMutation.isPending}
          onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
        />
        <button
          type="button"
          onClick={handleApplyCode}
          disabled={!code.trim() || validateMutation.isPending}
          className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 bg-primary"
        >
          {validateMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
          {validateMutation.isPending ? t('common.loading') : t('coupons.apply')}
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Available coupons list */}
      {coupons.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-surface">
          <button
            type="button"
            onClick={() => setShowList(!showList)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-tab/30"
          >
            <span>{t('coupons.title')} ({coupons.length})</span>
            {showList ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {showList && (
            <div className="space-y-2 border-t border-border/40 px-4 py-3">
              {coupons.map((coupon) => (
                <button
                  key={coupon.id}
                  type="button"
                  onClick={() => handleSelectCoupon(coupon)}
                  disabled={validateMutation.isPending}
                  className="flex w-full items-center gap-3 rounded-lg border border-border/40 p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                >
                  <div className={`flex size-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    coupon.discount_type === 'percentage' ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {coupon.discount_type === 'percentage' ? (
                      <><Percent className="size-5" /><span className="absolute text-[8px] font-bold">{coupon.discount_value}</span></>
                    ) : (
                      <DollarSign className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text">{coupon.code}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {coupon.discount_type === 'percentage'
                          ? `-${coupon.discount_value}%`
                          : `-${formatPrice(coupon.discount_value)}`}
                      </span>
                    </div>
                    {coupon.description && (
                      <p className="mt-0.5 truncate text-xs text-text-secondary">{coupon.description}</p>
                    )}
                    {coupon.min_booking_value && (
                      <p className="mt-0.5 text-[10px] text-text-secondary/70">
                        {t('coupons.minBookingValue')}: {formatPrice(coupon.min_booking_value)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {coupons.length === 0 && (
        <p className="text-xs text-text-secondary">{t('coupons.enterCouponCode')}</p>
      )}
    </div>
  );
}
