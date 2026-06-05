import { useReducer } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useI18n } from '../../shared/i18n/useI18n';
import { useToast } from '../../shared/hooks/useToast';
import { validateEmail, validatePassword } from '../../shared/utils/validation';

const ADMIN_EMAIL = 'admin@gostay.local';

function isAdminLogin(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

function validateLoginPassword(email: string, value: string) {
  if (isAdminLogin(email)) return null;
  return validatePassword(value);
}

type LoginState = {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  fieldErrors: Record<string, string>;
};

type LoginAction =
  | { type: 'setEmail'; email: string; passwordError?: string | null }
  | { type: 'setPassword'; password: string }
  | { type: 'setError'; error: string }
  | { type: 'setLoading'; loading: boolean }
  | { type: 'setFieldError'; field: string; message: string | null };

const initialLoginState: LoginState = {
  email: '',
  password: '',
  error: '',
  loading: false,
  fieldErrors: {},
};

function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case 'setEmail': {
      const fieldErrors = { ...state.fieldErrors };
      if (action.passwordError) fieldErrors.password = action.passwordError;
      else delete fieldErrors.password;
      return { ...state, email: action.email, fieldErrors };
    }
    case 'setPassword':
      return { ...state, password: action.password };
    case 'setError':
      return { ...state, error: action.error };
    case 'setLoading':
      return { ...state, loading: action.loading };
    case 'setFieldError': {
      const fieldErrors = { ...state.fieldErrors };
      if (action.message) fieldErrors[action.field] = action.message;
      else delete fieldErrors[action.field];
      return { ...state, fieldErrors };
    }
    default:
      return state;
  }
}

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'setError', error: '' });
    dispatch({ type: 'setLoading', loading: true });
    try {
      await login(state.email, state.password);
      addToast('success', t('auth.loginSuccess'));
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      dispatch({
        type: 'setError',
        error: error.response?.data?.message || t('auth.loginError'),
      });
    } finally {
      dispatch({ type: 'setLoading', loading: false });
    }
  };

  const handleBlur = (field: string, value: string) => {
    let msg: string | null = null;
    if (field === 'email') msg = validateEmail(value);
    if (field === 'password') {
      msg = validateLoginPassword(state.email, value);
    }

    dispatch({
      type: 'setFieldError',
      field,
      message: msg ? t(msg as any) : null,
    });
  };

  const handleEmailChange = (value: string) => {
    let passwordError: string | null = null;

    if (state.password) {
      const msg = validateLoginPassword(value, state.password);
      passwordError = msg ? t(msg as any) : null;
    }

    dispatch({ type: 'setEmail', email: value, passwordError });
  };

  const inputClasses = (field: string) =>
    `w-full rounded-xl border bg-warm-surface px-4 py-3 text-sm text-text outline-none transition-spring-fast placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 ${
      state.fieldErrors[field] ? 'border-destructive ring-2 ring-destructive/15' : 'border-border'
    }`;

  return (
    <div className="min-h-[calc(100dvh-200px)] bg-bg px-4 py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_24px_70px_rgba(16,32,29,.12)] md:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-text tracking-tight">{t('auth.loginTitle')}</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{t('auth.loginSubtitle')}</p>
          </div>

          {state.error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            >
              {state.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-text">{t('auth.email')}</label>
              <input
                id="login-email"
                type="email"
                value={state.email}
                onChange={e => handleEmailChange(e.target.value)}
                onBlur={() => handleBlur('email', state.email)}
                required
                autoComplete="email"
                placeholder={t('auth.emailPlaceholder')}
                className={inputClasses('email')}
              />
              {state.fieldErrors.email && (
                <p className="mt-1 text-xs text-destructive">{state.fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-text">{t('auth.password')}</label>
              <input
                id="login-password"
                type="password"
                value={state.password}
                onChange={e =>
                  dispatch({ type: 'setPassword', password: e.target.value })
                }
                onBlur={() => handleBlur('password', state.password)}
                required
                autoComplete="current-password"
                placeholder={t('auth.passwordPlaceholder')}
                className={inputClasses('password')}
              />
              {state.fieldErrors.password && (
                <p className="mt-1 text-xs text-destructive">{state.fieldErrors.password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={state.loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state.loading ? t('auth.loginLoading') : t('auth.loginAction')}
              {!state.loading && <ArrowRight className="size-4" aria-hidden="true" />}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-text-secondary">{t('auth.orContinueWith')}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { window.location.href = '/api/auth/social/google/redirect'; }}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-text transition-spring-fast hover:bg-warm-surface active:scale-[0.97]"
            >
              <svg className="size-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t('auth.continueWithGoogle')}
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/api/auth/social/facebook/redirect'; }}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition-spring-fast hover:bg-[#166FE5] active:scale-[0.97]"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              {t('auth.continueWithFacebook')}
            </button>
          </div>

          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-text-secondary transition-spring-fast hover:text-primary hover:underline">
              {t('forgotPassword.forgotPassword')}
            </Link>
          </div>

          <div className="mt-5 text-center text-sm text-text-secondary">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-primary transition-spring-fast hover:underline">{t('auth.createAccount')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
