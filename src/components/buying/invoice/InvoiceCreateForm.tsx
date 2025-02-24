import React from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { api, buyingInvoice } from '@/api';
import {
  BUYING_INVOICE_STATUS,
  BuyingArticleInvoiceEntry,
  CreateBuyingInvoiceDto,
} from '@/types/invoices/buying-invoice';
import { Spinner } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import useTax from '@/hooks/content/useTax';
import useFirmChoice from '@/hooks/content/useFirmChoice';
import useBankAccount from '@/hooks/content/useBankAccount';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '@/utils/errors';
import { DISCOUNT_TYPE } from '@/types/enums/discount-types';
import { useInvoiceManager } from '@/components/buying/invoice/hooks/useInvoiceManager';
import { useInvoiceArticleManager } from './hooks/useInvoiceArticleManager';
import useInvoiceSocket from './hooks/useInvoiceSocket';
import { useDebounce } from '@/hooks/other/useDebounce';
import { useInvoiceControlManager } from './hooks/useInvoiceControlManager';
import useCurrency from '@/hooks/content/useCurrency';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import useCabinet from '@/hooks/content/useCabinet';
import useDefaultCondition from '@/hooks/content/useDefaultCondition';
import { ACTIVITY_TYPE } from '@/types/enums/activity-type';
import { DOCUMENT_TYPE } from '@/types/enums/document-type';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import useQuotationChoices from '@/hooks/content/useBuyingQuotationChoice';
import useTaxWithholding from '@/hooks/content/useTaxWitholding';
import dinero from 'dinero.js';
import { createDineroAmountFromFloatWithDynamicCurrency } from '@/utils/money.utils';
import useInvoiceRangeDates from '@/hooks/content/useBuyingInvoiceRangeDates';
import { InvoiceFinancialInformation } from './form/InvoiceFinancialInformation';
import { InvoiceGeneralConditions } from './form/InvoiceGeneralConditions';
import { InvoiceExtraOptions } from './form/InvoiceExtraOptions';
import { InvoiceArticleManagement } from './form/InvoiceArticleManagement';
import { InvoiceGeneralInformation } from './form/InvoiceGeneralInformation';
import { BuyingInvoiceControlSection } from './form/InvoiceControlSection';
import { InvoiceReferenceDocument } from './form/InvoiceReferenceDocument';
import { BUYING_QUOTATION_STATUS } from '@/types/quotations/buying-quotation';

interface InvoiceFormProps {
  className?: string;
  firmId?: string;
}

