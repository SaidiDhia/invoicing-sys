import React from 'react';
import { QuotationMain } from '@/components/buying/quotation/QuotationMain';

export default function BuyingQuotationsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-auto p-8">
      <QuotationMain className="p-5 my-10" />
    </div>
  );
}
