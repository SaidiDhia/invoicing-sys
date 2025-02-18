import React from 'react';
import { api } from '@/api';
import { BankAccount, Currency, DuplicateQuotationDto, Invoice, QUOTATION_STATUS } from '@/types';
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
import { useQuotationManager } from '@/components/selling/quotation/hooks/useQuotationManager';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fromSequentialObjectToString } from '@/utils/string.utils';
import { QuotationDuplicateDialog } from '../dialogs/QuotationDuplicateDialog';
import { QuotationDownloadDialog } from '../dialogs/QuotationDownloadDialog';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';
import { useRouter } from 'next/router';
import { QuotationDeleteDialog } from '../dialogs/QuotationDeleteDialog';
import { useQuotationControlManager } from '../hooks/useQuotationControlManager';
import { QuotationActionDialog } from '../dialogs/QuotationActionDialog';
import { useQuotationArticleManager } from '../hooks/useQuotationArticleManager';
import { QUOTATION_LIFECYCLE_ACTIONS } from '@/constants/quotation.lifecycle';
import { QuotationInvoiceDialog } from '../dialogs/QuotationInvoiceDialog';
import { QuotationInvoiceList } from './QuotationInvoiceList';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';

interface QuotationLifecycle {
  label: string;
  key: string;
  variant: 'default' | 'outline';
  icon: React.ReactNode;
  onClick?: () => void;
  loading: boolean;
  when: {
    membership: 'IN' | 'OUT';
    set: (QUOTATION_STATUS | undefined)[];
  };
}

interface QuotationControlSectionProps {
  className?: string;
  status?: QUOTATION_STATUS;
  isDataAltered?: boolean;
  bankAccounts: BankAccount[];
  currencies: Currency[];
  invoices: Invoice[];
  handleSubmit?: () => void;
  handleSubmitDraft: () => void;
  handleSubmitValidated: () => void;
  handleSubmitSent: () => void;
  handleSubmitAccepted?: () => void;
  handleSubmitRejected?: () => void;
  reset: () => void;
  refetch?: () => void;
  loading?: boolean;
  edit?: boolean;
}

