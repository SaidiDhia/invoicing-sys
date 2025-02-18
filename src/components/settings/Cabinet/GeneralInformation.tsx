import React from 'react';
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
import { Building2 } from 'lucide-react';
import { Country } from '@/types';
import { useCabinetManager } from '@/components/settings/Cabinet/hooks/useCabinetManager';
import { PhoneInput } from '@/components/ui/phone-input';
import { useTranslation } from 'react-i18next';

interface GeneralInformationProps {
  className?: string;
  countries?: Country[];
  isPending?: boolean;
}

export const GeneralInformation: React.FC<GeneralInformationProps> = ({
  className,
  isPending,
  countries
}) => {
  const cabinetManager = useCabinetManager();
  const { t: tContacts } = useTranslation('contacts');
  const { t: tSettings } = useTranslation('settings');
  const { t: tCountry } = useTranslation('country');
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <Building2 />
            {tSettings('cabinet.general_information')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="block xl:flex flex-row items-center justify-center gap-1">
          {/* General Information */}
          <div className="w-full">
            <div className="py-4 border-b w-full">
              <div className="mt-2">
                <Label>{tSettings('cabinet.attributes.name')}(*)</Label>
                <Input
                  className="mt-2"
                  placeholder="Ex. Zedney Creative"
                  isPending={isPending}
                  value={cabinetManager.enterpriseName}
                  onChange={(e) => cabinetManager.set('enterpriseName', e.target.value)}
                />
              </div>

              <div className="block xl:flex gap-2">
                <div className="mt-2 w-full">
                  <Label>{tSettings('cabinet.attributes.phone')}</Label>
                  <PhoneInput
                    className="mt-2"
                    defaultCountry="TN"
                    placeholder="Ex. +216 72 398 389"
                    isPending={isPending || false}
                    value={cabinetManager.phone}
                    onChange={(value) => cabinetManager.set('phone', value)}
                  />
                </div>

                <div className="mt-2 w-full">
                  <Label>{tSettings('cabinet.attributes.email')}</Label>
                  <Input
                    className="mt-2"
                    placeholder="Ex. johndoe@zedneycreative.com"
                    isPending={isPending}
                    value={cabinetManager.email}
                    onChange={(e) => cabinetManager.set('email', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="py-4 w-full">
              <div className="mt-2 w-full">
                <Label>{tContacts('common.address.address')}(*)</Label>
                <Input
                  className="mt-2"
                  placeholder="Ex. 188 Avenue 14 Janvier"
                  isPending={isPending}
                  value={cabinetManager?.address?.address}
                  onChange={(e) =>
                    cabinetManager.set('address', {
                      ...cabinetManager.address,
                      address: e.target.value
                    })
                  }
                />
              </div>

              <div className="block xl:flex gap-2">
                <div className="mt-2 w-full">
                  <Label>{tContacts('common.address.region')}(*)</Label>
                  <Input
                    className="mt-2"
                    placeholder="Ex. Bizerte"
                    isPending={isPending}
                    value={cabinetManager?.address?.region}
                    onChange={(e) =>
                      cabinetManager.set('address', {
                        ...cabinetManager.address,
                        region: e.target.value
                      })
                    }
                  />
                </div>

                <div className="mt-2 w-full">
                  <Label>{tContacts('common.address.zip_code')}(*)</Label>
                  <Input
                    className="mt-2"
                    placeholder="Ex. 7000"
                    isPending={isPending}
                    value={cabinetManager?.address?.zipcode}
                    onChange={(e) =>
                      cabinetManager.set('address', {
                        ...cabinetManager.address,
                        zipcode: e.target.value
                      })
                    }
                  />
                </div>

                <div className="mt-2 w-full">
                  <Label>{tContacts('common.address.country')}(*)</Label>
                  <div className="mt-2">
                    <SelectShimmer isPending={isPending}>
                      <Select
                        key={cabinetManager?.address?.countryId?.toString() || 'countryId'}
                        onValueChange={(e) =>
                          cabinetManager.set('address', {
                            ...cabinetManager.address,
                            countryId: e
                          })
                        }
                        value={cabinetManager?.address?.countryId?.toString()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries?.map((country) => (
                            <SelectItem key={country.id} value={country?.id?.toString() || ''}>
                              {country?.alpha2code && tCountry(country?.alpha2code)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </SelectShimmer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
