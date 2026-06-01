import { useState } from 'react';
import { ArrowRight, UserRoundPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useI18n } from '../../shared/i18n/useI18n';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation, phone: phone || undefined });
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = 'w-full rounded-xl border border-border bg-warm-surface px-4 py-3 text-sm text-text outline-none transition-spring-fast placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15';

  return (
    <div className="min-h-[calc(100dvh-200px)] bg-bg px-4 py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_24px_70px_rgba(16,32,29,.12)] md:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRoundPlus className="size-5" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-text tracking-tight">{t('auth.registerTitle')}</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{t('auth.registerSubtitle')}</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-text">{t('auth.name')}</label>
              <input id="register-name" type="text" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" placeholder={t('auth.namePlaceholder')} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-text">{t('auth.email')}</label>
              <input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder={t('auth.emailPlaceholder')} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="register-phone" className="mb-2 block text-sm font-semibold text-text">{t('auth.phone')}</label>
              <input id="register-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder={t('auth.phonePlaceholder')} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-text">{t('auth.password')}</label>
              <input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" aria-describedby="register-password-hint" placeholder={t('auth.passwordPlaceholder')} className={inputClasses} />
              <p id="register-password-hint" className="mt-2 text-xs leading-5 text-text-secondary">
                {t('auth.passwordHint')}
              </p>
            </div>
            <div>
              <label htmlFor="register-password-confirmation" className="mb-2 block text-sm font-semibold text-text">{t('auth.confirmPassword')}</label>
              <input id="register-password-confirmation" type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required autoComplete="new-password" placeholder={t('auth.confirmPasswordPlaceholder')} className={inputClasses} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t('auth.registerLoading') : t('auth.registerAction')}
              {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-text-secondary">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-semibold text-primary transition-spring-fast hover:underline">{t('auth.loginInstead')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