export const QuotationControlSection = ({
  className,
  status = undefined,
  isDataAltered,
  bankAccounts,
  currencies,
  invoices,
  handleSubmit,
  handleSubmitDraft,
  handleSubmitValidated,
  handleSubmitSent,
  handleSubmitAccepted,
  handleSubmitRejected,
  reset,
  refetch,
  loading,
  edit = true
}: QuotationControlSectionProps) => {
  const router = useRouter();
  const { t: tInvoicing } = useTranslation('invoicing');
  const { t: tCommon } = useTranslation('common');
  const { t: tCurrency } = useTranslation('currency');

  const quotationManager = useQuotationManager();
  const controlManager = useQuotationControlManager();
  const articleManager = useQuotationArticleManager();

  //action dialog
  const [actionDialog, setActionDialog] = React.useState<boolean>(false);
  const [actionName, setActionName] = React.useState<string>();
  const [action, setAction] = React.useState<() => void>(() => {});

  //download dialog
  const [downloadDialog, setDownloadDialog] = React.useState(false);

  //Download Quotation
  const { mutate: downloadQuotation, isPending: isDownloadPending } = useMutation({
    mutationFn: (data: { id: number; template: string }) =>
      api.quotation.download(data.id, data.template),
    onSuccess: () => {
      toast.success(tInvoicing('quotation.action_download_success'));
      setDownloadDialog(false);
    },
    onError: (error) => {
      toast.error(
        getErrorMessage('invoicing', error, tInvoicing('quotation.action_download_failure'))
      );
    }
  });

  //duplicate dialog
  const [duplicateDialog, setDuplicateDialog] = React.useState(false);

  //Duplicate Quotation
  const { mutate: duplicateQuotation, isPending: isDuplicationPending } = useMutation({
    mutationFn: (duplicateQuotationDto: DuplicateQuotationDto) =>
      api.quotation.duplicate(duplicateQuotationDto),
    onSuccess: async (data) => {
      toast.success(tInvoicing('quotation.action_duplicate_success'));
      await router.push('/selling/quotation/' + data.id);
      setDuplicateDialog(false);
    },
    onError: (error) => {
      toast.error(
        getErrorMessage('invoicing', error, tInvoicing('quotation.action_duplicate_failure'))
      );
    }
  });

  //delete dialog
  const [deleteDialog, setDeleteDialog] = React.useState(false);

  //Delete Quotation
  const { mutate: removeQuotation, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.quotation.remove(id),
    onSuccess: () => {
      toast.success(tInvoicing('quotation.action_remove_success'));
      router.push('/selling/quotations');
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, tInvoicing('quotation.action_remove_failure')));
    }
  });

  //invoice dialog
  const [invoiceDialog, setInvoiceDialog] = React.useState(false);

  //Invoice quotation
  const { mutate: invoiceQuotation, isPending: isInvoicingPending } = useMutation({
    mutationFn: (data: { id?: number; createInvoice: boolean }) =>
      api.quotation.invoice(data.id, data.createInvoice),
    onSuccess: (data) => {
      toast.success('Devis facturé avec succès');
      refetch?.();
      router.push(`/selling/invoice/${data.invoices[data?.invoices?.length - 1].id}`);
    },
    onError: (error) => {
      const message = getErrorMessage('contacts', error, 'Erreur lors de la facturation de devis');
      toast.error(message);
    }
  });

  const buttonsWithHandlers: QuotationLifecycle[] = [
    {
      ...QUOTATION_LIFECYCLE_ACTIONS.save,
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
      ...QUOTATION_LIFECYCLE_ACTIONS.draft,
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
      ...QUOTATION_LIFECYCLE_ACTIONS.validated,
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
      ...QUOTATION_LIFECYCLE_ACTIONS.sent,
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
      ...QUOTATION_LIFECYCLE_ACTIONS.accepted,
      key: 'accepted',
      onClick: () => {
        setActionName(tCommon('commands.accept'));
        !!handleSubmitAccepted &&
          setAction(() => {
            return () => handleSubmitAccepted();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...QUOTATION_LIFECYCLE_ACTIONS.rejected,
      key: 'rejected',
      onClick: () => {
        setActionName(tCommon('commands.reject'));
        !!handleSubmitRejected &&
          setAction(() => {
            return () => handleSubmitRejected();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...QUOTATION_LIFECYCLE_ACTIONS.invoiced,
      key: 'to_invoice',
      onClick: () => {
        setInvoiceDialog(true);
      },
      loading: false
    },
    {
      ...QUOTATION_LIFECYCLE_ACTIONS.duplicate,
      key: 'duplicate',
      onClick: () => {
        setDuplicateDialog(true);
      },
      loading: false
    },
    {
      ...QUOTATION_LIFECYCLE_ACTIONS.download,
      key: 'download',
      onClick: () => setDownloadDialog(true),
      loading: false
    },
    {
      ...QUOTATION_LIFECYCLE_ACTIONS.delete,
      key: 'delete',
      onClick: () => {
        setDeleteDialog(true);
      },
      loading: false
    },
    {
      ...QUOTATION_LIFECYCLE_ACTIONS.reset,
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
  const sequential = fromSequentialObjectToString(quotationManager.sequentialNumber);
  return (
    <>
      <QuotationActionDialog
        id={quotationManager?.id || 0}
        sequential={sequential}
        action={actionName}
        open={actionDialog}
        callback={action}
        isCallbackPending={loading}
        onClose={() => setActionDialog(false)}
      />
      <QuotationDuplicateDialog
        id={quotationManager?.id || 0}
        sequential={sequential}
        open={duplicateDialog}
        duplicateQuotation={(includeFiles: boolean) => {
          quotationManager?.id &&
            duplicateQuotation({
              id: quotationManager?.id,
              includeFiles: includeFiles
            });
        }}
        isDuplicationPending={isDuplicationPending}
        onClose={() => setDuplicateDialog(false)}
      />
      <QuotationDownloadDialog
        id={quotationManager?.id || 0}
        open={downloadDialog}
        downloadQuotation={(template: string) => {
          quotationManager?.id && downloadQuotation({ id: quotationManager?.id, template });
        }}
        isDownloadPending={isDownloadPending}
        onClose={() => setDownloadDialog(false)}
      />
      <QuotationDeleteDialog
        id={quotationManager?.id || 0}
        sequential={sequential}
        open={deleteDialog}
        deleteQuotation={() => {
          quotationManager?.id && removeQuotation(quotationManager?.id);
        }}
        isDeletionPending={isDeletePending}
        onClose={() => setDeleteDialog(false)}
      />
      <QuotationInvoiceDialog
        id={quotationManager?.id || 0}
        status={quotationManager?.status}
        sequential={sequential}
        open={invoiceDialog}
        isInvoicePending={isInvoicingPending}
        invoice={(id: number, createInvoice: boolean) => {
          invoiceQuotation({ id, createInvoice });
        }}
        onClose={() => setInvoiceDialog(false)}
      />
      <div className={cn(className)}>
        <div className="flex flex-col border-b w-full gap-2 pb-5">
          {/* quotation status */}
          {status && (
            <Label className="text-base my-2 text-center">
              <span className="font-bold">{tInvoicing('quotation.attributes.status')} :</span>
              <span className="font-extrabold text-gray-500 ml-2 mr-1">{tInvoicing(status)}</span>
              {status === QUOTATION_STATUS.Invoiced && invoices?.length != 0 && (
                <span className="font-extrabold text-gray-500">({invoices?.length})</span>
              )}
            </Label>
          )}
          {/* quotation lifecycle actions */}
          {buttonsWithHandlers.map((lifecycle: QuotationLifecycle) => {
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
        {/* Invoice list */}
        {status === QUOTATION_STATUS.Invoiced && invoices.length != 0 && (
          <QuotationInvoiceList className="border-b" invoices={invoices} />
        )}
        <div className={cn('w-full mt-5 border-b')}>
          {/* bank account choices */}
          <div>
            {!controlManager.isBankAccountDetailsHidden && (
              <React.Fragment>
                {bankAccounts.length == 0 && (
                  <div>
                    <h1 className="font-bold">{tInvoicing('controls.bank_details')}</h1>
                    <Label className="flex p-5 items-center justify-center gap-2 underline ">
                      <AlertCircle />
                      {tInvoicing('controls.no_bank_accounts')}
                    </Label>
                  </div>
                )}
                {bankAccounts.length != 0 && (
                  <div>
                    <h1 className="font-bold">{tInvoicing('controls.bank_details')}</h1>
                    <div className="my-5">
                      <SelectShimmer isPending={loading}>
                        <Select
                          key={quotationManager.bankAccount?.id || 'bankAccount'}
                          onValueChange={(e) =>
                            quotationManager.set(
                              'bankAccount',
                              bankAccounts.find((account) => account.id == parseInt(e))
                            )
                          }
                          defaultValue={quotationManager?.bankAccount?.id?.toString() || ''}>
                          <SelectTrigger className="mty1 w-full">
                            <SelectValue
                              placeholder={tInvoicing('controls.bank_select_placeholder')}
                            />
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
              </React.Fragment>
            )}
            {/* currency choices */}
            <h1 className="font-bold">{tInvoicing('controls.currency_details')}</h1>
            {edit ? (
              <div>
                {currencies.length != 0 && (
                  <div className="my-5">
                    <SelectShimmer isPending={loading}>
                      <Select
                        key={quotationManager.currency?.id || 'currency'}
                        onValueChange={(e) => {
                          quotationManager.set(
                            'currency',
                            currencies.find((currency) => currency.id == parseInt(e))
                          );
                        }}
                        defaultValue={quotationManager?.currency?.id?.toString() || ''}>
                        <SelectTrigger className="mty1 w-full">
                          <SelectValue
                            placeholder={tInvoicing('controls.currency_select_placeholder')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies?.map((currency: Currency) => {
                            return (
                              <SelectItem key={currency.id} value={currency?.id?.toString() || ''}>
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
                  quotationManager.currency &&
                  `${quotationManager.currency?.code && tCurrency(quotationManager.currency?.code)} (${quotationManager?.currency?.symbol})`
                }
              />
            )}
          </div>
        </div>
        <div className="w-full py-5">
          <h1 className="font-bold">{tInvoicing('controls.include_on_quotation')}</h1>
          <div className="flex w-full items-center mt-1">
            {/* bank details switch */}
            <Label className="w-full">{tInvoicing('controls.bank_details')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() => {
                  controlManager.set(
                    'isBankAccountDetailsHidden',
                    !controlManager.isBankAccountDetailsHidden
                  );
                  quotationManager.set('bankAccount', null);
                }}
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
          {/* invoicing address switch */}
          <div className="flex w-full items-center mt-1">
            <Label className="w-full">{tInvoicing('quotation.attributes.invoicing_address')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() =>
                  controlManager.set(
                    'isInvoiceAddressHidden',
                    !controlManager.isInvoiceAddressHidden
                  )
                }
                {...{ checked: !controlManager.isInvoiceAddressHidden }}
              />
            </div>
          </div>
          {/* delivery address switch */}
          <div className="flex w-full items-center mt-1">
            <Label className="w-full">{tInvoicing('quotation.attributes.delivery_address')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() =>
                  controlManager.set(
                    'isDeliveryAddressHidden',
                    !controlManager.isDeliveryAddressHidden
                  )
                }
                {...{ checked: !controlManager.isDeliveryAddressHidden }}
              />
            </div>
          </div>
          {/* general condition switch */}
          <div className="flex w-full items-center mt-1">
            <Label className="w-full">{tInvoicing('quotation.attributes.general_condition')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() => {
                  quotationManager.set('generalConditions', '');
                  controlManager.set(
                    'isGeneralConditionsHidden',
                    !controlManager.isGeneralConditionsHidden
                  );
                }}
                {...{ checked: !controlManager.isGeneralConditionsHidden }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
