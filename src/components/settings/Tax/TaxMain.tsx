import React from 'react';
import { api } from '@/api';
import { Tax } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { getErrorMessage } from '@/utils/errors';
import { useDebounce } from '@/hooks/other/useDebounce';
import { useTranslation } from 'react-i18next';
import { useTaxManager } from './hooks/useTaxManager';
import { TaxCreateDialog } from './dialogs/TaxCreateDialog';
import { TaxUpdateDialog } from './dialogs/TaxUpdateDialog';
import { TaxDeleteDialog } from './dialogs/TaxDeleteDialog';
import { DataTable } from './data-table/data-table';
import { TaxActionsContext } from './data-table/ActionDialogContext';
import { getTaxColumns } from './data-table/columns';
import { useRouter } from 'next/router';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import ContentSection from '@/components/common/ContentSection';
import { cn } from '@/lib/utils';

interface TaxMainProps {
  className?: string;
}

const TaxMain: React.FC<TaxMainProps> = ({ className }) => {
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
      { title: tCommon('settings.system.tax') }
    ]);
  }, [router.locale]);

  const taxManger = useTaxManager();

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

  const {
    isPending: isFetchPending,
    error,
    data: taxesResp,
    refetch: refetchTaxes
  } = useQuery({
    queryKey: [
      'taxes',
      debouncedPage,
      debouncedSize,
      debouncedSortDetails.order,
      debouncedSortDetails.sortKey,
      debouncedSearchTerm
    ],
    queryFn: () =>
      api.tax.findPaginated(
        debouncedPage,
        debouncedSize,
        debouncedSortDetails.order ? 'DESC' : 'ASC',
        debouncedSortDetails.sortKey,
        debouncedSearchTerm
      )
  });

  const taxes = React.useMemo(() => {
    return taxesResp?.data || [];
  }, [taxesResp]);

  const context = {
    //dialogs
    openCreateDialog: () => setCreateDialog(true),
    openUpdateDialog: () => setUpdateDialog(true),
    openDeleteDialog: () => setDeleteDialog(true),
    //search, filtering, sorting & paging
    searchTerm,
    setSearchTerm,
    page,
    totalPageCount: taxesResp?.meta.pageCount || 1,
    setPage,
    size,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) => setSortDetails({ order, sortKey })
  };

  //create tax
  const { mutate: createTax, isPending: isCreatePending } = useMutation({
    mutationFn: (data: Tax) => api.tax.create(data),
    onSuccess: () => {
      toast.success('Taxe ajoutée avec succès');
      refetchTaxes();
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, 'Erreur lors de la création du taxe'));
    }
  });

  //update tax
  const { mutate: updateTax, isPending: isUpdatePending } = useMutation({
    mutationFn: (data: Tax) => api.tax.update(data),
    onSuccess: () => {
      toast.success('Taxe modifiée avec succès');
      refetchTaxes();
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, 'Erreur lors de la modification du taxe'));
    }
  });

  //remove tax
  const { mutate: removeTax, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.tax.remove(id),
    onSuccess: () => {
      if (taxes?.length == 1 && page > 1) setPage(page - 1);
      toast.success('Taxe supprimée avec succès');
      refetchTaxes();
      setDeleteDialog(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, 'Erreur lors de la suppression du taxe'));
    }
  });

  const handleTaxCreateSubmit = () => {
    const tax = taxManger.getTax();
    const validation = api.tax.validate(tax);
    if (validation.message) {
      toast.error(validation.message);
      return false;
    } else {
      createTax(tax);
      return true;
    }
  };

  const handleTaxUpdateSubmit = () => {
    const tax = taxManger.getTax();
    const validation = api.tax.validate(tax);
    if (validation.message) {
      toast.error(validation.message);
      return false;
    } else {
      updateTax(tax);
      return true;
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
    <TaxActionsContext.Provider value={context}>
      <TaxCreateDialog
        open={createDialog}
        isCreatePending={isCreatePending}
        createTax={() => {
          handleTaxCreateSubmit() && setCreateDialog(false);
        }}
        onClose={() => {
          setCreateDialog(false);
          taxManger.reset();
        }}
      />
      <TaxUpdateDialog
        open={updateDialog}
        updateTax={() => {
          handleTaxUpdateSubmit() && setUpdateDialog(false);
        }}
        isUpdatePending={isUpdatePending}
        onClose={() => {
          setUpdateDialog(false);
          taxManger.reset();
        }}
      />
      <TaxDeleteDialog
        open={deleteDialog}
        deleteTax={() => {
          taxManger?.id && removeTax(taxManger?.id);
        }}
        isDeletionPending={isDeletePending}
        label={taxManger?.label}
        onClose={() => {
          setDeleteDialog(false);
        }}
      />
      <ContentSection
        title={tSettings('tax.singular')}
        desc={tSettings('tax.card_description')}
        className="w-full"
        childrenClassName={cn('overflow-hidden', className)}>
        <DataTable
          className="flex flex-col flex-1 overflow-hidden p-1"
          containerClassName="overflow-auto"
          data={taxes}
          columns={getTaxColumns(tSettings, tCommon)}
          isPending={isPending}
        />
      </ContentSection>
    </TaxActionsContext.Provider>
  );
};

export default TaxMain;
