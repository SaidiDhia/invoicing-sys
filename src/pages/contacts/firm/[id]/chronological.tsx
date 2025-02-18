import React from 'react';
import { ComingSoon, Page404 } from '@/components/common';
import { useRouter } from 'next/router';
import { FirmDetails } from '@/components/contacts/firm/FirmDetails';

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;
  return (
    <FirmDetails firmId={id}>
      <ComingSoon />
    </FirmDetails>
  );
}
