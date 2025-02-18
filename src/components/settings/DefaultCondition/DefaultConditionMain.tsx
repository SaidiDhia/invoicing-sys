import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { DefaultConditionItem } from './DefaultConditionItem';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import React from 'react';
import { useDefaultConditionManager } from './hooks/useDefaultConditionManager';
import { UpdateDefaultConditionDto } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';
import { ACTIVITY_TYPE } from '@/types/enums/activity-type';
import { Spinner } from '@/components/common';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { useRouter } from 'next/router';
import ContentSection from '@/components/common/ContentSection';

interface DefaultConditionMainProps {
  className?: string;
}
export const DefaultConditionMain: React.FC<DefaultConditionMainProps> = ({ className }) => {
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
      { title: tCommon('settings.system.default_condition') }
    ]);
  }, [router.locale]);

  const defaultConditionManager = useDefaultConditionManager();

  const {
    isPending: isDefaultConditionsPending,
    data: defaultConditions,
    refetch: refetchDefaultConditions
  } = useQuery({
    queryKey: ['default-conditions'],
    queryFn: () => api.defaultCondition.find()
  });

  React.useEffect(() => {
    if (defaultConditions) {
      defaultConditionManager.setDefaultConditions(defaultConditions);
    }
  }, [defaultConditions]);

  const { mutate: updateDefaultConditions, isPending: isUpdatePending } = useMutation({
    mutationFn: (
      updateDefaultConditions: UpdateDefaultConditionDto | UpdateDefaultConditionDto[]
    ) => api.defaultCondition.update(updateDefaultConditions),
    onSuccess: () => {
      toast.success(tSettings('default_condition.action_edit_success'));
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, tSettings('default_condition.action_edit_failure')));
    }
  });

  const handleSubmitUpdate = () => {
    updateDefaultConditions(defaultConditionManager.defaultConditions);
  };

  return (
    <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
      <ContentSection
        title={tSettings('default_condition.singular')}
        desc={tSettings('default_condition.card_description')}
        childrenClassName="overflow-auto">
        <div>
          <div className="mt-5 px-2">
            <h1 className="font-medium text-lg border-b pb-2">
              {tSettings('default_condition.section.selling')} :
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {defaultConditionManager.defaultConditions
                ?.filter((condition) => {
                  return condition.activity_type == ACTIVITY_TYPE.SELLING;
                })
                .map((condition) => {
                  return (
                    <DefaultConditionItem
                      key={condition.id}
                      title={tSettings(`default_condition.elements.${condition.document_type}`)}
                      value={condition.value || ''}
                      onChange={(value) => {
                        defaultConditionManager.setDefaultConditionById(condition.id || 0, value);
                        refetchDefaultConditions();
                      }}
                    />
                  );
                })}
            </div>
          </div>
          <div className="mt-5 px-2">
            <h1 className="font-medium text-lg border-b pb-2">
              {tSettings('default_condition.section.buying')} :
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {defaultConditionManager.defaultConditions
                ?.filter((condition) => {
                  return condition.activity_type == ACTIVITY_TYPE.BUYING;
                })
                .map((condition) => {
                  return (
                    <DefaultConditionItem
                      key={condition.id}
                      title={tSettings(`default_condition.elements.${condition.document_type}`)}
                      value={condition.value || ''}
                      onChange={(value) => {
                        defaultConditionManager.setDefaultConditionById(condition.id || 0, value);
                        refetchDefaultConditions();
                      }}
                    />
                  );
                })}
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <Button className="ml-3" onClick={handleSubmitUpdate}>
              {tCommon('commands.save')}
              <Spinner className="ml-2" size={'small'} show={isUpdatePending} />
            </Button>
            <Button variant="secondary" className="border-2 ml-3">
              {tCommon('commands.cancel')}
            </Button>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};
