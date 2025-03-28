import React from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/api';

import { Spinner } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import useTax from '@/hooks/content/useTax';
import useFirmChoice from '@/hooks/content/useFirmChoice';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/utils/errors';
import { DISCOUNT_TYPE } from '@/types/enums/discount-types';
import { useDebounce } from '@/hooks/other/useDebounce';
import { useQuotationManager } from './hooks/useQuotationManager';
import { useQuotationArticleManager } from './hooks/useQuotationArticleManager';
import { useQuotationControlManager } from './hooks/useQuotationControlManager';
import _ from 'lodash';
import useCurrency from '@/hooks/content/useCurrency';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuotationExtraOptions } from './form/QuotationExtraOptions';
import { QuotationGeneralConditions } from './form/QuotationGeneralConditions';
import useDefaultCondition from '@/hooks/content/useDefaultCondition';
import { ACTIVITY_TYPE } from '@/types/enums/activity-type';
import { DOCUMENT_TYPE } from '@/types/enums/document-type';
import { useRouter } from 'next/router';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import useInitializedState from '@/hooks/use-initialized-state';
import { QuotationGeneralInformation } from './form/QuotationGeneralInformation';
import { QuotationArticleManagement } from './form/QuotationArticleManagement';
import { QuotationFinancialInformation } from './form/QuotationFinancialInformation';
import { QuotationControlSection } from './form/QuotationControlSection';
import dinero from 'dinero.js';
import { createDineroAmountFromFloatWithDynamicCurrency } from '@/utils/money.utils';
import { BUYING_QUOTATION_STATUS, BuyingArticleQuotationEntry, BuyingQuotation, BuyingQuotationUploadedFile, UpdateBuyingQuotationDto } from '@/types/quotations/buying-quotation';
import { QuotationReferenceDocument } from './form/QuotationReferenceDocument';
import useFirmBankAccount from '@/hooks/content/useFirmBankAccount';

interface QuotationFormProps {
  className?: string;
  quotationId: string;
}

