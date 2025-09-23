import { useRouter } from 'next/router';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const { t, locale } = useTranslation();

  const handleLanguageChange = (newLocale: string) => {
    const { pathname, asPath, query } = router;
    
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    
    // Change locale
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] gap-2 border-primary/20 hover:border-primary/40 transition-colors">
        <Globe className="h-4 w-4 text-primary" />
        <SelectValue>
          {currentLanguage?.nativeName || languages[0].nativeName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-muted-foreground text-sm">({language.name})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 