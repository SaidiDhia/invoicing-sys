import React from 'react';
import { Activity, Currency } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useCabinetManager } from '@/components/settings/Cabinet/hooks/useCabinetManager';
import { Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AccountingInformationProps {
  className?: string;
  activities: Activity[];
  currencies: Currency[];
  isPending?: boolean;
}

export const AccountingInformation = ({
  className,
  activities,
  currencies,
  isPending
}: AccountingInformationProps) => {
  const { t: tSettings } = useTranslation('settings');
  const { t: tCurrency } = useTranslation('currency');
  const cabinetManager = useCabinetManager();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <Calculator />
            {tSettings('cabinet.financial_information')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-2 w-full">
          <div className="block xl:flex">
            <div className="mt-2 mr-2 w-full">
              <Label>{tSettings('cabinet.attributes.tax_number')}(*)</Label>
              <Input
                className="mt-2"
                placeholder="Ex. 1538414/L/A/M/0000"
                isPending={isPending}
                value={cabinetManager.taxIdNumber}
                onChange={(e) => cabinetManager.set('taxIdNumber', e.target.value)}
              />
            </div>

            <div className="mt-2 mr-2 w-full">
              <Label>{tSettings('cabinet.attributes.activity')}</Label>
              <div className="mt-2">
                <SelectShimmer isPending={isPending}>
                  <Select
                    key={cabinetManager.activity?.id?.toString() || 'activityId'}
                    value={cabinetManager.activity?.id?.toString() || undefined}
                    onValueChange={(e) =>
                      cabinetManager.set('activity', { id: parseInt(e) } as Activity)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Activité" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map((activity) => (
                        <SelectItem key={activity.id} value={activity?.id?.toString() || ''}>
                          {activity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SelectShimmer>
              </div>
            </div>

            <div className="mt-2 mr-2 w-full">
              <Label>{tSettings('cabinet.attributes.currency')}</Label>
              <div className="mt-2">
                <SelectShimmer isPending={isPending}>
                  <Select
                    key={cabinetManager.currency?.id?.toString() || 'currencyId'}
                    value={cabinetManager.currency?.id?.toString() || undefined}
                    onValueChange={(e) =>
                      cabinetManager.set('currency', { id: parseInt(e) } as Currency)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Devise Principale" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency?.id?.toString() || ''}>
                          {currency?.code && tCurrency(currency?.code)} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SelectShimmer>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
