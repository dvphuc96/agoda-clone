import { useEffect, useReducer, useRef } from 'react';
import { ArrowRight, UserRound, LockKeyhole } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { profileApi } from '../../shared/api/profile';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useI18n } from '../../shared/i18n/useI18n';
import { useToast } from '../../shared/hooks/useToast';
import AvatarUpload from '../components/profile/AvatarUpload';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';

type Tab = 'info' | 'password';

type ProfileState = {
  tab: Tab;
  success: string;
  error: string;
  name: string;
  phone: string;
};

type ProfileAction =
  | { type: 'selectTab'; tab: Tab }
  | { type: 'setSuccess'; success: string }
  | { type: 'setError'; error: string }
  | { type: 'setName'; name: string }
  | { type: 'setPhone'; phone: string }
  | { type: 'setForm'; name: string; phone: string };

const initialProfileState: ProfileState = {
  tab: 'info',
  success: '',
  error: '',
  name: '',
  phone: '',
};

function profileReducer(
  state: ProfileState,
  action: ProfileAction,
): ProfileState {
  switch (action.type) {
    case 'selectTab':
      return { ...state, tab: action.tab, success: '', error: '' };
    case 'setSuccess':
      return { ...state, success: action.success };
    case 'setError':
      return { ...state, error: action.error };
    case 'setName':
      return { ...state, name: action.name };
    case 'setPhone':
      return { ...state, phone: action.phone };
    case 'setForm':
      return { ...state, name: action.name, phone: action.phone };
    default:
      return state;
  }
}

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading, setUser } = useAuth();
  const { t } = useI18n();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(
    profileReducer,
    initialProfileState,
  );
  const initializedRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const user = data;

  useEffect(() => {
    if (!user || initializedRef.current) return;

    dispatch({
      type: 'setForm',
      name: user.name,
      phone: user.phone ?? '',
    });
    initializedRef.current = true;
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () =>
      profileApi.update({
        name: state.name,
        phone: state.phone || null,
      }),
    onSuccess: (res) => {
      addToast('success', t('profile.saved'));
      dispatch({ type: 'setError', error: '' });
      setUser((prev) => (prev ? { ...prev, ...res.data.data } : prev));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      addToast('error', t('common.error'));
      dispatch({ type: 'setSuccess', success: '' });
    },
  });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-16">
        <div className="skeleton mb-6 h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-16">
        <div className="skeleton mb-6 h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof UserRound }[] = [
    { key: 'info', label: t('profile.personalInfo'), icon: UserRound },
    { key: 'password', label: t('profile.changePassword'), icon: LockKeyhole },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">
        {t('profile.title')}
      </h1>

      <div className="mb-6 flex gap-1 rounded-xl bg-tab p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => dispatch({ type: 'selectTab', tab: key })}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-spring-fast ${
              state.tab === key
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-secondary hover:text-text'
            }`}
            aria-pressed={state.tab === key}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {state.tab === 'info' && (
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_24px_70px_rgba(16,32,29,.08)]">
          <div className="mb-6 flex justify-center">
            <AvatarUpload currentAvatarUrl={user.avatar_url ?? null} />
          </div>

          {state.success && (
            <output
              aria-live="polite"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              {state.success}
            </output>
          )}
          {state.error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            >
              {state.error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-semibold text-text"
              >
                {t('profile.name')}
              </label>
              <input
                id="profile-name"
                type="text"
                value={state.name}
                onChange={(e) =>
                  dispatch({ type: 'setName', name: e.target.value })
                }
                required
                maxLength={255}
                autoComplete="name"
                placeholder={t('auth.namePlaceholder')}
                className="w-full rounded-xl border border-border bg-warm-surface px-4 py-3 text-sm text-text outline-none transition-spring-fast placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-semibold text-text"
              >
                {t('profile.email')}
              </label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-border bg-tab px-4 py-3 text-sm text-text-secondary outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-phone"
                className="mb-2 block text-sm font-semibold text-text"
              >
                {t('profile.phone')}
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={state.phone}
                onChange={(e) =>
                  dispatch({ type: 'setPhone', phone: e.target.value })
                }
                maxLength={30}
                autoComplete="tel"
                placeholder={t('auth.phonePlaceholder')}
                className="w-full rounded-xl border border-border bg-warm-surface px-4 py-3 text-sm text-text outline-none transition-spring-fast placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isPending
                ? t('common.loading')
                : t('profile.save')}
              {!updateMutation.isPending && (
                <ArrowRight className="size-4" aria-hidden="true" />
              )}
            </button>
          </form>
        </div>
      )}

      {state.tab === 'password' && (
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_24px_70px_rgba(16,32,29,.08)]">
          <PasswordChangeForm />
        </div>
      )}
    </div>
  );
}