export const InvoiceCreateForm = ({ className, firmId }: InvoiceFormProps) => {
  // Next.js router
  const router = useRouter();

  // Translations
  const { t: tCommon, ready: commonReady } = useTranslation('common');
  const { t: tInvoicing, ready: invoicingReady } = useTranslation('invoicing');

  // Stores
  const invoiceManager = useInvoiceManager();
  const articleManager = useInvoiceArticleManager();
  const controlManager = useInvoiceControlManager();

  // Set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    setRoutes(
      !firmId
        ? [
            { title: tCommon('menu.buying'), href: '/buying' },
            { title: tInvoicing('invoice.plural'), href: '/buying/invoices' },
            { title: tInvoicing('invoice.new') },
          ]
        : [
            { title: tCommon('menu.contacts'), href: '/contacts' },
            { title: 'Entreprises', href: '/contacts/firms' },
            {
              title: `Entreprise N°${firmId}`,
              href: `/contacts/firm/${firmId}?tab=entreprise`,
            },
            { title: 'Nouvelle Facture' },
          ]
    );
  }, [router.locale, firmId]);

  // Fetch options
  const { firms, isFetchFirmsPending } = useFirmChoice([
    'interlocutorsToFirm',
    'interlocutorsToFirm.interlocutor',
    'paymentCondition',
    'invoicingAddress',
    'deliveryAddress',
    'currency',
  ]);
  const { quotations, isFetchQuotationPending } = useQuotationChoices(BUYING_QUOTATION_STATUS.Invoiced);
  const { cabinet, isFetchCabinetPending } = useCabinet();
  const { taxes, isFetchTaxesPending } = useTax();
  const { currencies, isFetchCurrenciesPending } = useCurrency();
  const { bankAccounts, isFetchBankAccountsPending } = useBankAccount();
  const { defaultCondition, isFetchDefaultConditionPending } = useDefaultCondition(
    ACTIVITY_TYPE.BUYING,
    DOCUMENT_TYPE.INVOICE
  );
  const { taxWithholdings, isFetchTaxWithholdingsPending } = useTaxWithholding();
  const { dateRange, isFetchInvoiceRangePending } = useInvoiceRangeDates(invoiceManager.id);
  // Websocket to listen for server changes related to sequence number
  const { currentSequence, isInvoiceSequencePending } = useInvoiceSocket();

  // Handle Sequential Number
  React.useEffect(() => {
    invoiceManager.set('sequentialNumber', currentSequence);
    invoiceManager.set('bankAccount', bankAccounts.find((a) => a.isMain));
    invoiceManager.set('currency', cabinet?.currency);
  }, [currentSequence]);

  // Perform calculations when the financial information changes
  const digitAfterComma = React.useMemo(() => {
    return invoiceManager.currency?.digitAfterComma || 3;
  }, [invoiceManager.currency]);

  React.useEffect(() => {
    const zero = dinero({ amount: 0, precision: digitAfterComma });
    const articles = articleManager.getArticles() || [];
    const subTotal = articles.reduce((acc, article) => {
      return acc.add(
        dinero({
          amount: createDineroAmountFromFloatWithDynamicCurrency(
            article?.subTotal || 0,
            digitAfterComma
          ),
          precision: digitAfterComma,
        })
      );
    }, zero);
    invoiceManager.set('subTotal', subTotal.toUnit());
    // Calculate total
    const total = articles.reduce((acc, article) => {
      return acc.add(
        dinero({
          amount: createDineroAmountFromFloatWithDynamicCurrency(
            article?.total || 0,
            digitAfterComma
          ),
          precision: digitAfterComma,
        })
      );
    }, zero);

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
        precision: digitAfterComma,
      });
      finalTotal = total.subtract(discountAmount);
    }
    // Apply tax stamp if applicable
    if (invoiceManager.taxStampId) {
      const tax = taxes.find((t) => t.id === invoiceManager.taxStampId);
      if (tax) {
        const taxAmount = dinero({
          amount: createDineroAmountFromFloatWithDynamicCurrency(tax.value || 0, digitAfterComma),
          precision: digitAfterComma,
        });
        finalTotal = finalTotal.add(taxAmount);
      }
    }
    invoiceManager.set('total', finalTotal.toUnit());
  }, [
    articleManager.articles,
    invoiceManager.discount,
    invoiceManager.discountType,
    invoiceManager.taxStampId,
  ]);

  // Create invoice mutator
  const { mutate: createInvoice, isPending: isCreatePending } = useMutation({
    mutationFn: (data: { buyingInvoice: CreateBuyingInvoiceDto; files: File[] }) =>
      api.buyingInvoice.create(data.buyingInvoice, data.files),
    onSuccess: () => {
      if (!firmId) router.push('/buying/invoices');
      else router.push(`/contacts/firm/${firmId}/?tab=invoices`);
      toast.success('Facture crée avec succès');
    },
    onError: (error) => {
      const message = getErrorMessage('invoicing', error, 'Erreur lors de la création de facture');
      toast.error(message);
    },
  });

  const loading =
    isFetchFirmsPending ||
    isFetchTaxesPending ||
    isFetchCabinetPending ||
    isFetchBankAccountsPending ||
    isFetchCurrenciesPending ||
    isFetchDefaultConditionPending ||
    isCreatePending ||
    isFetchQuotationPending ||
    isFetchTaxWithholdingsPending ||
    isFetchInvoiceRangePending ||
    !commonReady ||
    !invoicingReady;
  const { value: debounceLoading } = useDebounce<boolean>(loading, 500);

  // Reset Form
  const globalReset = () => {
    invoiceManager.reset();
    articleManager.reset();
    controlManager.reset();
  };

  // Side effect to reset the form when the component is mounted
  React.useEffect(() => {
    globalReset();
    articleManager.add();
  }, []);

  // Create handler
  const onSubmit = (status: BUYING_INVOICE_STATUS) => {
    const articlesDto: BuyingArticleInvoiceEntry[] = articleManager.getArticles()?.map((article) => ({
      id: article?.id,
      article: {
        title: article?.article?.title || '',
        description: !controlManager.isArticleDescriptionHidden
          ? article?.article?.description || ''
          : '',
      },
      quantity: article?.quantity || 0,
      unit_price: article?.unit_price || 0,
      discount: article?.discount || 0,
      discount_type:
        article?.discount_type === 'PERCENTAGE' ? DISCOUNT_TYPE.PERCENTAGE : DISCOUNT_TYPE.AMOUNT,
      taxes: article?.articleInvoiceEntryTaxes?.map((entry) => entry?.tax?.id),
    }));

    const Buyinginvoice: CreateBuyingInvoiceDto = {
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
        hasTaxWithholding: !controlManager.isTaxWithholdingHidden,
      },

      referenceDocId:invoiceManager?.referenceDocId,
      referenceDocFile:invoiceManager?.referenceDocFile,
    };

    const validation = api.buyingInvoice.validate(Buyinginvoice, dateRange);
    if (validation.message) {
      toast.error(validation.message);
    } else {
      if (controlManager.isGeneralConditionsHidden) delete Buyinginvoice.generalConditions;
      createInvoice({
        buyingInvoice: Buyinginvoice,
        files: invoiceManager.uploadedFiles.filter((u) => !u.upload).map((u) => u.file),
      });
      globalReset();
    }
  };

  // Component representation
  if (debounceLoading) return <Spinner className="h-screen" show={loading} />;
  return (
    <div className={cn('overflow-auto px-10 py-6', className)}>
      {/* Main Container */}
      <div className={cn('block xl:flex gap-4', isCreatePending ? 'pointer-events-none' : '')}>
        {/* First Card */}
        <div className="w-full h-auto flex flex-col xl:w-9/12">
          <ScrollArea className=" max-h-[calc(100vh-120px)] border rounded-lg">
            <Card className="border-0">
              <CardContent className="p-5">

                {/* Reference Document */}

                <InvoiceReferenceDocument className='my-5'/>
                {/* General Information */}
                <InvoiceGeneralInformation
                  className="my-5"
                  firms={firms}
                  isInvoicingAddressHidden={controlManager.isInvoiceAddressHidden}
                  isDeliveryAddressHidden={controlManager.isDeliveryAddressHidden}
                  loading={isFetchFirmsPending || isInvoiceSequencePending}
                />
                {/* Article Management */}
                <InvoiceArticleManagement
                  className="my-5"
                  taxes={taxes}
                  isArticleDescriptionHidden={controlManager.isArticleDescriptionHidden}
                />
                {/* File Upload & Notes */}
                <InvoiceExtraOptions />
                {/* Other Information */}
                <div className="flex gap-10 mt-5">
                  <InvoiceGeneralConditions
                    className="flex flex-col w-2/3 my-auto"
                    isPending={debounceLoading}
                    hidden={controlManager.isGeneralConditionsHidden}
                    defaultCondition={defaultCondition}
                  />
                  <div className="w-1/3 my-auto">
                    {/* Final Financial Information */}
                    <InvoiceFinancialInformation
                      subTotal={invoiceManager.subTotal}
                      status={BUYING_INVOICE_STATUS.Nonexistent}
                      currency={invoiceManager.currency}
                      taxes={taxes.filter((tax) => !tax.isRate)}
                      taxWithholdings={taxWithholdings}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
        {/* Second Card */}
        <div className="w-full xl:mt-0 xl:w-3/12">
          <ScrollArea className=" max-h-[calc(100vh-120px)] border rounded-lg">
            <Card className="border-0">
              <CardContent className="p-5">
                {/* Control Section */}
                <BuyingInvoiceControlSection
                  bankAccounts={bankAccounts}
                  currencies={currencies}
                  quotations={quotations}
                  taxWithholdings={taxWithholdings}
                  handleSubmitDraft={() => onSubmit(BUYING_INVOICE_STATUS.Draft)}
                  handleSubmitValidated={() => onSubmit(BUYING_INVOICE_STATUS.Validated)}
                  handleSubmitSent={() => onSubmit(BUYING_INVOICE_STATUS.Sent)}
                  reset={globalReset}
                  loading={debounceLoading}
                />
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
