import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components';

export default function Footer() {
  const { t } = useTranslation('pages');

  return (
    <footer>
      <div className="sm:hidden mt-auto px-3 py-3 flex items-center justify-between gap-4">
        <Text variant="dim" size="xs" as="span">
          {t('footer.copyright')}
        </Text>
        <div className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="text-xs text-dim hover:text-default transition-colors duration-100 uppercase"
          >
            {t('footer.privacy')}
          </Link>
          <Link
            to="/terms"
            className="text-xs text-dim hover:text-default transition-colors duration-100 uppercase"
          >
            {t('footer.terms')}
          </Link>
        </div>
      </div>

      <div className="mt-auto px-6 py-3 hidden sm:flex items-center justify-between gap-4">
        <Text variant="dim" size="xs" as="span">
          {t('footer.copyright')}
        </Text>
        <div className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="text-xs text-dim hover:text-default transition-colors duration-100 uppercase md:tracking-widest"
          >
            {t('footer.privacy')}
          </Link>
          <span className="text-muted text-xs">·</span>
          <Link
            to="/terms"
            className="text-xs text-dim hover:text-default transition-colors duration-100 uppercase md:tracking-widest"
          >
            {t('footer.terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
