'use client';

import { useAppStore } from '../lib/store';
import { translate, type Language } from '../lib/i18n';

export function useI18n() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = (key: string) => translate(language, key);
  return { language, setLanguage, t };
}

export type { Language };