export const QuotationUpdateForm = ({ className, quotationId }: QuotationFormProps) => {
  //next-router
  const router = useRouter();

  //translations
  const { t: tCommon, ready: commonReady } = useTranslation('common');
  const { t: tInvoicing, ready: invoicingReady } = useTranslation('invoicing');

  // Stores
  const quotationManager = useQuotationManager();
  const controlManager = useQuotationControlManager();
  const articleManager = useQuotationArticleManager();

  //Fetch options
  const {
    isPending: isFetchPending,
    data: quotationResp,
    refetch: refetchQuotation
  } = useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: async () => {
      const quotation = await api.buyingQuotation.findOne(parseInt(quotationId));
  
      if (quotation.referenceDocId) {
        const blob = await api.upload.fetchBlobById(quotation.referenceDocId);
        if (!blob) {
          throw new Error('Impossible de récupérer le fichier.');
        }
        const file=new File([blob], quotation.referenceDoc?.filename|| "referenceDoc", { type: blob.type })

        quotationManager.set('referenceDocFile', file); 

      }
  
      return quotation;
    }
  });
  const quotation = React.useMemo(() => {
    return quotationResp || null;
  }, [quotationResp]);

  
  //set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    if (quotation?.sequential || quotation?.id)
      setRoutes([
        { title: tCommon('menu.buying'), href: '/buying' },
        { title: tInvoicing('quotation.plural'), href: '/buying/quotations' },
        { title: quotation?.sequential ? tInvoicing('quotation.singular') + ' N° ' + quotation?.sequential : tInvoicing('quotation.add_button_label') }
      ]);
  }, [router.locale, quotation?.sequential]);

  //recognize if the form can be edited
  const editMode = React.useMemo(() => {
    const editModeStatuses = [BUYING_QUOTATION_STATUS.Validated, BUYING_QUOTATION_STATUS.Draft];
    return quotation?.status && editModeStatuses.includes(quotation?.status);
  }, [quotation]);

  // Fetch options
  const { firms, isFetchFirmsPending } = useFirmChoice([
    'interlocutorsToFirm',
    'interlocutorsToFirm.interlocutor',
    'invoicingAddress',
    'deliveryAddress',
    'currency'
  ]);
  const { taxes, isFetchTaxesPending } = useTax();
  const { currencies, isFetchCurrenciesPending } = useCurrency();
  const { firmBankAccounts, isFetchFirmBankAccountsPending } = useFirmBankAccount();
  const { defaultCondition, isFetchDefaultConditionPending } = useDefaultCondition(
    ACTIVITY_TYPE.BUYING,
    DOCUMENT_TYPE.QUOTATION
  );
  const fetching =
    isFetchPending ||
    isFetchFirmsPending ||
    isFetchTaxesPending ||
    isFetchCurrenciesPending ||
    isFetchFirmBankAccountsPending ||
    isFetchDefaultConditionPending ||
    !commonReady ||
    !invoicingReady;
  const { value: debounceFetching } = useDebounce<boolean>(fetching, 500);

  const digitAfterComma = React.useMemo(() => {
    return quotationManager.currency?.digitAfterComma || 3;
  }, [quotationManager.currency]);

  // perform calculations when the financialy Information are changed
  React.useEffect(() => {
    const zero = dinero({ amount: 0, precision: digitAfterComma });
    // Calculate subTotal
    const subTotal = articleManager.getArticles()?.reduce((acc, article) => {
      return acc.add(
        dinero({
          amount: createDineroAmountFromFloatWithDynamicCurrency(
            article?.subTotal || 0,
            digitAfterComma
          ),
          precision: digitAfterComma
        })
      );
    }, zero);
    quotationManager.set('subTotal', subTotal.toUnit());
    // Calculate total
    const total = articleManager.getArticles()?.reduce(
      (acc, article) =>
        acc.add(
          dinero({
            amount: createDineroAmountFromFloatWithDynamicCurrency(
              article?.total || 0,
              digitAfterComma
            ),
            precision: digitAfterComma
          })
        ),
      zero
    );
    let finalTotal = total;
    // Apply discount
    if (quotationManager.discountType === DISCOUNT_TYPE.PERCENTAGE) {
      const discountAmount = total.multiply(quotationManager.discount / 100);
      finalTotal = total.subtract(discountAmount);
    } else {
      const discountAmount = dinero({
        amount: createDineroAmountFromFloatWithDynamicCurrency(
          quotationManager?.discount || 0,
          digitAfterComma
        ),
        precision: digitAfterComma
      });
      finalTotal = total.subtract(discountAmount);
    }
    quotationManager.set('total', finalTotal.toUnit());
  }, [articleManager.articles, quotationManager.discount, quotationManager.discountType]);

  //full quotation setter across multiple stores
  const setQuotationData = (data: Partial<BuyingQuotation & { files: BuyingQuotationUploadedFile[] }>) => {
    //quotation infos

    data && quotationManager.setQuotation({
      ...data,
      referenceDoc: data.referenceDoc,
      referenceDocId: data.referenceDocId,
      referenceDocFile: data.referenceDocFile,
    }, firms, firmBankAccounts);

    //quotation meta infos
    controlManager.setControls({
      isBankAccountDetailsHidden: !data?.quotationMetaData?.hasBankingDetails,
      isArticleDescriptionHidden: !data?.quotationMetaData?.showArticleDescription,
      isGeneralConditionsHidden: !data?.quotationMetaData?.hasGeneralConditions
    });
    //quotation article infos
    articleManager.setArticles(data?.articleQuotationEntries || []);
  };

  //initialized value to detect changement whiie modifying the quotation
  const { isDisabled, globalReset } = useInitializedState({
    data: quotation || ({} as Partial<BuyingQuotation & { files: BuyingQuotationUploadedFile[] }>),
    getCurrentData: () => {
      return {
        quotation: quotationManager.getQuotation(),
        articles: articleManager.getArticles(),
        controls: controlManager.getControls(),
      };
    },
    setFormData: (data: Partial<BuyingQuotation & { files: BuyingQuotationUploadedFile[] }>) => {
      setQuotationData(data);
    },
    resetData: () => {
      quotationManager.reset();
      articleManager.reset();
      controlManager.reset();
    },
    loading: fetching
  });

  //update quotation mutator
  const { mutate: updateQuotation, isPending: isUpdatingPending } = useMutation({
    mutationFn: (data: { quotation: UpdateBuyingQuotationDto; files: File[] }) =>
      api.buyingQuotation.update(data.quotation, data.files),
    onSuccess: (data) => {
      if (data.status == BUYING_QUOTATION_STATUS.Invoiced) {
        toast.success('Devis facturé avec succès');
        router.push(`/buying/invoice/${data.invoices[data?.invoices?.length - 1].id}`);
      } else {
        toast.success('Devis modifié avec succès');
        router.push('/buying/quotations');

      }
      refetchQuotation();
    },
    onError: (error) => {
      const message = getErrorMessage('contacts', error, 'Erreur lors de la modification de devis');
      toast.error(message);
    }
  });

  //update handler
  const onSubmit = async (status: BUYING_QUOTATION_STATUS) => {
    const articlesDto: BuyingArticleQuotationEntry[] = articleManager.getArticles()?.map((article) => ({
      article: {
        title: article?.article?.title,
        description: controlManager.isArticleDescriptionHidden ? '' : article?.article?.description
      },
      quantity: article?.quantity || 0,
      unit_price: article?.unit_price || 0,
      discount: article?.discount || 0,
      discount_type:
        article?.discount_type === 'PERCENTAGE' ? DISCOUNT_TYPE.PERCENTAGE : DISCOUNT_TYPE.AMOUNT,
      taxes: article?.articleQuotationEntryTaxes?.map((entry) => entry?.tax?.id) || []
    }));

    const quotation: UpdateBuyingQuotationDto = {
      id: quotationManager?.id,
      sequential:quotationManager?.sequential,
      date: quotationManager?.date?.toString(),
      dueDate: quotationManager?.dueDate?.toString(),
      object: quotationManager?.object,
      cabinetId: quotationManager?.firm?.cabinetId,
      firmId: quotationManager?.firm?.id,
      interlocutorId: quotationManager?.interlocutor?.id,
      currencyId: quotationManager?.currency?.id,
      bankAccountId: !controlManager?.isBankAccountDetailsHidden
        ? quotationManager?.bankAccount?.id
        : null,
      status,
      generalConditions: !controlManager.isGeneralConditionsHidden
        ? quotationManager?.generalConditions
        : '',
      notes: quotationManager?.notes,
      articleQuotationEntries: articlesDto,
      discount: quotationManager?.discount,
      discount_type:
        quotationManager?.discountType === 'PERCENTAGE'
          ? DISCOUNT_TYPE.PERCENTAGE
          : DISCOUNT_TYPE.AMOUNT,
      quotationMetaData: {

        showArticleDescription: !controlManager?.isArticleDescriptionHidden,
        hasBankingDetails: !controlManager.isBankAccountDetailsHidden,
        hasGeneralConditions: !controlManager.isGeneralConditionsHidden
      },
      referenceDocId: quotationManager.referenceDocId,
      referenceDocFile: quotationManager.referenceDocFile,

      uploads: quotationManager.uploadedFiles.filter((u) => !!u.upload).map((u) => u.upload)
    };
    const validation = await api.buyingQuotation.validate(quotation);
    if (validation.message) {
      toast.error(validation.message, { position: validation.position || 'bottom-right' });
    } else {
      updateQuotation({
        quotation,
        files: quotationManager.uploadedFiles.filter((u) => !u.upload).map((u) => u.file)
      });
    }
  };

  //component representation
  if (debounceFetching) return <Spinner className="h-screen" />;
  return (
    <div className={cn('overflow-auto px-10 py-6', className)}>
      {/* Main Container */}
      <div className={cn('block xl:flex gap-4', isUpdatingPending ? 'pointer-events-none' : '')}>
        {/* First Card */}
        <div className="w-full h-auto flex flex-col xl:w-9/12">
          <ScrollArea className=" max-h-[calc(100vh-120px)] border rounded-lg">
            <Card className="border-0">
              <CardContent className="p-5">
                {/* Reference Document */}
                <QuotationReferenceDocument edit={editMode} />
                {/* General Information */}
                <QuotationGeneralInformation
                  className="my-5"
                  firms={firms}
                  edit={editMode}
                  loading={debounceFetching}
                />
                {/* Article Management */}
                <QuotationArticleManagement
                  className="my-5"
                  taxes={taxes}
                  edit={editMode}
                  isArticleDescriptionHidden={controlManager.isArticleDescriptionHidden}
                  loading={debounceFetching}
                />
                {/* File Upload & Notes */}
                <QuotationExtraOptions />
                {/* Other Information */}
                <div className="flex gap-10 m-5">
                  <QuotationGeneralConditions
                    className="flex flex-col w-2/3 my-auto"
                    isPending={debounceFetching}
                    hidden={controlManager.isGeneralConditionsHidden}
                    defaultCondition={defaultCondition}
                    edit={editMode}
                  />
                  <div className="w-1/3 my-auto">
                    {/* Final Financial Information */}
                    <QuotationFinancialInformation
                      subTotal={quotationManager.subTotal}
                      total={quotationManager.total}
                      currency={quotationManager.currency}
                      loading={debounceFetching}
                      edit={editMode}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
        {/* Second Card */}
        <div className="w-full xl:mt-0 xl:w-3/12 ">
          <ScrollArea className=" max-h-[calc(100vh-120px)] border rounded-lg">
            <Card className="border-0 ">
              <CardContent className="p-5">
                <QuotationControlSection
                  status={quotationManager.status}
                  isDataAltered={isDisabled}
                  bankAccounts={firmBankAccounts}
                  currencies={currencies}
                  invoices={quotation?.invoices || []}
                  handleSubmit={() => onSubmit(quotationManager.status)}
                  handleSubmitDraft={() => onSubmit(BUYING_QUOTATION_STATUS.Draft)}
                  handleSubmitValidated={() => onSubmit(BUYING_QUOTATION_STATUS.Validated)}
                  loading={debounceFetching}
                  refetch={refetchQuotation}
                  reset={globalReset}
                  edit={editMode}
                />
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
