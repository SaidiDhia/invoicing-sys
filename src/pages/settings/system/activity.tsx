import React from 'react';
import ActivityMain from '@/components/settings/Activity/ActivityMain';
import { SystemSettings } from '@/components/settings/SystemSettings';

export default function Page() {
  return (
    <SystemSettings>
      <ActivityMain />
    </SystemSettings>
  );
}
