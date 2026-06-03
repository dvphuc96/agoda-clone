import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { profileApi } from '../../../shared/api/profile';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useI18n } from '../../../shared/i18n/useI18n';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
}

export default function AvatarUpload({ currentAvatarUrl }: AvatarUploadProps) {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (res) => {
      setPreview(res.data.avatar_url);
      setUser((prev) =>
        prev ? { ...prev, avatar: res.data.avatar_url } : prev,
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    mutation.mutate(file);
  };

  const displayUrl = preview || currentAvatarUrl;

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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
