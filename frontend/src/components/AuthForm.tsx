import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input, Btn, Label, Alert, Heading, Text } from '.';

interface AuthFormProps {
  mode?: 'login' | 'register';
  error?: string;
  loading?: boolean;
  onSubmit?: (data: { username?: string; identifier?: string; password: string }) => void;
}

export function AuthForm({ mode = 'login', error, loading = false, onSubmit }: AuthFormProps) {
  const { t } = useTranslation('auth');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const displayError = localError || error;

  const handleSubmit: React.ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault();
    setLocalError('');

    if (mode === 'register' && !username.trim()) {
      setLocalError(t('validation.username_required'));
      return;
    }

    if (mode === 'register' && username.includes('@')) {
      setLocalError(t('validation.username_no_at'));
      return;
    }

    if (mode === 'login' && !identifier.trim()) {
      setLocalError(t('validation.identifier_required'));
      return;
    }

    if (password.length < 8) {
      setLocalError(t('validation.password_min'));
      return;
    }

    onSubmit?.(mode === 'login' ? { identifier, password } : { username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Heading level={2}>{mode === 'login' ? t('sign_in') : t('create_account')}</Heading>

      {displayError && <Alert variant="error">{displayError}</Alert>}

      {mode === 'register' && (
        <div>
          <Label htmlFor="username">{t('username')}</Label>
          <Input
            id="username"
            type="text"
            placeholder={t('placeholders.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2"
          />
        </div>
      )}

      {mode === 'login' && (
        <div>
          <Label htmlFor="identifier">{t('email_or_username')}</Label>
          <Input
            id="identifier"
            type="text"
            placeholder={t('placeholders.email_or_username')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="mt-2"
          />
        </div>
      )}

      <div>
        <Label htmlFor="password">{t('password')}</Label>
        <Input
          id="password"
          type="password"
          placeholder="*******"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2"
        />
      </div>

      <Btn type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? t('common:please_wait') : mode === 'login' ? t('sign_in') : t('create_account')}
      </Btn>

      <Text variant="dim" className="text-center text-base">
        {mode === 'login' ? (
          <>
            {t('no_account')}{' '}
            <Link to="/register" className="text-default hover:underline">
              {t('register_link')}
            </Link>
          </>
        ) : (
          <>
            {t('have_account')}{' '}
            <Link to="/signin" className="text-default hover:underline">
              {t('sign_in_link')}
            </Link>
          </>
        )}
      </Text>
    </form>
  );
}
