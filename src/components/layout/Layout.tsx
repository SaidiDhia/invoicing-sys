import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { IMenuItem } from '@/components/layout/interfaces/MenuItem.interface';
import { BreadcrumbContext, BreadcrumbRoute } from './BreadcrumbContext';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  items: IMenuItem[];
}

export const Layout = ({ children, className, items }: LayoutProps) => {
  const [routes, setRoutes] = React.useState<BreadcrumbRoute[]>([]);
  const context = {
    routes,
    setRoutes
  };

  return (
    <BreadcrumbContext.Provider value={context}>
      <div
        className={cn(
          'flex min-h-screen max-h-screen overflow-hidden md:flex-cols-[220px_1fr] lg:flex-cols-[280px_1fr]',
          'bg-gradient-to-r from-white to-gray-100',
          'dark:bg-gradient-to-r dark:from-slate-950 dark:to-slate-800'
        )}>
        <Sidebar menuItems={items} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header menuItems={items} />
          <main className={cn('flex-1 flex flex-col overflow-hidden', className)}>{children}</main>
        </div>
      </div>
    </BreadcrumbContext.Provider>
  );
};
