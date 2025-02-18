import React from 'react';
import { FirmMain } from '@/components/contacts/firm/FirmMain';

export default function Page() {
  return (
    <div className="flex-1 flex flex-col overflow-auto p-8">
      <FirmMain className="p-5 my-10" />
    </div>
  );
}
