import { useState } from 'react';
import { ArrowRight, UserRoundPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useI18n } from '../../shared/i18n/useI18n';
import { useToast } from '../../shared/components/Toast';
import { validateEmail, validatePhone, validatePassword } from '../../shared/utils/validation';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleBlur = (field: string, value: string) => {
    let msg: string | null = null;
    if (field === 'email') msg = validateEmail(value);
    else if (field === 'phone') msg = validatePhone(value);
    else if (field === 'password') msg = validatePassword(value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = t(msg as any);
      else delete next[field];
      return next;
    });
  };

  const getInputClasses = (field: string) =>
    `w-full rounded-xl border bg-warm-surface px-4 py-3 text-sm text-text outline-none transition-spring-fast placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 ${
      fieldErrors[field] ? 'border-destructive ring-2 ring-destructive/15' : 'border-border'
    }`;

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
      addToast('success', t('auth.registerSuccess'));
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

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
              <input id="register-name" type="text" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" placeholder={t('auth.namePlaceholder')} className={getInputClasses('name')} />
            </div>
            <div>
              <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-text">{t('auth.email')}</label>
              <input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => handleBlur('email', email)} required autoComplete="email" placeholder={t('auth.emailPlaceholder')} className={getInputClasses('email')} />
              {fieldErrors.email && <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="register-phone" className="mb-2 block text-sm font-semibold text-text">{t('auth.phone')}</label>
              <input id="register-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => handleBlur('phone', phone)} autoComplete="tel" placeholder={t('auth.phonePlaceholder')} className={getInputClasses('phone')} />
              {fieldErrors.phone && <p className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-text">{t('auth.password')}</label>
              <input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)} onBlur={() => handleBlur('password', password)} required autoComplete="new-password" aria-describedby="register-password-hint" placeholder={t('auth.passwordPlaceholder')} className={getInputClasses('password')} />
              {fieldErrors.password && <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>}
              <p id="register-password-hint" className="mt-2 text-xs leading-5 text-text-secondary">
                {t('auth.passwordHint')}
              </p>
            </div>
            <div>
              <label htmlFor="register-password-confirmation" className="mb-2 block text-sm font-semibold text-text">{t('auth.confirmPassword')}</label>
              <input id="register-password-confirmation" type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required autoComplete="new-password" placeholder={t('auth.confirmPasswordPlaceholder')} className={getInputClasses('passwordConfirmation')} />
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
