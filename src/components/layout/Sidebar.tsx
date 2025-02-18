import React from 'react';
import Link from 'next/link';
import logoDark from 'src/assets/logo-light.png';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { IMenuItem } from '@/components/layout/interfaces/MenuItem.interface';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { Label } from '../ui/label';
import packageJson from 'package.json';
import { LanguageSwitcher } from '../common';

interface SidebarProps {
  menuItems: IMenuItem[];
}

export const Sidebar = ({ menuItems }: SidebarProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { theme } = useTheme();

  const activeItem = menuItems.find((item) => router.asPath.includes(item.code));

  return (
    <div className="hidden border-r bg-muted/40 md:block w-1/4 lg:w-1/5 xl:w-2/12 bg-slate-900 dark:bg-gray-950">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <div className="flex items-center mx-auto gap-2 font-semibold cursor-pointer">
            <Image
              src={theme == 'light' ? logoDark : logoDark}
              alt="logo"
              className="w-32 cursor-pointer"
              onClick={() => router.push('/dashboard')}
            />
          </div>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-1 text-sm lg:px-3">
            <Accordion type="single" collapsible defaultValue={activeItem?.id?.toString()}>
              {menuItems.map((item) => (
                <AccordionItem
                  key={item.code}
                  value={item.id?.toString() || ''}
                  className="border-0">
                  <AccordionTrigger
                    className={cn(
                      'gap-2 rounded-lg px-3 -py-2 text-white',
                      item.code.includes(router.pathname)
                        ? 'text-muted-foreground text-primary bg-gray-100 dark font-semibold'
                        : 'bg-muted hover:font-semibold'
                    )}>
                    <div className="flex items-center gap-3 rounded-lg py-2">
                      {item.icon}
                      {t(`menu.${item.code}`)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="-mb-4">
                    {item.subMenu &&
                      item.subMenu.map((subItem: IMenuItem) => (
                        <Link
                          key={subItem.code}
                          href={subItem.href || '#'}
                          className={cn(
                            'flex items-center gap-2 rounded-lg pl-6 py-2 transition-all hover:bg-gray-100 hover:dark:bg-slate-700 text-white',
                            subItem.href === router.asPath
                              ? 'text-muted-foreground text-primary bg-gray-100 dark:bg-slate-800 font-semibold'
                              : 'bg-muted hover:font-semibold hover:text-slate-950 dark:hover:text-slate-200'
                          )}>
                          {subItem.icon}
                          <span className="font-medium">{t(`submenu.${subItem.code}`)}</span>
                        </Link>
                      ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </nav>
        </div>
        <div className="mr-auto">
          <LanguageSwitcher />
        </div>
        {/* app version */}
        <div className="mx-2 text-white">
          <Label>v{packageJson.version}</Label>
        </div>
      </div>
    </div>
  );
};