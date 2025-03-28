import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FirmBankAccount, CreateFirmBankAccountDto, UpdateFirmBankAccountDto } from '@/types/firm-bank-account';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';
import { useDebounce } from '@/hooks/other/useDebounce';
import { useTranslation } from 'react-i18next';
import { useFirmBankAccountManager } from './hooks/useFirmBankAccountManager';
import { BankAccountCreateDialog } from './dialogs/FirmBankAccountCreateDialog';
import { BankAccountUpdateDialog } from './dialogs/FirmBankAccountUpdateDialog';
import { BankAccountDeleteDialog } from './dialogs/BankAccountDeleteDialog';
import { BankAccountPromoteDialog } from './dialogs/FirmBankAccountPromoteDialog';
import { getBankAccountColumns } from './data-table/columns';
import { DataTable } from './data-table/data-table';
import { api, firm } from '@/api';
import { BankAccountActionsContext } from './data-table/ActionsContext';
import ContentSection from '@/components/common/ContentSection';
import { cn } from '@/lib/utils';
import { BreadcrumbRoute, useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { useRouter } from 'next/router';

interface FirmBankAccountMainProps {
  firmId:number;
  className?: string;
  routes?: BreadcrumbRoute[];
}

export const FirmBankAccountMain: React.FC<FirmBankAccountMainProps> = ({ className , firmId ,routes}) => {
  //next-router
  const router = useRouter();

  const { t: tCommon } = useTranslation('common');
  const { t: tContacts } = useTranslation('contacts');
  const { t: tCurrency } = useTranslation('currency');

  //set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    if (routes && firmId) setRoutes([...routes, { title: tContacts('bank_accounts.plural') }]);
  }, [router.locale, firmId]);

  const bankAccountManager = useFirmBankAccountManager();

  const [page, setPage] = React.useState(1);
  const { value: debouncedPage, loading: paging } = useDebounce<number>(page, 500);

  const [size, setSize] = React.useState(5);
  const { value: debouncedSize, loading: resizing } = useDebounce<number>(size, 500);

  const [sortDetails, setSortDetails] = React.useState({ order: true, sortKey: 'id' });
  const { value: debouncedSortDetails, loading: sorting } = useDebounce<typeof sortDetails>(
    sortDetails,
    500
  );

  const [searchTerm, setSearchTerm] = React.useState('');
  const { value: debouncedSearchTerm, loading: searching } = useDebounce<string>(searchTerm, 500);

  const [createDialog, setCreateDialog] = React.useState(false);
  const [updateDialog, setUpdateDialog] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [promoteDialog, setPromoteDialog] = React.useState(false);

  const {
    isPending: isFetchPending,
    error,
    data: bankAccountsResp,
    refetch: refetchBankAccounts
  } = useQuery({
    queryKey: [
      'bank-accounts',
      debouncedPage,
      debouncedSize,
      debouncedSortDetails.order,
      debouncedSortDetails.sortKey,
      debouncedSearchTerm,
      firmId
    ],
    queryFn: () =>
      api.firmBankAccount.findPaginated(
        firmId,
        debouncedPage,
        debouncedSize,
        debouncedSortDetails.order ? 'ASC' : 'DESC',
        debouncedSortDetails.sortKey,
        debouncedSearchTerm,
      )
  });

  const bankAccounts = React.useMemo(() => {
    return bankAccountsResp?.data || [];
  }, [bankAccountsResp]);

  const context = {
    //dialogs
    openCreateDialog: () => setCreateDialog(true),
    openUpdateDialog: () => setUpdateDialog(true),
    openDeleteDialog: () => setDeleteDialog(true),
    openPromoteDialog: () => setPromoteDialog(true),
    //search, filtering, sorting & paging
    searchTerm,
    setSearchTerm,
    page,
    totalPageCount: bankAccountsResp?.meta.pageCount || 1,
    setPage,
    size,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) => setSortDetails({ order, sortKey })
  };

  // determine if there are bank accounts available so we let the client decide to switch its main account
  const [hasToCreateMainByDefault, setHasToCreateMainByDefault] = React.useState<boolean>(false);
  const [hasToUpdateMainByDefault, setHasToUpdateMainByDefault] = React.useState<boolean>(false);
  React.useEffect(() => {
    const fetchInitialAccounts = async () => {
      const resp = await api.firmBankAccount.findPaginated(firmId);
      setHasToCreateMainByDefault(resp.data.length === 0);
      setHasToUpdateMainByDefault(resp.data.length === 1);
    };
    fetchInitialAccounts();
  }, [bankAccounts]);

  //create bank account
  const { mutate: createBankAccount, isPending: isCreatePending } = useMutation({
    mutationFn: (data: CreateFirmBankAccountDto) => api.firmBankAccount.create({...data,firmId}),
    onSuccess: () => {
      toast.success(tContacts('bank_account.action_add_success'));
      refetchBankAccounts();
      bankAccountManager.reset();
      setCreateDialog(false);
    },
    onError: (error) => {
      const message = getErrorMessage('settings', error, 'bank_account.action_add_failure');
      toast.error(message);
    }
  });

  //update bank account
  const { mutate: updateBankAccount, isPending: isUpdatePending } = useMutation({
    mutationFn: (data: UpdateFirmBankAccountDto) => api.firmBankAccount.update(data),
    onSuccess: () => {
      toast.success(tContacts('bank_account.action_add_success'));
      refetchBankAccounts();
      bankAccountManager.reset();
      setUpdateDialog(false);
    },
    onError: (error) => {
      const message = getErrorMessage('settings', error, 'bank_account.action_add_failure');
      toast.error(message);
    }
  });

  //remove bank account
  const { mutate: removeBankAccount, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.firmBankAccount.remove(id),
    onSuccess: () => {
      if (bankAccounts?.length == 1 && page > 1) setPage(page - 1);
      toast.success(tContacts('bank_account.action_remove_success'));
      refetchBankAccounts();
      setDeleteDialog(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage('settings', error, 'bank_account.action_remove_failure'));
    }
  });

  //promote bank account
  const { mutate: promoteBankAccount, isPending: isPromotionPending } = useMutation({
    mutationFn: (data: FirmBankAccount) => api.firmBankAccount.update({ ...data, isMain: true }),
    onSuccess: (data) => {
      toast.success(tContacts('bank_account.action_promote_success', { name: data.name }));
      refetchBankAccounts();
      bankAccountManager.reset();
      setPromoteDialog(false);
    },
    onError: (error) => {
      const message = getErrorMessage('settings', error, 'bank_account.action_promote_success');
      toast.error(message);
    }
  });

  const handleBankAccountCreateSubmit = () => {
    if (hasToCreateMainByDefault) bankAccountManager.set('isMain', true);
    const bankAccount = bankAccountManager.getBankAccount();
    const validation = api.firmBankAccount.validate(bankAccount);
    if (validation.message) {
      toast.error(validation.message);
    } else {
      createBankAccount(bankAccount);
    }
  };

  const handleBankAccountUpdateSubmit = () => {
    const bankAccount = bankAccountManager.getBankAccount();
    const validation = api.firmBankAccount.validate(bankAccount, hasToUpdateMainByDefault);
    if (validation.message) {
      toast.error(validation.message);
    } else {
      updateBankAccount(bankAccount);
    }
  };

  const isPending =
    isFetchPending ||
    isCreatePending ||
    isUpdatePending ||
    isDeletePending ||
    paging ||
    resizing ||
    searching ||
    sorting;

  if (error) return 'An error has occurred: ' + error.message;
  return (
    <BankAccountActionsContext.Provider value={context}>
      <BankAccountCreateDialog
        open={createDialog}
        isCreatePending={isCreatePending}
        createBankAccount={handleBankAccountCreateSubmit}
        onClose={() => {
          setCreateDialog(false);
          bankAccountManager.reset();
        }}
        mainByDefault={hasToCreateMainByDefault}
      />
      <BankAccountUpdateDialog
        open={updateDialog}
        updateBankAccount={handleBankAccountUpdateSubmit}
        isUpdatePending={isUpdatePending}
        onClose={() => {
          setUpdateDialog(false);
          bankAccountManager.reset();
        }}
      />
      <BankAccountDeleteDialog
        open={deleteDialog}
        deleteBankAccount={() => {
          bankAccountManager?.id && removeBankAccount(bankAccountManager?.id);
        }}
        isDeletionPending={isDeletePending}
        label={
          `${bankAccountManager.name}` +
          (bankAccountManager?.iban ? `(${bankAccountManager?.iban}) ` : ``)
        }
        onClose={() => {
          setDeleteDialog(false);
        }}
      />
      <BankAccountPromoteDialog
        open={promoteDialog}
        promoteBankAccount={() => {
          bankAccountManager?.id && promoteBankAccount(bankAccountManager.getBankAccount());
        }}
        isPromotingPending={isPromotionPending}
        label={bankAccountManager.name}
        onClose={() => {
          setPromoteDialog(false);
        }}
      />
      <ContentSection
        title={tContacts('bank_account.singular')}
        desc={tContacts('bank_account.card_description')}
        className="w-full"
        childrenClassName={cn('overflow-hidden', className)}>
        <DataTable
          className="flex flex-col flex-1 overflow-hidden p-1"
          containerClassName="overflow-auto"
          data={bankAccounts}
          columns={getBankAccountColumns(tContacts, tCurrency)}
          isPending={isPending}
        />
      </ContentSection>
    </BankAccountActionsContext.Provider>
  );
};
