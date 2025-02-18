import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SOCIAL_TITLE } from '@/types/enums/social-titles';
import { Input } from '@/components/ui/input';
import { useFirmManager } from '@/components/contacts/firm/hooks/useFirmManager';
import { useTranslation } from 'react-i18next';
import { PhoneInput } from '@/components/ui/phone-input';

interface FirmContactInformationProps {
  className?: string;
  loading?: boolean;
}

const FirmContactInformation: React.FC<FirmContactInformationProps> = ({ className, loading }) => {
  const firmManager = useFirmManager();
  const { t: tContacts } = useTranslation('contacts');
  const { t: tSocial } = useTranslation('social-title');
  return (
    <Card className={className}>
      <CardHeader className="p-5">
        <CardTitle className="border-b pb-2">
          <div className="flex items-center">
            <User className="h-7 w-7 mr-1" />
            <Label className="text-sm font-semibold">
              {tContacts('common.contact_information')}
            </Label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className=" flex flex-col h-80">
        <div className="my-auto">
          <div className="flex">
            <div className="-mt-1 mx-1 w-1/5">
              <Label>{tContacts('interlocutor.attributes.title')} (*)</Label>
              <div className="mt-2">
                <SelectShimmer isPending={loading || false}>
                  <Select
                    onValueChange={(e) => {
                      firmManager.set('title', e);
                    }}
                    value={firmManager?.title}>
                    <SelectTrigger>
                      <SelectValue placeholder={tContacts('interlocutor.attributes.title')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SOCIAL_TITLE).map((title) => (
                        <SelectItem key={title} value={title}>
                          {tSocial(title)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SelectShimmer>
              </div>
            </div>
            <div className="mx-1 w-2/5">
              <Label>{tContacts('interlocutor.attributes.name')} (*)</Label>
              <Input
                isPending={loading}
                className="mt-1"
                placeholder="Ex. John"
                value={firmManager?.name}
                onChange={(e) => firmManager.set('name', e.target.value)}
              />
            </div>
            <div className="mx-1 w-2/5">
              <Label>{tContacts('interlocutor.attributes.surname')} (*)</Label>
              <Input
                isPending={loading}
                className="mt-1"
                placeholder="Ex. Doe"
                value={firmManager?.surname}
                onChange={(e) => firmManager.set('surname', e.target.value)}
              />
            </div>
          </div>

          <div className="flex mt-2">
            <div className="mx-1 w-full">
              <Label>{tContacts('interlocutor.attributes.position')} (*)</Label>
              <Input
                isPending={loading}
                className="mt-1"
                placeholder="Ex. CEO"
                value={firmManager?.position}
                onChange={(e) => firmManager.set('position', e.target.value)}
              />
            </div>
          </div>
          <div className="flex mt-2">
            <div className="mx-1 w-3/5">
              <Label>{tContacts('interlocutor.attributes.email')}</Label>
              <Input
                isPending={loading}
                type="email"
                className="mt-1"
                placeholder="Ex. johndoe@zedneycreative.com"
                value={firmManager?.email}
                onChange={(e) => firmManager.set('email', e.target.value)}
              />
            </div>
            <div className="mx-1 w-2/5">
              <Label>{tContacts('interlocutor.attributes.phone')}</Label>
              <PhoneInput
                isPending={loading}
                defaultCountry="TN"
                type="tel"
                className="mt-1"
                placeholder="Ex. +216 72 398 389"
                value={firmManager?.phone}
                onChange={(value) => firmManager.set('phone', value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirmContactInformation;
