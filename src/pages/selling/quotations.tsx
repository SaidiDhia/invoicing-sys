import React from 'react';
import { QuotationMain } from '@/components/selling/quotation/QuotationMain';

export default function QuotationsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-auto p-8">
      <QuotationMain className="p-5 my-10" />
    </div>
  );
}
