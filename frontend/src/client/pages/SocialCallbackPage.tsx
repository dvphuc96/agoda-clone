import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../shared/i18n/useI18n';
import { useAuth } from '../../shared/contexts/AuthContext';
import { authApi } from '../../shared/api/auth';
import { Loader2 } from 'lucide-react';

export default function SocialCallbackPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      const timer = setTimeout(() => {
        navigate('/login', {
          state: { error: t('auth.socialCallbackFailed') },
        });
      }, 2000);
      return () => clearTimeout(timer);
    }

    localStorage.setItem('auth_token', token);

    let cancelled = false;
    authApi.me()
      .then((res) => {
        if (cancelled) return;
        localStorage.setItem('auth_user:v1', JSON.stringify(res.data));
        setUser(res.data);
        navigate('/', { replace: true });
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user:v1');
        navigate('/login', {
          state: { error: t('auth.socialCallbackFailed') },
        });
      });

    return () => { cancelled = true; };
  }, [searchParams, navigate, t, setUser]);

  return (
    <div className="flex min-h-[calc(100dvh-200px)] items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" />
        <h1 className="text-lg font-bold text-text">{t('auth.socialCallbackTitle')}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t('auth.socialCallbackBody')}</p>
      </div>
    </div>
  );
}
