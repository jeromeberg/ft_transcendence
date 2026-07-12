import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Btn, Container, PageLayout, Input, Alert, LanguageSwitcher } from '@/components';
import { updateSettings, type UpdateSettingsPayload } from '@/api/users.api';
import { tError } from '@/features/i18n';
import { useAuth } from '@/features/auth';

type FieldErrors = {
  email?: string;
  currentPassword?: string;
  password?: string;
  confirm?: string;
};

export default function Settings() {
  const { t } = useTranslation('pages');
  const { user, refreshUser } = useAuth();

  const isOAuthOnly = user?.isOAuthOnly ?? false;

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // set variant here for all containers on settings !!
  const containerVariant = 'terminal';

  function clearFeedback() {
    setErrors({});
    setGlobalError(null);
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    clearFeedback();

    const next: FieldErrors = {};

    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('settings.error_email_invalid');
    }

    if (password) {
      if (!isOAuthOnly && !currentPassword)
        next.currentPassword = t('common:errors.CURRENT_PASSWORD_REQUIRED');
      if (password.length < 8) next.password = t('settings.error_password_too_short');
      if (password !== confirm) next.confirm = t('settings.error_passwords_mismatch');
    }

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload: UpdateSettingsPayload = {};
    if (email) payload.email = email;
    if (password) {
      payload.currentPassword = currentPassword;
      payload.password = password;
    }
    if (!Object.keys(payload).length) return;

    setLoading(true);
    try {
      await updateSettings(payload);
      await refreshUser();

      setSuccess(true);
      setEmail('');
      setCurrentPassword('');
      setPassword('');
      setConfirm('');
    } catch (err) {
      setGlobalError(tError(err instanceof Error ? err.message : '', t));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout maxWidth="max-w-lg">
      <Heading level={3} className="mt-10 sm:mt-0 sm:text-2xl sm:tracking-[0.2em]">
        {t('settings.title')}
      </Heading>

      {isOAuthOnly && !user?.hasPassword && (
        <Alert variant="warning" className="mt-4">
          {t('settings.alert_set_password')}
        </Alert>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6 mt-5">
        <Container
          variant={containerVariant ?? 'default'}
          label={t('settings.change_email')}
          className="flex flex-col gap-3 mt-1"
        >
          <Input
            type="email"
            label={t('settings.email_label')}
            placeholder={user?.email ?? t('settings.email_placeholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFeedback();
            }}
            error={errors.email}
            disabled={isOAuthOnly || loading}
            autoComplete="off"
            readOnly={!isOAuthOnly}
            onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
          />
          {isOAuthOnly && (
            <p className="text-xs text-danger">{t('settings.email_managed_by_oauth')}</p>
          )}
        </Container>

        <Container
          variant={containerVariant ?? 'default'}
          label={isOAuthOnly ? t('settings.set_password') : t('settings.change_password')}
          className="flex flex-col gap-3 mt-1"
        >
          {!isOAuthOnly && (
            <Input
              type="password"
              label={t('settings.current_password_label')}
              placeholder={t('settings.current_password_placeholder')}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                clearFeedback();
              }}
              error={errors.currentPassword}
              disabled={loading}
              autoComplete="current-password"
            />
          )}
          <Input
            type="password"
            label={t('settings.new_password_label')}
            placeholder={t('settings.new_password_placeholder')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFeedback();
            }}
            error={errors.password}
            disabled={loading}
            autoComplete="new-password"
          />
          <Input
            type="password"
            label={t('settings.confirm_password_label')}
            placeholder={t('settings.confirm_password_placeholder')}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              clearFeedback();
            }}
            error={errors.confirm}
            disabled={loading}
            autoComplete="new-password"
          />
        </Container>

        <Container
          variant={containerVariant ?? 'default'}
          label={t('settings.change_language')}
          className="flex gap-3 mt-1"
        >
          <LanguageSwitcher variant="settings" />
        </Container>

        {globalError && <Alert variant="error">{globalError}</Alert>}
        {success && <Alert variant="success">{t('settings.saved')}</Alert>}

        <div className="flex justify-end">
          <Btn type="submit" size="md" variant="primary" disabled={loading}>
            {loading ? t('common:please_wait') : t('common:save')}
          </Btn>
        </div>
      </form>
    </PageLayout>
  );
}
