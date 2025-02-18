import React from 'react';
import { QuotationUpdateForm } from '@/components/selling/quotation/QuotationUpdateForm';
import { useRouter } from 'next/router';

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <QuotationUpdateForm quotationId={id} />
    </div>
  );
}
