import React from 'react';
import { PaymentCreateForm } from '@/components/selling/payment/PaymentCreateForm';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const params = useSearchParams();
  const firmId = params.get('firmId') || undefined;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PaymentCreateForm firmId={firmId} />
    </div>
  );
}
