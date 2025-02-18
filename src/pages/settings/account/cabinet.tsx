import React from 'react';
import { InformationalSettings } from '@/components/settings/InformationalSettings';
import CabinetMain from '@/components/settings/Cabinet/CabinetMain';

export default function Page() {
  return (
    <InformationalSettings>
      <CabinetMain />
    </InformationalSettings>
  );
}
