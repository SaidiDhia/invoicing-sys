import React from 'react';
import { SystemSettings } from '@/components/settings/SystemSettings';
import TaxWithholdingMain from '@/components/settings/TaxWithholding/TaxWithholdingMain';

export default function Page() {
  return (
    <SystemSettings>
      <TaxWithholdingMain />
    </SystemSettings>
  );
}
