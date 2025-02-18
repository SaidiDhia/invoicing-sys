import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTaxManager } from './hooks/useTaxManager';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface TaxFormProps {
  className?: string;
}

export const TaxForm = ({ className }: TaxFormProps) => {
  const { t: tSettings } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');

  const taxManager = useTaxManager();
  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="w-2/3">
          <Label>{tSettings('tax.attributes.label')}(*) :</Label>
          <Input
            className="mt-2"
            placeholder="Ex. FODEC"
            name="label"
            value={taxManager?.label}
            onChange={(e) => {
              taxManager.set('label', e.target.value);
            }}
          />
        </div>
        <div className="w-1/3">
          <Label>{tSettings('tax.attributes.is_special')}(*) :</Label>
          <Select
            value={taxManager.isSpecial ? 'YES' : 'NO'}
            onValueChange={(e) => taxManager.set('isSpecial', e == 'YES')}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YES">{tCommon('answer.yes')}</SelectItem>
              <SelectItem value="NO">{tCommon('answer.no')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <div className="w-2/3">
          <Label>{tSettings('tax.attributes.value')}(*) :</Label>
          <Input
            type="number"
            className="mt-2"
            placeholder="Ex. 10"
            name="rate"
            value={taxManager?.value}
            onChange={(e) => {
              taxManager.set('value', parseFloat(e.target.value));
            }}
          />
        </div>
        <div className="w-1/3">
          <Label>{tSettings('tax.attributes.type')}(*) :</Label>
          <Select
            value={taxManager.isRate ? 'PERCENTAGE' : 'AMOUNT'}
            onValueChange={(e) => taxManager.set('isRate', e == 'PERCENTAGE')}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">{tSettings('tax.types.rate')} (%)</SelectItem>
              <SelectItem value="AMOUNT">{tSettings('tax.types.fixed')} ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
