import React from 'react';
import { ComingSoon, Page404 } from '@/components/common';
import { useRouter } from 'next/router';
import { FirmDetails } from '@/components/contacts/firm/FirmDetails';
import { LoggerMain } from '@/components/administrative-tools/Logger/LoggerMain';
import { useTranslation } from 'react-i18next';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;

  const { t: tCommon } = useTranslation('common');
  const { t: tContact } = useTranslation('contacts');

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
        { title: tContact('firm.detailmenu.chronological'),}
      ]);
    }, [router.locale,id]);

    
  return (
    <FirmDetails firmId={id}>
      <LoggerMain firmId={id} />
    </FirmDetails>
  );
}
