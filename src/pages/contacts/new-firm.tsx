import React from 'react';
import { FirmCreateForm } from '@/components/contacts/firm/FirmCreateForm';

export default function Page() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <FirmCreateForm className="mx-5 lg:mx-10" />
    </div>
  );
}
