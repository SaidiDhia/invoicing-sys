import React from 'react';
import { InformationalSettings } from '@/components/settings/InformationalSettings';
import { BankAccountMain } from '@/components/settings/BankAccount/BankAccountMain';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { FirmDetails } from '@/components/contacts/firm/FirmDetails';
import { FirmBankAccountMain } from '@/components/FirmBankAccount/FirmBankAccountMain';

export default function Page() {

  const router = useRouter();
  const id = router.query.id as string;

  const { t: tCommon, ready: commonReady } = useTranslation('common');
  const { t: tContact, ready: contactReady } = useTranslation('contacts');

  const routes = [
    { title: tCommon('menu.contacts'), href: '/contacts' },
    { title: tContact('firm.plural'), href: '/contacts/firms' },
    {
      title: `${tContact('firm.singular')} N°${id}`,
      href: '/contacts/firm?id=' + id
    }
  ];

  return (
    <FirmDetails firmId={id}>
      <FirmBankAccountMain  firmId={+id} routes={routes}/>
    </FirmDetails>
     

  );
}
