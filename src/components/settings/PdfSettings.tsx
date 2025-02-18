import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import { File, TestTubeDiagonalIcon } from 'lucide-react';
import { useBreadcrumb } from '../layout/BreadcrumbContext';

type TabKey = 'templates' | 'live';

interface PdfSettingsProps {
  className?: string;
  defaultValue: TabKey;
}

export const PdfSettings: React.FC<PdfSettingsProps> = ({ className, defaultValue }) => {
  //next-router
  const router = useRouter();

  //set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    setRoutes([
      { title: 'Réglages PDF', href: '/settings/pdf' },
      { title: TABS_CONFIG[defaultValue as TabKey].label }
    ]);
  }, [router.locale, defaultValue]);

  //menu items
  const TABS_CONFIG: Record<TabKey, { label: string; icon: React.ReactNode }> = {
    templates: {
      label: 'templates',
      icon: <File />
    },
    live: {
      label: 'Document Live Preview',
      icon: <TestTubeDiagonalIcon />
    }
  };

  const handleTabChange = (value: string) => {
    router.push(`/settings/pdf/${value}`);
  };

  return (
    <div className={cn(className)}>
      <Tabs defaultValue={defaultValue} onValueChange={handleTabChange} className="overflow-auto">
        <TabsList className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 w-full h-fit">
          {Object.keys(TABS_CONFIG).map((key) => (
            <TabsTrigger key={key} value={key} className="flex gap-2 items-center">
              {TABS_CONFIG[key as TabKey].icon} {TABS_CONFIG[key as TabKey].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
