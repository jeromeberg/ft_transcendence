import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tError } from '@/features/i18n';
import { AuthForm, PageLayout } from '@/components';
import { useAuth } from '@/features/auth';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit({
    username,
    email,
    password,
  }: {
    username?: string;
    email?: string;
    password: string;
  }) {
    if (!username || !email) return;
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/profile');
    } catch (e) {
      setError(e instanceof Error ? tError(e.message, t) : t('errors.register_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout maxWidth="max-w-sm" centerY>
      <AuthForm mode="register" error={error} loading={loading} onSubmit={handleSubmit} />
    </PageLayout>
  );
}
