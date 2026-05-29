import { useI18n } from '../../../shared/i18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-white/10 bg-footer px-4 py-10 text-sm text-[#c8c0b3] md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 text-xl font-semibold tracking-tight text-white">
            Go<span className="text-gold-light">Stay</span>
          </div>
          <p className="max-w-md leading-6">{t('footer.tagline')}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em] text-[#9b9387]">
          <span>{t('footer.company')}</span>
          <span>{t('footer.support')}</span>
          <span>{t('footer.terms')}</span>
          <span>{t('footer.privacy')}</span>
        </div>
      </div>
    </footer>
  );
}
