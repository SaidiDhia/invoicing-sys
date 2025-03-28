import React from 'react';
import { useRouter } from 'next/router';
import { FirmDetails } from '@/components/contacts/firm/FirmDetails';
import { PaymentEmbeddedMain as SellingPaymentEmbeddedMain} from '@/components/selling/payment/PaymentEmbeddedMain';
import { PaymentEmbeddedMain as BuyingPaymentEmbeddedMain} from '@/components/buying/payment/PaymentEmbeddedMain';
import { cn } from '@/lib/utils';

import { useTranslation } from 'react-i18next';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Package, ShoppingCart } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;
  const [openSections, setOpenSections] = React.useState<string[]>([]);

  const { t: tCommon, ready: commonReady } = useTranslation('common');
  const { t: tContact, ready: contactReady } = useTranslation('contacts');
  const { t: tInvoicing } = useTranslation('invoicing');



  const routes = [
    { title: tCommon('menu.contacts'), href: '/contacts' },
    { title: tContact('firm.plural'), href: '/contacts/firms' },
    {
      title: `${tContact('firm.singular')} N°${id}`,
      href: '/contacts/firm?id=' + id
    }
  ];

  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    setRoutes([
      ...routes,
      { title: tCommon('submenu.payments') }
    ]);
  }, [router.locale,id]);
    
  const handleAccordionChange = (value: string[]) => {
    // Bloquer l'ouverture si une section est déjà ouverte
    if (value.length > 1) {
      const lastOpened = value.find(v => !openSections.includes(v));
      setOpenSections(lastOpened ? [lastOpened] : []);
    } else {
      setOpenSections(value);
    }
  };

  return (
    <FirmDetails firmId={id}>
      <div className="flex-none">
      <h3 className="text-2xl font-bold text-muted-foreground">{tInvoicing('payment.singular')}</h3>
      <p className="text-lg">{tInvoicing('payment.card_description')}</p>
    </div>
    <Separator className="my-4 flex-none" />
      <Accordion 
        type="multiple"
        value={openSections}
        onValueChange={handleAccordionChange}
        className={cn('mx-1 border-b')}
      >
          <AccordionItem value="selling">
            <AccordionTrigger 
              disabled={openSections.length > 0 && !openSections.includes('selling')}
              className="group [&[data-state=closed][disabled]]:opacity-50 [&[data-state=closed][disabled]]:cursor-not-allowed [&[data-state=closed]:not([disabled])]:hover:opacity-90 transition-opacity duration-200"
            >
              <div className="flex gap-2 items-center">
                <Label className="group-disabled:text-gray-400">
                <div className='flex gap-2 items-center'><Package className="h-5 w-5" />{tContact("payments.selling_payments")}</div>
                </Label>
              </div>
            </AccordionTrigger>
            <AccordionContent className="m-5">
              <SellingPaymentEmbeddedMain 
                firmId={parseInt(id)} 
                routes={routes}
              />
            </AccordionContent>
          </AccordionItem>
       <AccordionItem value="buying">
        <AccordionTrigger
          disabled={openSections.length > 0 && !openSections.includes('buying')}
          className="group [&[data-state=closed][disabled]]:opacity-50 [&[data-state=closed][disabled]]:cursor-not-allowed [&[data-state=closed]:not([disabled])]:hover:opacity-90 transition-opacity duration-200"
        >
          <div className="flex gap-2 items-center">
            <Label className="group-disabled:text-gray-400">
            <div className='flex gap-2 items-center'><ShoppingCart className="h-5 w-5" />{tContact("payments.buying_payments")}</div>
            </Label>
          </div>
        </AccordionTrigger>
        <AccordionContent className="m-5">
          <BuyingPaymentEmbeddedMain 
            firmId={parseInt(id)} 
            routes={routes}
          />
        </AccordionContent>
      </AccordionItem>
      </Accordion>
    </FirmDetails>
  );
}