import React from 'react';
import { IMenuItem } from './interfaces/MenuItem.interface';
import { useRouter } from 'next/router';
import { BreadcrumbCommon } from '../common';
import { cn } from '@/lib/utils';
import { ModeToggle } from '../common/ModeToggle';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { useBreadcrumb } from './BreadcrumbContext';
import { UserDropdown } from './UserDropdown';

interface HeaderProps {
  className?: string;
  menuItems: IMenuItem[];
}

export const Header = ({ className, menuItems }: HeaderProps) => {
  const router = useRouter();
  const { routes } = useBreadcrumb();

  const pageTitle = menuItems.find((item) => router.pathname === item.href)?.title;

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-2 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 w-full bg-white dark:bg-transparent',
        className
      )}>
      <ResponsiveSidebar menuItems={menuItems} />
      <BreadcrumbCommon hierarchy={routes} />
      <div className="w-full flex-1">
        <h1 className="font-semibold">{pageTitle}</h1>
      </div>

      <div className="flex justify-center items-center gap-4">
        <ModeToggle />
        <UserDropdown />
      </div>
    </header>
  );
};
