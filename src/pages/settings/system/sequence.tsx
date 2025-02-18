import React from 'react';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { SequentialMain } from '@/components/settings/Sequentials/SequentialMain';

export default function Page() {
  return (
    <SystemSettings>
      <SequentialMain />
    </SystemSettings>
  );
}
