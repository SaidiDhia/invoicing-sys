import React from 'react';
import { api } from '@/api';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/common';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fromSequentialObjectToString } from '@/utils/string.utils';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';
import { useRouter } from 'next/router';
import {
  BankAccount,
  Currency,
  TaxWithholding
} from '@/types';
import {  BUYING_INVOICE_STATUS, DuplicateBuyingInvoiceDto,}from '@/types/invoices/buying-invoice'
import { BUYING_INVOICE_LIFECYCLE_ACTIONS } from '@/constants/buying-invoice.lifecycle';
import { InvoicePaymentList } from './InvoicePaymentList';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';
import { BuyingQuotation } from '@/types/quotations/buying-quotation';
import { BuyingPaymentInvoiceEntry } from '@/types/payments/buying-payment';
import { useInvoiceArticleManager } from '../hooks/useInvoiceArticleManager';
import { useInvoiceManager } from '../hooks/useInvoiceManager';
import { useInvoiceControlManager } from '../hooks/useInvoiceControlManager';
import { useMutation } from '@tanstack/react-query';
import { InvoiceDeleteDialog } from '../dialogs/InvoiceDeleteDialog';
import { InvoiceDuplicateDialog } from '../dialogs/InvoiceDuplicateDialog';
import { InvoiceDownloadDialog } from '../dialogs/InvoiceDownloadDialog';
import { InvoiceActionDialog } from '../dialogs/InvoiceActionDialog';

interface InvoiceLifecycle {
  label: string;
  key: string;
  variant: 'default' | 'outline';
  icon: React.ReactNode;
  onClick?: () => void;
  loading: boolean;
  when: {
    membership: 'IN' | 'OUT';
    set: (BUYING_INVOICE_STATUS | undefined)[];
  };
}

interface InvoiceControlSectionProps {
  className?: string;
  status?: BUYING_INVOICE_STATUS;
  isDataAltered?: boolean;
  bankAccounts: BankAccount[];
  currencies: Currency[];
  quotations: BuyingQuotation[];
  payments?: BuyingPaymentInvoiceEntry[];
  taxWithholdings?: TaxWithholding[];
  handleSubmit?: () => void;
  handleSubmitDraft: () => void;
  handleSubmitValidated: () => void;
  handleSubmitSent: () => void;
  handleSubmitDuplicate?: () => void;
  reset: () => void;
  loading?: boolean;
  edit?: boolean;
}

