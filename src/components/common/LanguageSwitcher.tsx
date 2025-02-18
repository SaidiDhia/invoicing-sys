import React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const router = useRouter();
  const { i18n, t } = useTranslation();

  const onToggleLanguageClick = (newLocale: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale }).then(() => {
      localStorage.setItem('locale', newLocale);
    });
  };

  return (
    <div className={cn(className)}>
      <Select value={i18n.language} onValueChange={(value) => onToggleLanguageClick(value)}>
        <SelectTrigger className="dark:bg-transparent">
          <SelectValue placeholder={t('languages.word')} />
        </SelectTrigger>
        <SelectContent className="dark:bg-transparent">
          <SelectItem value="fr">{t('languages.fr')}</SelectItem>
          <SelectItem value="en">{t('languages.en')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
