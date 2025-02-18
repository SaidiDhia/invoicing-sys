import React from 'react';
import { InformationalSettings } from '@/components/settings/InformationalSettings';
import { BankAccountMain } from '@/components/settings/BankAccount/BankAccountMain';

export default function Page() {
  return (
    <InformationalSettings>
      <BankAccountMain />
    </InformationalSettings>
  );
}
