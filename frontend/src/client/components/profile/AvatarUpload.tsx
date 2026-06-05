import { useRef, useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../../../shared/api/profile';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useI18n } from '../../../shared/i18n/useI18n';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
}

export default function AvatarUpload({ currentAvatarUrl }: AvatarUploadProps) {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const displayUrl = previewUrl ?? currentAvatarUrl;

  const mutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (res) => {
      const url = res.data.avatar_url;
      setPreviewUrl(url);
      // Update auth context user without triggering full page re-render
      setUser((prev) => prev ? { ...prev, avatar: url, avatar_url: url } : prev);
      // Silently update profile cache so avatar persists on next visit
      queryClient.setQueryData(['profile'], (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: { ...old.data, avatar: url, avatar_url: url } };
      });
    },
    onError: () => {
      setErrorMsg(t('common.error'));
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Max 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(file);

    mutation.mutate(file);
  }, [mutation]);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative size-24 overflow-hidden rounded-full ring-2 ring-border transition-spring-fast hover:ring-primary"
        aria-label={t('profile.uploadAvatar')}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={t('profile.avatar')}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center bg-tab text-text-secondary">
            <Camera className="size-8" />
          </div>
        )}
        <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-spring-fast group-hover:opacity-100">
          <Camera className="size-6 text-white" />
        </div>
      </button>
      <span className="text-xs text-text-secondary">
        {mutation.isPending ? '...' : t('profile.uploadAvatar')}
      </span>
      {errorMsg && <span className="text-xs text-destructive">{errorMsg}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label={t('profile.uploadAvatar')}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
