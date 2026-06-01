import { Mail, Phone, Shield } from 'lucide-react';
import { useI18n } from '../../../shared/i18n/useI18n';

const currentYear = new Date().getFullYear();

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-white/10 bg-footer px-4 py-20 text-sm text-footer-text md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Row 1: Brand + Links */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 text-xl font-semibold tracking-tight text-white">
              Go<span className="text-gold-light">Stay</span>
            </div>
            <p className="max-w-md leading-6">{t('footer.tagline')}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.14em] text-footer-muted">
            <button type="button" className="transition-spring-fast hover:text-white">{t('footer.company')}</button>
            <button type="button" className="transition-spring-fast hover:text-white">{t('footer.support')}</button>
            <button type="button" className="transition-spring-fast hover:text-white">{t('footer.terms')}</button>
            <button type="button" className="transition-spring-fast hover:text-white">{t('footer.privacy')}</button>
          </div>
        </div>

        {/* Row 2: Payment trust + Contact */}
        <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-2 md:items-start">
          {/* Payment trust */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              <Shield className="size-3.5 text-success" />
              {t('footer.payment')}
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white">
                VNPAY
              </span>
              <span className="inline-flex items-center rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white">
                MoMo
              </span>
            </div>
            <p className="mt-3 text-xs text-footer-muted">{t('footer.paymentTrust')}</p>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              {t('footer.contact')}
            </div>
            <div className="space-y-2 text-sm text-footer-muted">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5" />
                <span>{t('footer.email')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5" />
                <span>{t('footer.hotline')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Copyright */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-[10px] uppercase tracking-[0.2em] text-footer-dim">
          {t('footer.companyInfo')} &middot; GoStay &copy; {currentYear}
        </div>
      </div>
    </footer>
  );
}
