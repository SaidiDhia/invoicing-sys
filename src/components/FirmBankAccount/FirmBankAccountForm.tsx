import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useFirmBankAccountManager } from './hooks/useFirmBankAccountManager';
import { cn } from '@/lib/utils';
import useCurrency from '@/hooks/content/useCurrency';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';

interface FirmBankAccountFormProps {
  className?: string;
  mainByDefault?: boolean;
}

export const FirmBankAccountForm = ({ className, mainByDefault }: FirmBankAccountFormProps) => {
  const { t: tCurrency } = useTranslation('currency');
  const { t: tContacts } = useTranslation('contacts');

  const bankAccountManager = useFirmBankAccountManager();
  const { currencies, isFetchCurrenciesPending } = useCurrency();

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="mt-1">
        <Label>{tContacts('bank_accounts.attributes.name')}(*)</Label>
        <Input
          className="mt-1"
          placeholder="Ex. Al Baraka"
          value={bankAccountManager?.name}
          onChange={(e) => bankAccountManager.set('name', e.target.value)}
        />
      </div>
      <div className="mt-1">
        <Label>{tContacts('bank_accounts.attributes.bic')} (*)</Label>
        <Input
          className="mt-1 "
          placeholder="Ex. BSTUTNTT"
          value={bankAccountManager?.bic}
          onChange={(e) => bankAccountManager.set('bic', e.target.value)}
        />
      </div>
      <div className="mt-1">
        <Label>{tContacts('bank_accounts.attributes.currency')} (*)</Label>
        <SelectShimmer isPending={isFetchCurrenciesPending || false}>
          <Select
            key={bankAccountManager?.currency?.id?.toString() || 'currencyId'}
            onValueChange={(e) => {bankAccountManager.set('currencyId',parseInt(e))
              console.log("bankAccountManager : ",parseInt(e));
            }}
            value={bankAccountManager?.currencyId?.toString() || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Devise" />
            </SelectTrigger>
            <SelectContent>
              {currencies?.map((currency) => (
                <SelectItem key={currency.id} value={currency?.id?.toString() || ''}>
                  {currency?.code && tCurrency(currency?.code)} ({currency.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectShimmer>
      </div>
      <div className="mt-1">
        <Label>{tContacts('bank_accounts.attributes.rib')} (*)</Label>
        <Input
          className="mt-1"
          placeholder="Ex. 1234 5678 9012 3456 7890"
          value={bankAccountManager?.rib}
          onChange={(e) => bankAccountManager.set('rib', e.target.value)}
        />
      </div>
      <div className="mt-1">
        <Label>{tContacts('bank_accounts.attributes.iban')} (*)</Label>
        <Input
          className="mt-1"
          placeholder="Ex. TN59 1234 5678 9012 3456 7890"
          value={bankAccountManager?.iban}
          onChange={(e) => bankAccountManager.set('iban', e.target.value)}
        />
      </div>
      {!mainByDefault && (
        <div className="flex w-full items-center my-5">
          <Label className="w-full">{tContacts('bank_accounts.attributes.isMain')} </Label>
          <div className="w-full mx-2 text-right">
            <Switch
              onCheckedChange={(e) => bankAccountManager.set('isMain', e)}
              checked={bankAccountManager?.isMain}
            />
          </div>
        </div>
      )}
    </div>
  );
};
