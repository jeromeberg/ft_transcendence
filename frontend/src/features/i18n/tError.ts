import type { TFunction } from 'i18next';

export function tError(message: unknown, t: TFunction): string {
  if (typeof message !== 'string' || !message) return String(message ?? '');
  const key = `common:errors.${message}`;
  const translated = t(key, { defaultValue: '' });
  return translated || message;
}
