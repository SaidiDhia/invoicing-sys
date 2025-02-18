import React from 'react';
import { useRouter } from 'next/router';
import { FirmDetails } from '@/components/contacts/firm/FirmDetails';
import { ComingSoon } from '@/components/common';

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <FirmDetails firmId={id}>
      <ComingSoon />
    </FirmDetails>
  );
}
