import React from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import {
  BriefcaseBusiness,
  HashIcon,
  Magnet,
  MessageCircle,
  Receipt,
  WalletCards
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Separator } from '../ui/separator';
import SidebarNav from '../sidebar-nav';

interface SystemSettingsProps {
  className?: string;
  children?: React.ReactNode;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ className, children }) => {
  //next-router
  const router = useRouter();

  //translations
  const { t: tCommon } = useTranslation('common');
  const { t: tSettings } = useTranslation('settings');

  //menu items
  const sidebarNavItems = [
    {
      title: tCommon('settings.system.activity'),
      icon: <BriefcaseBusiness size={18} />,
      href: '/settings/system/activity'
    },
    {
      title: tCommon('settings.system.sequence'),
      icon: <HashIcon size={18} />,
      href: '/settings/system/sequence'
    },
    {
      title: tCommon('settings.system.payment_condition'),
      icon: <Receipt size={18} />,
      href: 'payment-conditions'
    },
    {
      title: tCommon('settings.system.tax_withholding'),
      icon: <Magnet size={18} />,
      href: '/settings/system/withholding'
    },
    {
      title: tCommon('settings.system.tax'),
      icon: <WalletCards size={18} />,
      href: '/settings/system/tax'
    },
    {
      title: tCommon('settings.system.default_condition'),
      icon: <MessageCircle size={18} />,
      href: '/settings/system/conditions'
    }
  ];

  return (
    <div className={cn('flex flex-col flex-1 overflow-hidden m-5 lg:mx-10', className)}>
      <div className="space-y-0.5 py-5 sm:py-0">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {tSettings('system.singular')}
        </h1>
        <p className="text-muted-foreground">{tSettings('system.description')}</p>
      </div>
      <Separator className="my-4 lg:my-6" />
      <div className="flex flex-col flex-1 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 ">
        <aside className="flex-1 mb-2">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex flex-col flex-[7] overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
