import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { tError } from '@/features/i18n';
import { TextArea, Btn, Container, Text } from '@/components';
import { updateMyBio } from '@/api/users.api';
import type { ContainerVariant } from '@/components/Container';

interface BioProps {
  bio: string | null;
  isOwnProfile: boolean;
  onBioChange: (bio: string) => void;
  containerVariant?: ContainerVariant | null;
}

export default function Bio({ bio, isOwnProfile, onBioChange, containerVariant }: BioProps) {
  const { t } = useTranslation('pages');
  const [bioDraft, setBioDraft] = useState(bio ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBioDraft(bio ?? '');
    setIsEditing(false);
    setError(null);
  }, [bio]);

  function handleSave() {
    if (saving) return;
    setError(null);
    setSaving(true);
    updateMyBio(bioDraft)
      .then((result) => {
        onBioChange(result.bio ?? '');
        setIsEditing(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? tError(err.message, t) : t('profile.bio_error'));
      })
      .finally(() => setSaving(false));
  }

  return (
    <Container variant={containerVariant ?? 'default'} label={t('profile.bio_label')}>
      {isOwnProfile ? (
        isEditing ? (
          <div className="flex flex-col gap-3">
            <TextArea
              value={bioDraft}
              onChange={(event) => setBioDraft(event.target.value)}
              placeholder={t('profile.bio_placeholder')}
              rows={5}
              maxLength={200}
            />
            {error && (
              <Text variant="error" size="xs">
                {error}
              </Text>
            )}
            <div className="flex justify-end gap-2">
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBioDraft(bio ?? '');
                  setError(null);
                  setIsEditing(false);
                }}
              >
                {t('common:cancel')}
              </Btn>
              <Btn
                size="sm"
                variant="primary"
                onClick={handleSave}
                disabled={saving || bioDraft === (bio ?? '')}
              >
                {t('profile.bio_save')}
              </Btn>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Text>{bio ?? t('profile.bio_default')}</Text>
            <div className="flex justify-end">
              <Btn size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                {t('profile.bio_edit')}
              </Btn>
            </div>
          </div>
        )
      ) : (
        <Text>{bio ?? t('profile.bio_default')}</Text>
      )}
    </Container>
  );
}
