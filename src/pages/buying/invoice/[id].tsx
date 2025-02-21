import React from 'react';
import { useRouter } from 'next/router';
import { InvoiceUpdateForm } from '@/components/buying/invoice/InvoiceUpdateForm';

export default function BuyingInvoicePage() {
  const router = useRouter();
  const id = router.query.id as string;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <InvoiceUpdateForm invoiceId={id} />
    </div>
  );
}
