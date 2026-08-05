'use client';

import { useI18n } from '@/hooks/use-i18n';
import { languageNames, type Language } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = Object.keys(languageNames) as Language[];

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
      <SelectTrigger
        className="h-8 w-auto gap-1.5 border-none bg-transparent px-2 text-sm hover:bg-muted/50 focus:ring-0"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {languageNames[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
