import React from 'react';
import { PdfSettings } from '@/components/settings/PdfSettings';
import { ComingSoon } from '@/components/common';

export default function Page() {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <PdfSettings defaultValue={'templates'} />
      <ComingSoon className="m-10" />
    </div>
  );
}
