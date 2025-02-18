import { Spinner } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { SequentialItem } from './SequentialItem';
import useConfig from '@/hooks/content/useConfig';
import { useSequentialsManager } from './hooks/useSequentialManager';
import React from 'react';
import { DATE_FORMAT } from '@/types/enums/date-formats';
import { useMutation } from '@tanstack/react-query';
import { UpdateQuotationSequentialNumber, UpdateSequentialDto } from '@/types';
import { getErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';
import { api } from '@/api';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import ContentSection from '@/components/common/ContentSection';

interface SequentialMainProps {
  className?: string;
}

export const SequentialMain: React.FC<SequentialMainProps> = ({ className }) => {
  //next-router
  const router = useRouter();
  const { t: tSettings } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');

  //set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    setRoutes([
      { title: tCommon('menu.settings') },
      { title: tCommon('submenu.system') },
      { title: tCommon('settings.system.sequence') }
    ]);
  }, [router.locale]);

  const sequentialsManager = useSequentialsManager();
  const { configs: sequentials, isConfigPending: isSequentialsPending } = useConfig([
    'quotation_sequence',
    'invoice_sequence'
  ]);

  React.useEffect(() => {
    if (!isSequentialsPending) {
      sequentialsManager.setSequential(
        'sellingQuotation',
        sequentials.find((s) => s.key === 'quotation_sequence')?.value as UpdateSequentialDto
      );
      sequentialsManager.setSequential(
        'sellingInvoice',
        sequentials.find((s) => s.key === 'invoice_sequence')?.value as UpdateSequentialDto
      );
    }
  }, [sequentials]);

  const { mutate: updateQuotationSequential } = useMutation({
    mutationFn: (updateSequential: UpdateQuotationSequentialNumber) =>
      api.quotation.updateQuotationsSequentials(updateSequential),
    onSuccess: (data) => {
      toast.success(`mises à jour avec succès`);
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, 'Erreur lors de la mise à jour'));
    }
  });

  const handleSubmit = async () => {
    sequentialsManager.sellingQuotation &&
      updateQuotationSequential(sequentialsManager.sellingQuotation);
  };

  return (
    <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
      <ContentSection
        title={tSettings('sequence.title')}
        desc={tSettings('sequence.card_description')}
        childrenClassName="overflow-auto">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SequentialItem
              title={tSettings('sequence.elements.quotation')}
              prefix={sequentialsManager?.sellingQuotation?.prefix}
              dynamicSequence={
                sequentialsManager?.sellingQuotation?.dynamicSequence || DATE_FORMAT.yyyy
              }
              nextNumber={sequentialsManager?.sellingQuotation?.next || 0}
              loading={isSequentialsPending}
              onSequenceChange={(key: keyof UpdateSequentialDto, value: any) =>
                sequentialsManager.set('sellingQuotation', key, value)
              }
            />
            <SequentialItem
              title={tSettings('sequence.elements.invoice')}
              prefix={sequentialsManager?.sellingInvoice?.prefix}
              dynamicSequence={
                sequentialsManager?.sellingInvoice?.dynamicSequence || DATE_FORMAT.yyyy
              }
              nextNumber={sequentialsManager?.sellingInvoice?.next || 0}
              loading={isSequentialsPending}
              onSequenceChange={(key: keyof UpdateSequentialDto, value: any) =>
                sequentialsManager.set('sellingInvoice', key, value)
              }
            />
          </div>
          <div className="flex justify-end w-full gap-2 mt-5">
            <Button onClick={handleSubmit}>
              {tCommon('commands.save')}
              {isSequentialsPending && <Spinner show />}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                // sequentialsManager.setSequentials(sequentials);
              }}>
              {tCommon('commands.cancel')}
            </Button>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};
