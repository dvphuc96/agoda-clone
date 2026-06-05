import { useReducer } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../../../shared/api/profile';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useToast } from '../../../shared/hooks/useToast';
import { useI18n } from '../../../shared/i18n/useI18n';

type PasswordState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrent: boolean;
  showNew: boolean;
  error: string;
};

type PasswordAction =
  | { type: 'setCurrentPassword'; value: string }
  | { type: 'setNewPassword'; value: string }
  | { type: 'setConfirmPassword'; value: string }
  | { type: 'toggleCurrentVisibility' }
  | { type: 'toggleNewVisibility' }
  | { type: 'setError'; error: string }
  | { type: 'clearError' };

const initialPasswordState: PasswordState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  showCurrent: false,
  showNew: false,
  error: '',
};

function passwordReducer(
  state: PasswordState,
  action: PasswordAction,
): PasswordState {
  switch (action.type) {
    case 'setCurrentPassword':
      return { ...state, currentPassword: action.value };
    case 'setNewPassword':
      return { ...state, newPassword: action.value };
    case 'setConfirmPassword':
      return { ...state, confirmPassword: action.value };
    case 'toggleCurrentVisibility':
      return { ...state, showCurrent: !state.showCurrent };
    case 'toggleNewVisibility':
      return { ...state, showNew: !state.showNew };
    case 'setError':
      return { ...state, error: action.error };
    case 'clearError':
      return { ...state, error: '' };
    default:
      return state;
  }
}

export default function PasswordChangeForm() {
  const { t } = useI18n();
  const { logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(
    passwordReducer,
    initialPasswordState,
  );

  const mutation = useMutation({
    mutationFn: () =>
      profileApi.changePassword({
        current_password: state.currentPassword,
        password: state.newPassword,
        password_confirmation: state.confirmPassword,
      }),
    onSuccess: async () => {
      success(t('profile.passwordChanged'));

      try {
        await queryClient.invalidateQueries({ queryKey: ['profile'] });
        await logout();
      } finally {
        navigate('/login', { replace: true });
      }
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      dispatch({
        type: 'setError',
        error: error.response?.data?.message || t('profile.wrongPassword'),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'clearError' });
    mutation.mutate();
  };

  const inputClass =
    'w-full rounded-xl border border-border bg-warm-surface px-4 py-3 pr-10 text-sm text-text outline-none transition-spring-fast placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
        >
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="current-password" className="mb-2 block text-sm font-semibold text-text">
          {t('profile.currentPassword')}
        </label>
        <div className="relative">
          <input
            id="current-password"
            type={state.showCurrent ? 'text' : 'password'}
            value={state.currentPassword}
            onChange={(e) =>
              dispatch({
                type: 'setCurrentPassword',
                value: e.target.value,
              })
            }
            required
            autoComplete="current-password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => dispatch({ type: 'toggleCurrentVisibility' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-label={state.showCurrent ? 'Hide password' : 'Show password'}
          >
            {state.showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-text">
          {t('profile.newPassword')}
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={state.showNew ? 'text' : 'password'}
            value={state.newPassword}
            onChange={(e) =>
              dispatch({
                type: 'setNewPassword',
                value: e.target.value,
              })
            }
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => dispatch({ type: 'toggleNewVisibility' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-label={state.showNew ? 'Hide password' : 'Show password'}
          >
            {state.showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-semibold text-text">
          {t('profile.confirmPassword')}
        </label>
        <input
          id="confirm-new-password"
          type="password"
          value={state.confirmPassword}
          onChange={(e) =>
            dispatch({
              type: 'setConfirmPassword',
              value: e.target.value,
            })
          }
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl border border-border bg-warm-surface px-4 py-3 text-sm text-text outline-none transition-spring-fast placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? t('common.loading') : t('profile.changePassword')}
        {!mutation.isPending && <ArrowRight className="size-4" aria-hidden="true" />}
      </button>
    </form>
  );
}
