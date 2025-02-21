import React from 'react';
import { InvoiceCreateForm } from '@/components/buying/invoice/InvoiceCreateForm';
import { useSearchParams } from 'next/navigation';

export default function BuyingInvoicePage() {
  const params = useSearchParams();
  const firmId = params.get('firmId') || undefined;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <InvoiceCreateForm firmId={firmId} />
    </div>
  );
}
