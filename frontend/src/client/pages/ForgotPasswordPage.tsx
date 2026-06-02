import { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../shared/i18n/useI18n';
import { authApi } from '../../shared/api/auth';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-200px)] bg-bg px-4 py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_24px_70px_rgba(16,32,29,.12)] md:p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-text tracking-tight">{t('forgotPassword.sent')}</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{t('forgotPassword.checkEmail')}</p>
              <div className="mt-7 text-center text-sm text-text-secondary">
                <Link to="/login" className="font-semibold text-primary transition-spring-fast hover:underline">
                  {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-5" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-bold text-text tracking-tight">{t('forgotPassword.title')}</h1>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{t('forgotPassword.subtitle')}</p>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-5 break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="mb-2 block text-sm font-semibold text-text">
                    {t('forgotPassword.email')}
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full rounded-xl border border-border bg-warm-surface px-4 py-3 text-sm text-text outline-none transition-spring-fast placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? t('forgotPassword.sending') : t('forgotPassword.sendLink')}
                  {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
                </button>
              </form>

              <div className="mt-7 text-center text-sm text-text-secondary">
                <Link to="/login" className="font-semibold text-primary transition-spring-fast hover:underline">
                  {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
