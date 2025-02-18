import React from 'react';
import { useRouter } from 'next/router';
import { FirmDetails } from '@/components/contacts/firm/FirmDetails';
import { InterlocutorEmbeddedMain } from '@/components/contacts/interlocutor/InterlocutorEmbeddedMain';
import { useTranslation } from 'react-i18next';

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;

  const { t: tCommon } = useTranslation('common');
  const { t: tContact } = useTranslation('contacts');

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
      <InterlocutorEmbeddedMain firmId={parseInt(id)} routes={routes} />
    </FirmDetails>
  );
}
