import { api } from '@/api';
import ContentSection from '@/components/common/ContentSection';
import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import { RoleActionsContext } from './data-table/action-context';
import { DataTable } from './data-table/data-table';
import { getRoleColumns } from './data-table/columns';
import { useRoleCreateSheet } from './modals/RoleCreateSheet';
import { useRoleManager } from './hooks/useRoleManager';
import { useRoleUpdateSheet } from './modals/RoleUpdateSheet';
import { useRoleDeleteDialog } from './modals/RoleDeleteDialog';
import { useRoleDuplicateDialog } from './modals/RoleDuplicateDialog';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/other/useDebounce';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { CreateRoleDto, UpdateRoleDto } from '@/types';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface RoleMainProps {
  className?: string;
}

export default function RoleMain({ className }: RoleMainProps) {
  //next-router
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');
  const { t: tSettings } = useTranslation('settings');
  const { t: tPermission } = useTranslation('permissions');

  //set page title in the breadcrumb
  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    setRoutes([
      { title: tCommon('menu.administrative_tools') },
      { title: tCommon('submenu.user_management') },
      { title: tCommon('settings.user_management.roles') }
    ]);
  }, [router.locale]);

  const roleManager = useRoleManager();
  const [page, setPage] = React.useState(1);
  const { value: debouncedPage, loading: paging } = useDebounce<number>(page, 500);

  const [size, setSize] = React.useState(5);
  const { value: debouncedSize, loading: resizing } = useDebounce<number>(size, 500);

  const [sortDetails, setSortDetails] = React.useState({
    order: true,
    sortKey: 'id'
  });
  const { value: debouncedSortDetails, loading: sorting } = useDebounce<typeof sortDetails>(
    sortDetails,
    500
  );

  const [searchTerm, setSearchTerm] = React.useState('');
  const { value: debouncedSearchTerm, loading: searching } = useDebounce<string>(searchTerm, 500);

  const {
    data: rolesResponse,
    isFetching: isRolesPending,
    refetch: refetchRoles
  } = useQuery({
    queryKey: [
      'roles',
      debouncedPage,
      debouncedSize,
      debouncedSortDetails.order,
      debouncedSortDetails.sortKey,
      debouncedSearchTerm
    ],
    queryFn: () =>
      api.role.findPaginated(
        debouncedPage,
        debouncedSize,
        debouncedSortDetails.order ? 'ASC' : 'DESC',
        debouncedSortDetails.sortKey,
        debouncedSearchTerm
      )
  });

  const roles = React.useMemo(() => {
    if (!rolesResponse) return [];
    return rolesResponse.data;
  }, [rolesResponse]);

  const { mutate: createRole, isPending: isCreationPending } = useMutation({
    mutationFn: (role: CreateRoleDto) => api.role.create(role),
    onSuccess: () => {
      toast('Role Created Successfully');
      refetchRoles();
      roleManager.reset();
      closeCreateRoleSheet();
    },
    onError: (error) => {
      toast(error.message);
    }
  });

  const { mutate: updateRole, isPending: isUpdatePending } = useMutation({
    mutationFn: (data: { id?: number; role?: UpdateRoleDto }) =>
      api.role.update(data.id, data.role),
    onSuccess: () => {
      toast('Role Updated Successfully');
      refetchRoles();
      roleManager.reset();
      closeUpdateRoleSheet();
    },
    onError: (error) => {
      toast(error.message);
    }
  });

  const { mutate: deleteRole, isPending: isDeletionPending } = useMutation({
    mutationFn: (id?: number) => api.role.remove(id),
    onSuccess: () => {
      toast('Role Deleted Successfully');
      refetchRoles();
      roleManager.reset();
      closeDeleteRoleDialog();
    },
    onError: (error) => {
      toast(error.message);
    }
  });

  const { mutate: duplicateRole, isPending: isDuplicationPending } = useMutation({
    mutationFn: (id?: number) => api.role.duplicate(id),
    onSuccess: () => {
      toast('Role Duplicated Successfully');
      refetchRoles();
      roleManager.reset();
      closeDuplicateRoleDialog();
    },
    onError: (error) => {
      toast(error.message);
    }
  });

  const handleCreateSubmit = () => {
    const { permissionsEntries, ...data } = roleManager.getRole();
    createRole({
      ...data,
      permissionsIds: roleManager?.permissions?.map((permission) => permission.id || undefined)
    });
  };

  const handleUpdateSubmit = () => {
    const { permissionsEntries, ...data } = roleManager.getRole();
    updateRole({
      id: data.id,
      role: {
        label: data.label,
        description: data.description,
        permissionsIds: roleManager?.permissions?.map((permission) => permission.id)
      }
    });
  };

  const { createRoleSheet, openCreateRoleSheet, closeCreateRoleSheet } = useRoleCreateSheet({
    createRole: handleCreateSubmit,
    isCreatePending: isCreationPending,
    resetRole: () => roleManager.reset()
  });

  const { updateRoleSheet, openUpdateRoleSheet, closeUpdateRoleSheet } = useRoleUpdateSheet({
    updateRole: handleUpdateSubmit,
    isUpdatePending: isUpdatePending,
    resetRole: () => roleManager.reset()
  });

  const { deleteRoleDialog, openDeleteRoleDialog, closeDeleteRoleDialog } = useRoleDeleteDialog({
    roleLabel: roleManager.label,
    deleteRole: () => deleteRole(roleManager?.id),
    isDeletionPending,
    resetRole: () => roleManager.reset()
  });

  const { duplicateRoleDialog, openDuplicateRoleDialog, closeDuplicateRoleDialog } =
    useRoleDuplicateDialog({
      roleLabel: roleManager.label,
      duplicateRole: () => duplicateRole(roleManager?.id),
      isDuplicationPending,
      resetRole: () => roleManager.reset()
    });

  const context = {
    openCreateRoleSheet,
    openUpdateRoleSheet,
    openDeleteRoleDialog,
    openDuplicateRoleDialog,
    //search, filtering, sorting & paging
    searchTerm,
    setSearchTerm,
    page,
    totalPageCount: rolesResponse?.meta.pageCount || 0,
    setPage,
    size,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) => setSortDetails({ order, sortKey })
  };

  const isPending = isRolesPending || paging || resizing || searching || sorting;

  return (
    <ContentSection
      title={tSettings('roles.singular')}
      desc={tSettings('roles.description')}
      className="w-full"
      childrenClassName={cn('overflow-hidden', className)}>
      <RoleActionsContext.Provider value={context}>
        {createRoleSheet}
        {updateRoleSheet}
        {deleteRoleDialog}
        {duplicateRoleDialog}
        <DataTable
          className="flex flex-col flex-1 overflow-hidden p-1"
          containerClassName="overflow-auto"
          columns={getRoleColumns(tSettings, tPermission)}
          data={roles}
          isPending={isPending}
        />
      </RoleActionsContext.Provider>
    </ContentSection>
  );
}
