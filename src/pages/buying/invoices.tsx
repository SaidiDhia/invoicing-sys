import React from 'react';
import { InvoiceMain } from '@/components/buying/invoice/InvoiceMain';

export default function BuyingInvoicesPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8">
      <InvoiceMain className="p-5 my-10" />
    </div>
  );
}
