import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken } from '@/features/auth/AuthContext';
import type { Lang } from '@/features/i18n';
import { SUPPORTED } from '@/features/i18n';

const FLAG: Record<Lang, string> = { en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸' };
const NATIVE: Record<Lang, string> = { en: 'English', fr: 'Français', es: 'Español' };

async function patchLanguage(lang: Lang) {
  const token = getToken();
  if (!token) return;
  await fetch('/api/users/me/settings', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ language: lang.toUpperCase() }),
  });
}

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'settings';
}

export function LanguageSwitcher({ variant = 'navbar' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = (SUPPORTED.includes(i18n.language as Lang) ? i18n.language : 'en') as Lang;

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  async function handleSelect(lang: Lang) {
    setIsOpen(false);
    if (lang === current) return;
    await i18n.changeLanguage(lang);
    await patchLanguage(lang);
  }

  const isSettings = variant === 'settings';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={[
          'flex items-center gap-1 px-3 py-1 text-xs uppercase tracking-widest transition-colors duration-100',
          isSettings
            ? 'text-dim bg-black border border-dim hover:text-default hover:border-default'
            : 'text-dim hover:text-default hover:bg-muted',
        ].join(' ')}
      >
        {FLAG[current]} {isSettings ? NATIVE[current] : ''}
      </button>

      {isOpen && (
        <ul
          className={`absolute top-full mt-1 ${isSettings ? 'min-w-[9rem] left-0' : 'min-w-[5rem] right-0'} bg-black border border-dim z-50`}
        >
          {SUPPORTED.map((lang) => (
            <li key={lang}>
              <button
                type="button"
                onClick={() => handleSelect(lang)}
                className={[
                  'w-full text-left px-3 py-1 text-xs uppercase tracking-widest transition-colors duration-100',
                  lang === current
                    ? 'text-default bg-black cursor-default'
                    : 'text-dim hover:text-default hover:bg-black',
                ].join(' ')}
              >
                {FLAG[lang]} {isSettings ? NATIVE[lang] : lang.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
