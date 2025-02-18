import React from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/api';
import {
  ArticleInvoiceEntry,
  INVOICE_STATUS,
  Invoice,
  InvoiceUploadedFile,
  QUOTATION_STATUS,
  UpdateInvoiceDto
} from '@/types';
import { Spinner } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import useTax from '@/hooks/content/useTax';
import useFirmChoice from '@/hooks/content/useFirmChoice';
import useBankAccount from '@/hooks/content/useBankAccount';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/utils/errors';
import { DISCOUNT_TYPE } from '@/types/enums/discount-types';
import { useDebounce } from '@/hooks/other/useDebounce';
import { useInvoiceManager } from './hooks/useInvoiceManager';
import { useInvoiceArticleManager } from './hooks/useInvoiceArticleManager';
import { useInvoiceControlManager } from './hooks/useInvoiceControlManager';
import _ from 'lodash';
import useCurrency from '@/hooks/content/useCurrency';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InvoiceExtraOptions } from './form/InvoiceExtraOptions';
import { InvoiceGeneralConditions } from './form/InvoiceGeneralConditions';
import useDefaultCondition from '@/hooks/content/useDefaultCondition';
import { ACTIVITY_TYPE } from '@/types/enums/activity-type';
import { DOCUMENT_TYPE } from '@/types/enums/document-type';
import { useRouter } from 'next/router';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import useInitializedState from '@/hooks/use-initialized-state';
import { useQuotationManager } from '../quotation/hooks/useQuotationManager';
import useQuotationChoices from '@/hooks/content/useQuotationChoice';
import { InvoiceGeneralInformation } from './form/InvoiceGeneralInformation';
import { InvoiceArticleManagement } from './form/InvoiceArticleManagement';
import { InvoiceFinancialInformation } from './form/InvoiceFinancialInformation';
import { InvoiceControlSection } from './form/InvoiceControlSection';
import useTaxWithholding from '@/hooks/content/useTaxWitholding';
import dinero from 'dinero.js';
import { createDineroAmountFromFloatWithDynamicCurrency } from '@/utils/money.utils';
import useInvoiceRangeDates from '@/hooks/content/useInvoiceRangeDates';

interface InvoiceFormProps {
  className?: string;
  invoiceId: string;
}

