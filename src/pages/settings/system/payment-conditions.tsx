import React from 'react';
import { SystemSettings } from '@/components/settings/SystemSettings';
import PaymentConditionMain from '@/components/settings/PaymentCondition/PaymentConditionMain';

export default function Page() {
  return (
    <SystemSettings>
      <PaymentConditionMain />
    </SystemSettings>
  );
}
