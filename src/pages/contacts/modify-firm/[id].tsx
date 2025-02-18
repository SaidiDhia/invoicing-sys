import React from 'react';
import { useRouter } from 'next/router';
import { FirmUpdateForm } from '@/components/contacts/firm/FirmUpdateForm';
import { Page404 } from '@/components/common';

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;

  if (!id) return <Page404 />;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <FirmUpdateForm firmId={parseInt(id)} className="mx-5 lg:mx-10" />
    </div>
  );
}