export const BuyingInvoiceControlSection = ({
  className,
  status = undefined,
  isDataAltered,
  bankAccounts,
  currencies,
  quotations,
  payments = [],
  taxWithholdings,
  handleSubmit,
  handleSubmitDraft,
  handleSubmitValidated,
  handleSubmitSent,
  reset,
  loading,
  edit = true
}: InvoiceControlSectionProps) => {
  const router = useRouter();
  const { t: tInvoicing } = useTranslation('invoicing');
  const { t: tCommon } = useTranslation('common');
  const { t: tCurrency } = useTranslation('currency');

  const invoiceManager = useInvoiceManager();
  const controlManager = useInvoiceControlManager();
  const articleManager = useInvoiceArticleManager();

  //action dialog
  const [actionDialog, setActionDialog] = React.useState<boolean>(false);
  const [actionName, setActionName] = React.useState<string>();
  const [action, setAction] = React.useState<() => void>(() => {});

  //download dialog
  const [downloadDialog, setDownloadDialog] = React.useState(false);

  //Download Invoice
  const { mutate: downloadInvoice, isPending: isDownloadPending } = useMutation({
    mutationFn: (data: { id: number; template: string }) =>
      api.buyingInvoice.download(data.id, data.template),
    onSuccess: () => {
      toast.success(tInvoicing('invoice.action_download_success'));
      setDownloadDialog(false);
    },
    onError: (error) => {
      toast.error(
        getErrorMessage('invoicing', error, tInvoicing('invoice.action_download_failure'))
      );
    }
  });

  //duplicate dialog
  const [duplicateDialog, setDuplicateDialog] = React.useState(false);

  //Duplicate Invoice
  const { mutate: duplicateInvoice, isPending: isDuplicationPending } = useMutation({
    mutationFn: (duplicateInvoiceDto: DuplicateBuyingInvoiceDto) =>
      api.buyingInvoice.duplicate(duplicateInvoiceDto),
    onSuccess: async (data) => {
      toast.success(tInvoicing('invoice.action_duplicate_success'));
      await router.push('/buying/invoice/' + data.id);
      setDuplicateDialog(false);
    },
    onError: (error) => {
      toast.error(
        getErrorMessage('invoicing', error, tInvoicing('invoice.action_duplicate_failure'))
      );
    }
  });

  //delete dialog
  const [deleteDialog, setDeleteDialog] = React.useState(false);

  //Delete Invoice
  const { mutate: removeInvoice, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.buyingInvoice.remove(id),
    onSuccess: () => {
      toast.success(tInvoicing('invoice.action_remove_success'));
      router.push('/buying/invoices');
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, tInvoicing('invoice.action_remove_failure')));
    }
  });

  const buttonsWithHandlers: InvoiceLifecycle[] = [
    {
      ...BUYING_INVOICE_LIFECYCLE_ACTIONS.save,
      key: 'save',
      onClick: () => {
        setActionName(tCommon('commands.save'));
        !!handleSubmit &&
          setAction(() => {
            return () => handleSubmit();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...BUYING_INVOICE_LIFECYCLE_ACTIONS.draft,
      key: 'draft',
      onClick: () => {
        setActionName(tCommon('commands.save'));
        !!handleSubmitDraft &&
          setAction(() => {
            return () => handleSubmitDraft();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...BUYING_INVOICE_LIFECYCLE_ACTIONS.validated,
      key: 'validated',
      onClick: () => {
        setActionName(tCommon('commands.validate'));
        !!handleSubmitValidated &&
          setAction(() => {
            return () => handleSubmitValidated();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...BUYING_INVOICE_LIFECYCLE_ACTIONS.sent,
      key: 'sent',
      onClick: () => {
        setActionName(tCommon('commands.send'));
        !!handleSubmitSent &&
          setAction(() => {
            return () => handleSubmitSent();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...BUYING_INVOICE_LIFECYCLE_ACTIONS.duplicate,
      key: 'duplicate',
      onClick: () => {
        setDuplicateDialog(true);
      },
      loading: false
    },
    {
      ...BUYING_INVOICE_LIFECYCLE_ACTIONS.download,
      key: 'download',
      onClick: () => setDownloadDialog(true),
      loading: false
    },
    {
      ...BUYING_INVOICE_LIFECYCLE_ACTIONS.delete,
      key: 'delete',
      onClick: () => {
        setDeleteDialog(true);
      },
      loading: false
    },
    {
      ...BUYING_INVOICE_LIFECYCLE_ACTIONS.reset,
      key: 'reset',
      onClick: () => {
        setActionName(tCommon('commands.initialize'));
        !!reset &&
          setAction(() => {
            return () => reset();
          });
        setActionDialog(true);
      },
      loading: false
    }
  ];
  const sequential = invoiceManager.sequential;
  return (
    <>
      <InvoiceActionDialog
        id={invoiceManager?.id || 0}
        sequential={sequential}
        action={actionName}
        open={actionDialog}
        callback={action}
        isCallbackPending={loading}
        onClose={() => setActionDialog(false)}
      />
      <InvoiceDuplicateDialog
        id={invoiceManager?.id || 0}
        sequential={sequential}
        open={duplicateDialog}
        duplicateInvoice={(includeFiles: boolean) => {
          invoiceManager?.id &&
            duplicateInvoice({
              id: invoiceManager?.id,
              includeFiles: includeFiles
            });
        }}
        isDuplicationPending={isDuplicationPending}
        onClose={() => setDuplicateDialog(false)}
      />
      <InvoiceDownloadDialog
        id={invoiceManager?.id || 0}
        open={downloadDialog}
        downloadInvoice={(template: string) => {
          invoiceManager?.id && downloadInvoice({ id: invoiceManager?.id, template });
        }}
        isDownloadPending={isDownloadPending}
        onClose={() => setDownloadDialog(false)}
      />
      <InvoiceDeleteDialog
        id={invoiceManager?.id || 0}
        sequential={invoiceManager?.sequential}
        open={deleteDialog}
        deleteInvoice={() => {
          invoiceManager?.id && removeInvoice(invoiceManager?.id);
        }}
        isDeletionPending={isDeletePending}
        onClose={() => setDeleteDialog(false)}
      />
      <div className={cn(className)}>
        <div className="flex flex-col border-b w-full gap-2 pb-5">
          {/* invoice status */}
          {status && (
            <Label className="text-base my-2 text-center">
              <span className="font-bold">{tInvoicing('invoice.attributes.status')} :</span>
              <span className="font-extrabold text-gray-500 mx-2">{tInvoicing(status)}</span>
            </Label>
          )}
          {/* invoice lifecycle actions */}
          {buttonsWithHandlers.map((lifecycle: InvoiceLifecycle) => {
            const idisplay = lifecycle.when?.set?.includes(status);
            const display = lifecycle.when?.membership == 'IN' ? idisplay : !idisplay;
            const disabled =
              isDataAltered && (lifecycle.key === 'save' || lifecycle.key === 'reset');
            return (
              display && (
                <Button
                  disabled={disabled}
                  variant={lifecycle.variant}
                  key={lifecycle.label}
                  className="flex items-center"
                  onClick={lifecycle.onClick}>
                  {lifecycle.icon}
                  <span className="mx-1">{tCommon(lifecycle.label)}</span>
                  <Spinner className="ml-2" size={'small'} show={lifecycle.loading} />
                </Button>
              )
            );
          })}
        </div>
        {/* associated quotation */}
        <div>
          <div className="border-b w-full  mt-5">
            <h1 className="font-bold">{tInvoicing('controls.associate_quotation')}</h1>
            <div className="my-4">
              {edit ? (
                <SelectShimmer isPending={loading}>
                  <Select
                    key={invoiceManager?.quotationId || 'quotationId'}
                    onValueChange={(e) => {
                      invoiceManager.set(
                        'quotationId',
                        quotations?.find((q) => q.id == parseInt(e))?.id
                      );
                    }}
                    value={invoiceManager?.quotationId?.toString()}>
                    <SelectTrigger className="my-1 w-full">
                      <SelectValue
                        placeholder={tInvoicing('controls.quotation_select_placeholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {quotations?.map((q: BuyingQuotation) => {
                        return (
                          <SelectItem key={q.id} value={q?.id?.toString() || ''}>
                            <span className="font-bold">{q?.sequential}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </SelectShimmer>
              ) : invoiceManager.quotationId ? (
                <UneditableInput
                  className="font-bold my-4"
                  value={quotations.find((q) => q.id == invoiceManager.quotationId)?.sequential}
                />
              ) : (
                <Label className="flex p-2 items-center justify-center gap-2 underline ">
                  <AlertCircle />
                  {tInvoicing('controls.no_associated_quotation')}
                </Label>
              )}
            </div>
          </div>
        </div>

        {/* Payment list */}
        {status &&
          [
            BUYING_INVOICE_STATUS.Sent,
            BUYING_INVOICE_STATUS.Unpaid,
            BUYING_INVOICE_STATUS.Paid,
            BUYING_INVOICE_STATUS.PartiallyPaid
          ].includes(status) &&
          payments.length != 0 && (
            <InvoicePaymentList className="border-b" payments={payments} currencies={currencies} />
          )}
        <div className="border-b w-full mt-5">
          {/* bank account choices */}
          <div>
            {bankAccounts.length == 0 && !controlManager.isBankAccountDetailsHidden && (
              <div>
                <h1 className="font-bold">{tInvoicing('controls.bank_details')}</h1>
                <Label className="flex p-5 items-center justify-center gap-2 underline ">
                  <AlertCircle />
                  {tInvoicing('controls.no_bank_accounts')}
                </Label>
              </div>
            )}

            {bankAccounts.length != 0 && !controlManager.isBankAccountDetailsHidden && (
              <div>
                <h1 className="font-bold">{tInvoicing('controls.bank_details')}</h1>
                <div className="my-5">
                  <SelectShimmer isPending={loading}>
                    <Select
                      key={invoiceManager.bankAccount?.id || 'bankAccount'}
                      onValueChange={(e) =>
                        invoiceManager.set(
                          'bankAccount',
                          bankAccounts.find((account) => account.id == parseInt(e))
                        )
                      }
                      defaultValue={invoiceManager?.bankAccount?.id?.toString() || ''}>
                      <SelectTrigger className="mty1 w-full">
                        <SelectValue placeholder={tInvoicing('controls.bank_select_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts?.map((account: BankAccount) => {
                          return (
                            <SelectItem key={account.id} value={account?.id?.toString() || ''}>
                              <span className="font-bold">{account?.name}</span> - (
                              {account?.currency?.code && tCurrency(account?.currency?.code)}(
                              {account?.currency?.symbol})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </SelectShimmer>
                </div>
              </div>
            )}
            {/* currency choices */}
            <div>
              <h1 className="font-bold">{tInvoicing('controls.currency_details')}</h1>
              {edit ? (
                <div>
                  {' '}
                  {currencies.length != 0 && (
                    <div className="my-5">
                      <SelectShimmer isPending={loading}>
                        <Select
                          key={invoiceManager.currency?.id || 'currency'}
                          onValueChange={(e) => {
                            invoiceManager.set(
                              'currency',
                              currencies.find((currency) => currency.id == parseInt(e))
                            );
                          }}
                          defaultValue={invoiceManager?.currency?.id?.toString() || ''}>
                          <SelectTrigger className="mty1 w-full">
                            <SelectValue
                              placeholder={tInvoicing('controls.currency_select_placeholder')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies?.map((currency: Currency) => {
                              return (
                                <SelectItem
                                  key={currency.id}
                                  value={currency?.id?.toString() || ''}>
                                  {currency?.code && tCurrency(currency?.code)} ({currency.symbol})
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </SelectShimmer>
                    </div>
                  )}
                </div>
              ) : (
                <UneditableInput
                  className="font-bold my-4"
                  value={
                    invoiceManager.currency &&
                    `${invoiceManager.currency?.code && tCurrency(invoiceManager.currency?.code)} (${invoiceManager?.currency?.symbol})`
                  }
                />
              )}
            </div>
          </div>
        </div>
        <div className={cn('w-full py-5', !controlManager.isTaxWithholdingHidden && 'border-b')}>
          <h1 className="font-bold">{tInvoicing('controls.include_on_quotation')}</h1>
          <div className="flex w-full items-center mt-1">
            {/* bank details switch */}
            <Label className="w-full">{tInvoicing('controls.bank_details')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() =>
                  controlManager.set(
                    'isBankAccountDetailsHidden',
                    !controlManager.isBankAccountDetailsHidden
                  )
                }
                {...{ checked: !controlManager.isBankAccountDetailsHidden }}
              />
            </div>
          </div>
          {/* article description switch */}
          <div className="flex w-full items-center mt-1">
            <Label className="w-full">{tInvoicing('controls.article_description')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() => {
                  articleManager.removeArticleDescription();
                  controlManager.set(
                    'isArticleDescriptionHidden',
                    !controlManager.isArticleDescriptionHidden
                  );
                }}
                {...{ checked: !controlManager.isArticleDescriptionHidden }}
              />
            </div>
          </div>  
          {/* general condition switch */}
          <div className="flex w-full items-center mt-1">
            <Label className="w-full">{tInvoicing('invoice.attributes.general_condition')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() => {
                  invoiceManager.set('generalConditions', '');
                  controlManager.set(
                    'isGeneralConditionsHidden',
                    !controlManager.isGeneralConditionsHidden
                  );
                }}
                {...{ checked: !controlManager.isGeneralConditionsHidden }}
              />
            </div>
          </div>
          {/* tax stamp */}
          <div className="flex w-full items-center mt-1">
            <Label className="w-full">{tInvoicing('invoice.attributes.tax_stamp')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() => {
                  // set taxStampId to null if edit
                  if (edit) invoiceManager.set('taxStampId', null);
                  controlManager.set('isTaxStampHidden', !controlManager.isTaxStampHidden);
                }}
                {...{ checked: !controlManager.isTaxStampHidden }}
              />
            </div>
          </div>
          {/* tax stamp */}
          <div className="flex w-full items-center mt-1">
            <Label className="w-full">{tInvoicing('invoice.attributes.withholding')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() => {
                  invoiceManager.set('taxWithholdingId', null);
                  controlManager.set(
                    'isTaxWithholdingHidden',
                    !controlManager.isTaxWithholdingHidden
                  );
                }}
                {...{ checked: !controlManager.isTaxWithholdingHidden }}
              />
            </div>
          </div>
        </div>
        {!controlManager.isTaxWithholdingHidden && (
          <div className="w-full py-5">
            <h1 className="font-bold">{tInvoicing('controls.withholding')}</h1>
            <div className="my-4">
              <SelectShimmer isPending={loading}>
                <Select
                  key={invoiceManager?.taxWithholdingId || 'taxWithholdingId'}
                  onValueChange={(e) => {
                    invoiceManager.set('taxWithholdingId', parseInt(e));
                  }}
                  value={invoiceManager?.taxWithholdingId?.toString()}>
                  <SelectTrigger className="my-1 w-full">
                    <SelectValue
                      placeholder={tInvoicing('controls.tax_withholding_select_placeholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {taxWithholdings?.map((t: TaxWithholding) => {
                      return (
                        <SelectItem key={t.id} value={t?.id?.toString() || ''}>
                          <span className="font-bold">{t?.label}</span> <span>({t?.rate} %)</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </SelectShimmer>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
