import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Text } from '@/components';
import { tError } from '@/features/i18n';
import { uploadAvatar } from '@/api/users.api';

interface AvatarUploadProps {
  username: string;
  src?: string | null;
  onAvatarChange: (url: string) => void;
}

export default function AvatarUpload({ username, src, onAvatarChange }: AvatarUploadProps) {
  const { t } = useTranslation('pages');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;
    setError(null);
    setUploading(true);
    uploadAvatar(file)
      .then(({ avatarUrl }) => onAvatarChange(avatarUrl))
      .catch((err: unknown) => {
        setError(err instanceof Error ? tError(err.message, t) : t('profile.avatar_upload_error'));
      })
      .finally(() => {
        setUploading(false);
        e.target.value = '';
      });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative group shrink-0 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <Avatar username={username} src={src} size="xl" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div
          className="absolute bottom-0 right-0 w-7 h-7
                        bg-black border border-default
                        flex items-center justify-center
                        transition-colors duration-100
                        group-hover:bg-muted"
        >
          {uploading ? (
            <span className="text-default text-xs animate-pulse">…</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-default"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <Text variant="error" size="xs">
          {error}
        </Text>
      )}
    </div>
  );
}
