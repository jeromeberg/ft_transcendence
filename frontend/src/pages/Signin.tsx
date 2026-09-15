import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tError } from '@/features/i18n';
import { AuthForm, Btn, PageLayout } from '@/components';
import { useAuth } from '@/features/auth';

export default function Signin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit({ identifier, password }: { identifier?: string; password: string }) {
    if (!identifier) return;
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/profile');
    } catch (e) {
      setError(e instanceof Error ? tError(e.message, t) : t('errors.login_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout maxWidth="max-w-sm" centerY>
      <AuthForm mode="login" error={error} loading={loading} onSubmit={handleSubmit} />
      <Btn
        as="a"
        href="/api/auth/42"
        size="md"
        className="block w-full mt-9 text-center !bg-[#00babc] !text-white !border-[#00babc] hover:!opacity-90"
      >
        {t('login_with_42')}
      </Btn>
    </PageLayout>
  );
}
