import React from 'react';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { DefaultConditionMain } from '@/components/settings/DefaultCondition/DefaultConditionMain';

export default function Page() {
  return (
    <SystemSettings>
      <DefaultConditionMain />
    </SystemSettings>
  );
}
