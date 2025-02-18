import React from 'react';
import LiveEJSCompiler from '@/components/settings/pdf/LiveEJSCompiler';
import { PdfSettings } from '@/components/settings/PdfSettings';

export default function Page() {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <PdfSettings defaultValue={'live'} />
      <LiveEJSCompiler className="m-10" />
    </div>
  );
}
