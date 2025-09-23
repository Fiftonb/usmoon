import { useRouter } from 'next/router';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Switch language"
                className="relative overflow-hidden group"
              >
                <div className="relative z-10 transition-all duration-300">
                  <Globe className="h-4 w-4 text-primary drop-shadow-sm" />
                </div>
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* 语言指示器 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300/10 to-green-300/10 opacity-100 transition-opacity duration-300"></div>
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center justify-between ${
                  locale === language.code ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-muted-foreground text-sm">({language.name})</span>
                </div>
                {locale === language.code && (
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>{currentLanguage?.nativeName || languages[0].nativeName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 