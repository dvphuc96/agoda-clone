import { Shield, Star, Headset, CreditCard } from 'lucide-react';
import { useI18n } from '../../../shared/i18n/useI18n';

const reasons = [
  { icon: Shield, color: 'text-success', bg: 'bg-success/5', titleKey: 'home.whyFreeCancel' as const, descKey: 'home.whyFreeCancelDesc' as const },
  { icon: Star, color: 'text-gold-light', bg: 'bg-gold-light/5', titleKey: 'home.whyBestPrice' as const, descKey: 'home.whyBestPriceDesc' as const },
  { icon: Headset, color: 'text-primary', bg: 'bg-primary/5', titleKey: 'home.whySupport247' as const, descKey: 'home.whySupport247Desc' as const },
  { icon: CreditCard, color: 'text-navy', bg: 'bg-navy/5', titleKey: 'home.whySecurePayment' as const, descKey: 'home.whySecurePaymentDesc' as const },
];

export default function WhyChooseUs() {
  const { t } = useI18n();

  return (
    <section className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16 text-center md:mb-20">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('home.whyTitle')}</span>
            <div className="h-px w-16 bg-primary" />
          </div>
          <p className="max-w-lg mx-auto text-lg leading-relaxed text-text-secondary">
            {t('home.whySubtitle')}
          </p>
        </div>

        {/* Double-Bezel cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, color, bg, titleKey, descKey }, idx) => (
            <div
              key={titleKey}
              className="reveal group"
              data-delay={idx * 100}
            >
              {/* Outer Shell */}
              <div className="relative h-full bg-shadow/5 p-1.5 rounded-[1.75rem] ring-1 ring-black/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_16px_48px_rgba(16,32,29,.1)] hover:-translate-y-1">
                {/* Inner Core */}
                <div className="h-full overflow-hidden rounded-[calc(1.75rem-6px)] bg-white p-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-surface">
                  {/* Icon Circle */}
                  <div className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${bg} transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110`}>
                    <Icon className={`size-7 ${color}`} />
                  </div>

                  {/* Content */}
                  <div className="mt-6 text-center">
                    <h3 className="text-base font-bold text-navy md:text-lg">
                      {t(titleKey)}
                    </h3>
                    <p className="mt-2.5 text-sm leading-[1.6] text-text-secondary md:text-base">
                      {t(descKey)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}