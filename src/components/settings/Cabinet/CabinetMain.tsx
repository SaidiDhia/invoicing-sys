import React from 'react';
import { GeneralInformation } from './GeneralInformation';
import { Button } from '@/components/ui/button';
import { AccountingInformation } from './AccountingInformation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api';
import { Cabinet } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';
import { Spinner } from '@/components/common';
import { cn } from '@/lib/utils';
import { useCabinetManager } from '@/components/settings/Cabinet/hooks/useCabinetManager';
import useCountry from '@/hooks/content/useCountry';
import useCabinet from '@/hooks/content/useCabinet';
import useCurrency from '@/hooks/content/useCurrency';
import useActivities from '@/hooks/content/useActivities';
import { useTranslation } from 'react-i18next';
import useInitializedState from '@/hooks/use-initialized-state';
import { UploadedInformation } from './UploadedInformation';
import { useRouter } from 'next/router';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';

interface CabinetMainProps {
  className?: string;
}

const CabinetMain: React.FC<CabinetMainProps> = ({ className }) => {
  //next-router
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');

  //set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    setRoutes([
      { title: tCommon('menu.settings') },
      { title: tCommon('submenu.account') },
      { title: tCommon('settings.account.my_cabinet') }
    ]);
  }, [router.locale]);

  const { cabinet, isFetchCabinetPending, error, refetchCabinet } = useCabinet();
  const { activities, isFetchActivitiesPending } = useActivities();
  const { currencies, isFetchCurrenciesPending } = useCurrency();
  const { countries, isFetchCountriesPending } = useCountry();

  const cabinetManager = useCabinetManager();

  const { mutate: updateCabinet, isPending: isUpdatePending } = useMutation({
    mutationFn: (data: Cabinet) => api.cabinet.update(data),
    onSuccess: () => {
      toast.success('Cabinet modifiée avec succès');
      refetchCabinet();
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, 'Erreur lors de la modification de du cabinet'));
    }
  });

  const loading =
    isFetchCabinetPending ||
    isFetchCurrenciesPending ||
    isFetchActivitiesPending ||
    isFetchCountriesPending ||
    isUpdatePending;

  const { isDisabled, globalReset } = useInitializedState({
    data: cabinet || ({} as Partial<Cabinet>),
    getCurrentData: () => cabinetManager.getCabinet(),
    setFormData: (data: Partial<Cabinet>) => cabinetManager.setCabinet(data),
    resetData: () => cabinetManager.reset(),
    loading
  });

  const handleSubmit = () => {
    const data = cabinetManager.getCabinet();
    const validation = api.cabinet.validate(data);
    if (validation.message) toast.error(validation.message);
    else {
      updateCabinet(data as Cabinet);
    }
  };

  if (error) return 'An error has occurred: ' + error.message;
  return (
    <div className={cn(className)}>
      <div className="flex flex-col 2xl:flex-row gap-5">
        <GeneralInformation
          className="w-full 2xl:w-3/4"
          countries={countries}
          isPending={loading}
        />
        <UploadedInformation className="w-full 2xl:w-1/4" />
      </div>
      <AccountingInformation
        className="mt-5"
        isPending={loading}
        activities={activities}
        currencies={currencies}
      />
      <div className="flex gap-2 justify-end mt-5">
        <Button onClick={handleSubmit} disabled={isDisabled}>
          {tCommon('commands.save')}
          <Spinner className="ml-2" size={'small'} show={isUpdatePending} />
        </Button>
        <Button variant="secondary" onClick={globalReset} disabled={isDisabled}>
          {tCommon('commands.reset')}
        </Button>
      </div>
    </div>
  );
};

export default CabinetMain;
