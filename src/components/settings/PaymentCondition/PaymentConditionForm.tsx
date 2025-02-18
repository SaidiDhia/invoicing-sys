import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePaymentConditionManager } from './hooks/usePaymentConditionManager';

interface PaymentConditionFormProps {
  className?: string;
}

export const PaymentConditionForm = ({ className }: PaymentConditionFormProps) => {
  const paymentConditionManager = usePaymentConditionManager();
  return (
    <div className={className}>
      <div className="mt-4">
        <Label>Titre(*)</Label>
        <Input
          className="mt-2"
          placeholder="Ex. Envoyer des rappels"
          name="label"
          value={paymentConditionManager?.label}
          onChange={(e) => {
            paymentConditionManager.set('label', e.target.value);
          }}
        />
      </div>
      <div className="mt-4">
        <Label>Description(*)</Label>
        <Textarea
          className="mt-2 resize-none"
          placeholder="Ex. Envoyer des rappels"
          name="description"
          value={paymentConditionManager?.description}
          onChange={(e) => {
            paymentConditionManager.set('description', e.target.value);
          }}
        />
      </div>
    </div>
  );
};
