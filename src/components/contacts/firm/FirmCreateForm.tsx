import React from 'react';
import useCurrency from '@/hooks/content/useCurrency';
import useActivities from '@/hooks/content/useActivities';
import useCountry from '@/hooks/content/useCountry';
import { Button } from '../../ui/button';
import { Spinner } from '@/components/common';
import usePaymentCondition from '@/hooks/content/usePaymentCondition';
import { Package, ReceiptText } from 'lucide-react';
import { api } from '@/api';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '@/utils/errors';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { useFirmManager } from '@/components/contacts/firm/hooks/useFirmManager';
import FirmEntrepriseInformation from './form/FirmEntrepriseInformation';
import FirmContactInformation from './form/FirmContactInformation';
import FirmAddressInformation from './form/FirmAddressInformation';
import FirmNotesInformation from './form/FirmNotesInformation';
import { useTranslation } from 'react-i18next';
import { AbstractCopyAddressHandler } from './utils/AbstractCopyAddressHandler';
import { Address, AddressType, CreateFirmDto } from '@/types';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { Separator } from '@/components/ui/separator';

interface FirmFormProps {
  className?: string;
}

export const FirmCreateForm = ({ className }: FirmFormProps) => {
  //next-router
  const router = useRouter();

  //translations
  const { t: tCommon } = useTranslation('common');
  const { t: tContact } = useTranslation('contacts');

  // Stores
  const firmManager = useFirmManager();

  //set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    setRoutes([
      { title: tCommon('menu.contacts'), href: '/contacts' },
      { title: tCommon('submenu.firms'), href: '/contacts/firms' },
      { title: tContact('firm.new') }
    ]);
  }, [router.locale]);

  // Fetch options
  const { activities, isFetchActivitiesPending } = useActivities();
  const { currencies, isFetchCurrenciesPending } = useCurrency();
  const { countries, isFetchCountriesPending } = useCountry();
  const { paymentConditions, isFetchPaymentConditionsPending } = usePaymentCondition();
  const loading =
    isFetchActivitiesPending ||
    isFetchCurrenciesPending ||
    isFetchCountriesPending ||
    isFetchPaymentConditionsPending;

  //create firm mutator
  const { mutate: createFirm, isPending: isCreatePending } = useMutation({
    mutationFn: (data: CreateFirmDto) => api.firm.create(data),
    onSuccess: () => {
      router.push(`/contacts/firms`);
      toast.success(tContact('firm.action_add_success'));
    },
    onError: (error): void => {
      const message = getErrorMessage('contacts', error, tContact('firm.action_add_failure'));
      toast.error(message);
    }
  });

  //create handler
  const handleSubmit = () => {
    const data = firmManager.getFirm() as CreateFirmDto;
    const validation = api.firm.validate(data);
    if (validation.message) toast.error(tContact(validation.message));
    else {
      createFirm(data);
      firmManager.reset();
    }
  };

  //forward AbstractCopyAddressHandler
  const handleAddressCopy = (prefix: AddressType) =>
    AbstractCopyAddressHandler(
      tContact,
      prefix,
      firmManager.invoicingAddress,
      (a?: Address) => firmManager.set('invoicingAddress', a),
      firmManager.deliveryAddress,
      (a?: Address) => firmManager.set('deliveryAddress', a)
    );

  const globalReset = () => {
    firmManager.reset();
  };

  React.useEffect(() => {
    globalReset();
  }, []);

  //component representation
  if (loading) return <Spinner className="h-screen" show={loading} />;
  return (
    <div className={cn('flex flex-col flex-1 overflow-hidden m-5 lg:mx-10', className)}>
      <div className="flex flex-col lg:flex-row justify-start lg:justify-between">
        <div className="space-y-0.5 py-5 sm:py-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {tContact('firm.introduce_info')}
          </h1>
          <p className="text-muted-foreground">{tContact('firm.introduce_info_description')}</p>
        </div>
        <div className="flex my-5 ml-auto">
          <Button onClick={handleSubmit}>
            {tCommon('commands.save')}
            <Spinner className="ml-2" size={'small'} show={isCreatePending} />
          </Button>
          <Button variant="secondary" className="border-2 ml-3" onClick={globalReset}>
            {tCommon('commands.cancel')}
          </Button>
        </div>
      </div>
      <Separator className="mt-4 lg:mt-6" />
      <div className="flex flex-col flex-1 overflow-auto pb-10 no-scrollbar">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 mt-4">
          <FirmContactInformation />

          <FirmEntrepriseInformation
            activities={activities}
            currencies={currencies}
            paymentConditions={paymentConditions}
          />

          <FirmAddressInformation
            address={firmManager.invoicingAddress}
            setAddressField={(fieldName: string, value: any) => {
              firmManager.set('invoicingAddress', {
                ...firmManager.invoicingAddress,
                [fieldName]: value
              });
            }}
            icon={<ReceiptText className="h-7 w-7 mr-1" />}
            addressLabel={'firm.attributes.invoicing_address'}
            otherAddressLabel={'firm.attributes.delivery_address'}
            countries={countries}
            handleCopyAddress={() => handleAddressCopy('invoicingAddress')}
          />
          <FirmAddressInformation
            address={firmManager.deliveryAddress}
            setAddressField={(fieldName: string, value: any) => {
              firmManager.set('deliveryAddress', {
                ...firmManager.deliveryAddress,
                [fieldName]: value
              });
            }}
            icon={<Package className="h-7 w-7 mr-1" />}
            addressLabel={'firm.attributes.delivery_address'}
            otherAddressLabel={'firm.attributes.invoicing_address'}
            countries={countries}
            handleCopyAddress={() => handleAddressCopy('deliveryAddress')}
          />
        </div>

        <FirmNotesInformation className="mt-5" />
      </div>
    </div>
  );
};
