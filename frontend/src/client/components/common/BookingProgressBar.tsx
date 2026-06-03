import { useLocation, Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useI18n } from '../../../shared/i18n/useI18n';

const steps = [
  { path: '/search', labelKey: 'booking.progressSearch' },
  { path: '/hotel', labelKey: 'booking.progressHotel' },
  { path: '/booking', labelKey: 'booking.progressBooking' },
  { path: '/payment', labelKey: 'booking.progressPayment' },
  { path: '/bookings', labelKey: 'booking.progressConfirmation' },
] as const;

export default function BookingProgressBar() {
  const location = useLocation();
  const { t } = useI18n();

  const currentStep = steps.findIndex((s) => location.pathname.startsWith(s.path));
  if (currentStep === -1) return null;

  return (
    <div className="sticky top-16 z-30 border-b border-border/50 bg-surface/95 backdrop-blur-sm lg:top-[72px]">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2.5 md:px-8">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.path} className="flex items-center gap-1">
              {idx > 0 && (
                <div className="relative mx-1 h-0.5 w-6 sm:w-10">
                  <div className="absolute inset-0 rounded-full bg-border/50" />
                  <div
                    className="absolute inset-0 rounded-full bg-primary transition-spring"
                    style={{ maxWidth: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                  />
                </div>
              )}
              {isCompleted ? (
                <Link
                  to={step.path}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary transition-spring-fast hover:opacity-80"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span className="hidden sm:inline">{t(step.labelKey)}</span>
                </Link>
              ) : (
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    isCurrent
                      ? 'font-semibold text-primary'
                      : 'text-text-secondary/50'
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                        : 'bg-tab text-text-secondary/50'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="hidden sm:inline">{t(step.labelKey)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
