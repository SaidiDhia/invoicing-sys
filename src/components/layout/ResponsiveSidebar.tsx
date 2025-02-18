import React from 'react';
import { cn } from '@/lib/utils';
import { IMenuItem } from './interfaces/MenuItem.interface';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useTheme } from 'next-themes';
import logoDark from 'src/assets/logo-light.png';
import packageJson from 'package.json';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '../ui/label';

interface SideMenuProps {
  className?: string;
  menuItems: IMenuItem[];
}

export const ResponsiveSidebar = ({ className, menuItems }: SideMenuProps) => {
  const router = useRouter();
  const { theme } = useTheme();

  const [isSheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    const handleRouteChange = () => {
      setSheetOpen(false);
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const activeItem = menuItems.find((item) => router.asPath.includes(item.code));
  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only"> Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col bg-slate-900 dark:bg-gray-950">
        <div className={cn(className, 'overflow-hidden')}>
          <div>
            <nav className="grid gap-2 text-lg font-medium">
              <div className="flex items-center mx-auto gap-2 font-semibold cursor-pointer">
                <Image
                  src={theme == 'light' ? logoDark : logoDark}
                  alt="logo"
                  className="w-32 cursor-pointer"
                  onClick={() => router.push('/dashboard')}
                />
              </div>
              <nav className="grid items-start mt-5 p-0 text-sm ">
                <Accordion type="single" collapsible defaultValue={activeItem?.id?.toString()}>
                  {menuItems.map((item) => (
                    <AccordionItem
                      key={item.code}
                      value={item.id?.toString() || ''}
                      className="border-0">
                      <AccordionTrigger
                        className={cn(
                          'gap-2 rounded-lg -py-2 text-white',
                          item.code.includes(router.pathname)
                            ? 'text-muted-foreground text-primary bg-gray-100 font-semibold'
                            : 'bg-muted hover:font-semibold'
                        )}>
                        <div className="flex items-center gap-3 rounded-lg py-2">
                          {item.icon}
                          {item.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="-mb-4">
                        {item.subMenu &&
                          item.subMenu.map((subItem: IMenuItem) => (
                            <div
                              key={subItem.code}
                              onClick={() => router.push(subItem.href || '/')}
                              className={cn(
                                'flex items-center gap-2 rounded-lg pl-6 py-2 transition-all text-white hover:bg-gray-100 hover:dark:bg-slate-700',
                                subItem.href === router.asPath
                                  ? 'text-muted-foreground text-primary bg-gray-100 dark:bg-slate-800 font-semibold'
                                  : 'bg-muted hover:font-semibold'
                              )}>
                              {subItem.icon}
                              <span className="font-medium">{subItem.title}</span>
                            </div>
                          ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </nav>
            </nav>
          </div>
        </div>
        {/* app version */}
        <div className="mt-auto">
          <Label>v{packageJson.version}</Label>
        </div>
      </SheetContent>
    </Sheet>
  );
};