export const InvoiceUpdateForm = ({ className, invoiceId }: InvoiceFormProps) => {
  //next-router
  const router = useRouter();

  //translations
  const { t: tCommon, ready: commonReady } = useTranslation('common');
  const { t: tInvoicing, ready: invoicingReady } = useTranslation('invoicing');

  // Stores
  const invoiceManager = useInvoiceManager();
  const quotationManager = useQuotationManager();
  const controlManager = useInvoiceControlManager();
  const articleManager = useInvoiceArticleManager();

  //Fetch options
  const {
    isPending: isFetchPending,
    data: invoiceResp,
    refetch: refetchInvoice
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => api.invoice.findOne(parseInt(invoiceId))
  });
  const invoice = React.useMemo(() => {
    return invoiceResp || null;
  }, [invoiceResp]);

  //set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    if (invoice?.sequential)
      setRoutes([
        { title: tCommon('menu.selling'), href: '/selling' },
        { title: tInvoicing('invoice.plural'), href: '/selling/invoices' },
        { title: tInvoicing('invoice.singular') + ' N° ' + invoice?.sequential }
      ]);
  }, [router.locale, invoice?.sequential]);

  //recognize if the form can be edited
  const editMode = React.useMemo(() => {
    const editModeStatuses = [INVOICE_STATUS.Validated, INVOICE_STATUS.Draft];
    return invoice?.status && editModeStatuses.includes(invoice?.status);
  }, [invoice]);

  // Fetch options
  const { firms, isFetchFirmsPending } = useFirmChoice([
    'interlocutorsToFirm',
    'interlocutorsToFirm.interlocutor',
    'invoicingAddress',
    'deliveryAddress',
    'currency'
  ]);
  const { quotations, isFetchQuotationPending } = useQuotationChoices(QUOTATION_STATUS.Invoiced);
  const { taxes, isFetchTaxesPending } = useTax();
  const { currencies, isFetchCurrenciesPending } = useCurrency();
  const { bankAccounts, isFetchBankAccountsPending } = useBankAccount();
  const { taxWithholdings, isFetchTaxWithholdingsPending } = useTaxWithholding();
  const { defaultCondition, isFetchDefaultConditionPending } = useDefaultCondition(
    ACTIVITY_TYPE.SELLING,
    DOCUMENT_TYPE.INVOICE
  );
  const { dateRange, isFetchInvoiceRangePending } = useInvoiceRangeDates(invoiceManager.id);
  console.log(dateRange);
  const fetching =
    isFetchPending ||
    isFetchFirmsPending ||
    isFetchTaxesPending ||
    isFetchCurrenciesPending ||
    isFetchBankAccountsPending ||
    isFetchDefaultConditionPending ||
    isFetchQuotationPending ||
    isFetchTaxWithholdingsPending ||
    isFetchInvoiceRangePending ||
    !commonReady ||
    !invoicingReady;
  const { value: debounceFetching } = useDebounce<boolean>(fetching, 500);

  // perform calculations when the financialy Information are changed
  const digitAfterComma = React.useMemo(() => {
    return invoiceManager.currency?.digitAfterComma || 3;
  }, [invoiceManager.currency]);
  React.useEffect(() => {
    const zero = dinero({ amount: 0, precision: digitAfterComma });
    const articles = articleManager.getArticles() || [];
    const subTotal = articles?.reduce((acc, article) => {
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
    invoiceManager.set('subTotal', subTotal.toUnit());
    // Calculate total
    const total = articles?.reduce(
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
    if (invoiceManager.discountType === DISCOUNT_TYPE.PERCENTAGE) {
      const discountAmount = total.multiply(invoiceManager.discount / 100);
      finalTotal = total.subtract(discountAmount);
    } else {
      const discountAmount = dinero({
        amount: createDineroAmountFromFloatWithDynamicCurrency(
          invoiceManager?.discount || 0,
          digitAfterComma
        ),
        precision: digitAfterComma
      });
      finalTotal = total.subtract(discountAmount);
    }
    // Apply tax stamp if applicable
    if (invoiceManager.taxStampId) {
      const tax = taxes.find((t) => t.id === invoiceManager.taxStampId);
      if (tax) {
        const taxAmount = dinero({
          amount: createDineroAmountFromFloatWithDynamicCurrency(tax.value || 0, digitAfterComma),
          precision: digitAfterComma
        });
        finalTotal = finalTotal.add(taxAmount);
      }
    }
    invoiceManager.set('total', finalTotal.toUnit());
  }, [
    articleManager.articles,
    invoiceManager.discount,
    invoiceManager.discountType,
    invoiceManager.taxStampId
  ]);

  //full invoice setter across multiple stores
  const setInvoiceData = (data: Partial<Invoice & { files: InvoiceUploadedFile[] }>) => {
    //invoice infos
    data && invoiceManager.setInvoice(data, firms, bankAccounts);
    data?.quotation && quotationManager.set('sequential', data?.quotation?.sequential);
    //invoice meta infos
    controlManager.setControls({
      isBankAccountDetailsHidden: !data?.invoiceMetaData?.hasBankingDetails,
      isInvoiceAddressHidden: !data?.invoiceMetaData?.showInvoiceAddress,
      isDeliveryAddressHidden: !data?.invoiceMetaData?.showDeliveryAddress,
      isArticleDescriptionHidden: !data?.invoiceMetaData?.showArticleDescription,
      isGeneralConditionsHidden: !data?.invoiceMetaData?.hasGeneralConditions,
      isTaxStampHidden: !data?.invoiceMetaData?.hasTaxStamp,
      isTaxWithholdingHidden: !data?.invoiceMetaData?.hasTaxWithholding
    });
    //invoice article infos
    articleManager.setArticles(data?.articleInvoiceEntries || []);
  };

  //initialized value to detect changement whiie modifying the invoice
  const { isDisabled, globalReset } = useInitializedState({
    data: invoice || ({} as Partial<Invoice & { files: InvoiceUploadedFile[] }>),
    getCurrentData: () => {
      return {
        invoice: invoiceManager.getInvoice(),
        articles: articleManager.getArticles(),
        controls: controlManager.getControls()
      };
    },
    setFormData: (data: Partial<Invoice & { files: InvoiceUploadedFile[] }>) => {
      setInvoiceData(data);
    },
    resetData: () => {
      invoiceManager.reset();
      articleManager.reset();
      controlManager.reset();
    },
    loading: fetching
  });

  //update invoice mutator
  const { mutate: updateInvoice, isPending: isUpdatingPending } = useMutation({
    mutationFn: (data: { invoice: UpdateInvoiceDto; files: File[] }) =>
      api.invoice.update(data.invoice, data.files),
    onSuccess: () => {
      refetchInvoice();
      toast.success('Facture modifié avec succès');
    },
    onError: (error) => {
      const message = getErrorMessage(
        'invoicing',
        error,
        'Erreur lors de la modification de Facture'
      );
      toast.error(message);
    }
  });

  //update handler
  const onSubmit = (status: INVOICE_STATUS) => {
    const articlesDto: ArticleInvoiceEntry[] = articleManager.getArticles()?.map((article) => ({
      article: {
        title: article?.article?.title,
        description: controlManager.isArticleDescriptionHidden ? '' : article?.article?.description
      },
      quantity: article?.quantity || 0,
      unit_price: article?.unit_price || 0,
      discount: article?.discount || 0,
      discount_type:
        article?.discount_type === 'PERCENTAGE' ? DISCOUNT_TYPE.PERCENTAGE : DISCOUNT_TYPE.AMOUNT,
      taxes: article?.articleInvoiceEntryTaxes?.map((entry) => entry?.tax?.id) || []
    }));
    const invoice: UpdateInvoiceDto = {
      id: invoiceManager?.id,
      date: invoiceManager?.date?.toString(),
      dueDate: invoiceManager?.dueDate?.toString(),
      object: invoiceManager?.object,
      cabinetId: invoiceManager?.firm?.cabinetId,
      firmId: invoiceManager?.firm?.id,
      interlocutorId: invoiceManager?.interlocutor?.id,
      currencyId: invoiceManager?.currency?.id,
      bankAccountId: !controlManager?.isBankAccountDetailsHidden
        ? invoiceManager?.bankAccount?.id
        : undefined,
      status,
      generalConditions: !controlManager.isGeneralConditionsHidden
        ? invoiceManager?.generalConditions
        : '',
      notes: invoiceManager?.notes,
      articleInvoiceEntries: articlesDto,
      discount: invoiceManager?.discount,
      discount_type:
        invoiceManager?.discountType === 'PERCENTAGE'
          ? DISCOUNT_TYPE.PERCENTAGE
          : DISCOUNT_TYPE.AMOUNT,
      quotationId: invoiceManager?.quotationId,
      taxStampId: invoiceManager?.taxStampId,
      taxWithholdingId: invoiceManager?.taxWithholdingId,
      invoiceMetaData: {
        showDeliveryAddress: !controlManager?.isDeliveryAddressHidden,
        showInvoiceAddress: !controlManager?.isInvoiceAddressHidden,
        showArticleDescription: !controlManager?.isArticleDescriptionHidden,
        hasBankingDetails: !controlManager.isBankAccountDetailsHidden,
        hasGeneralConditions: !controlManager.isGeneralConditionsHidden,
        hasTaxStamp: !controlManager.isTaxStampHidden,
        hasTaxWithholding: !controlManager.isTaxWithholdingHidden
      },
      uploads: invoiceManager.uploadedFiles.filter((u) => !!u.upload).map((u) => u.upload)
    };
    const validation = api.invoice.validate(invoice, dateRange);
    if (validation.message) {
      toast.error(validation.message, { position: validation.position || 'bottom-right' });
    } else {
      updateInvoice({
        invoice,
        files: invoiceManager.uploadedFiles.filter((u) => !u.upload).map((u) => u.file)
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
                <InvoiceGeneralInformation
                  className="my-5"
                  firms={firms}
                  isInvoicingAddressHidden={controlManager.isInvoiceAddressHidden}
                  isDeliveryAddressHidden={controlManager.isDeliveryAddressHidden}
                  edit={editMode}
                  loading={debounceFetching}
                />
                {/* Article Management */}
                <InvoiceArticleManagement
                  className="my-5"
                  taxes={taxes}
                  edit={editMode}
                  isArticleDescriptionHidden={controlManager.isArticleDescriptionHidden}
                  loading={debounceFetching}
                />
                {/* File Upload & Notes */}
                <InvoiceExtraOptions />
                {/* Other Information */}
                <div className="flex gap-10 m-5">
                  <InvoiceGeneralConditions
                    className="flex flex-col w-2/3 my-auto"
                    isPending={debounceFetching}
                    hidden={controlManager.isGeneralConditionsHidden}
                    defaultCondition={defaultCondition}
                    edit={editMode}
                  />
                  <div className="w-1/3 my-auto">
                    {/* Final Financial Information */}
                    <InvoiceFinancialInformation
                      subTotal={invoiceManager.subTotal}
                      status={invoiceManager.status}
                      currency={invoiceManager.currency}
                      taxes={taxes.filter((tax) => !tax.isRate)}
                      taxWithholdings={taxWithholdings}
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
            <Card className="border-0">
              <CardContent className="p-5">
                <InvoiceControlSection
                  status={invoiceManager.status}
                  isDataAltered={isDisabled}
                  bankAccounts={bankAccounts}
                  currencies={currencies}
                  quotations={quotations}
                  payments={invoice?.payments || []}
                  taxWithholdings={taxWithholdings}
                  handleSubmit={() => onSubmit(invoiceManager.status)}
                  handleSubmitDraft={() => onSubmit(INVOICE_STATUS.Draft)}
                  handleSubmitValidated={() => onSubmit(INVOICE_STATUS.Validated)}
                  handleSubmitSent={() => onSubmit(INVOICE_STATUS.Sent)}
                  loading={debounceFetching}
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
