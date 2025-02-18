import React from 'react';
import { InterlocutorMain } from '@/components/contacts/interlocutor/InterlocutorMain';

export default function Page() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8">
      <InterlocutorMain className="p-5 my-10" />
    </div>
  );
}
