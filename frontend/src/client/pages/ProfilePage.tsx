import { useState } from 'react';
import { ArrowRight, UserRound, LockKeyhole } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { profileApi } from '../../shared/api/profile';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useI18n } from '../../shared/i18n/useI18n';
import AvatarUpload from '../components/profile/AvatarUpload';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';

type Tab = 'info' | 'password';

export default function ProfilePage() {
  const { isAuthenticated, setUser } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('info');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [initialized, setInitialized] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const user = data;

  if (user && !initialized) {
    setName(user.name);
    setPhone(user.phone ?? '');
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: () => profileApi.update({ name, phone: phone || null }),
    onSuccess: (res) => {
      setSuccess(t('profile.saved'));
      setError('');
      setUser((prev) => (prev ? { ...prev, ...res.data.data } : prev));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      setError(t('common.error'));
      setSuccess('');
    },
  });

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
            onClick={() => {
              setTab(key);
              setSuccess('');
              setError('');
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-spring-fast ${
              tab === key
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-secondary hover:text-text'
            }`}
            aria-pressed={tab === key}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_24px_70px_rgba(16,32,29,.08)]">
          <div className="mb-6 flex justify-center">
            <AvatarUpload currentAvatarUrl={user.avatar_url ?? null} />
          </div>

          {success && (
            <div
              role="status"
              aria-live="polite"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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

      {tab === 'password' && (
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_24px_70px_rgba(16,32,29,.08)]">
          <PasswordChangeForm />
        </div>
      )}
    </div>
  );
}
