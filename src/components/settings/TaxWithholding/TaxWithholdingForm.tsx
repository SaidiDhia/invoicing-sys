import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useTaxWithholdingManager } from './hooks/useTaxWithholdingManager';

interface TaxWithholdingFormProps {
  className?: string;
}

export const TaxWithholdingForm = ({ className }: TaxWithholdingFormProps) => {
  const { t: tSettings } = useTranslation('settings');

  const taxWithholdingManager = useTaxWithholdingManager();
  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="w-2/3">
          <Label>{tSettings('withholding.attributes.label')}(*) :</Label>
          <Input
            className="mt-2"
            placeholder="Ex. Régime réel"
            name="label"
            value={taxWithholdingManager?.label}
            onChange={(e) => {
              taxWithholdingManager.set('label', e.target.value);
            }}
          />
        </div>
        <div className="w-2/3">
          <Label>{tSettings('withholding.attributes.rate')}(*) :</Label>
          <Input
            type="number"
            className="mt-2"
            placeholder="Ex. 10"
            name="rate"
            value={taxWithholdingManager?.rate}
            onChange={(e) => {
              taxWithholdingManager.set('rate', parseFloat(e.target.value));
            }}
          />
        </div>
      </div>
    </div>
  );
};
