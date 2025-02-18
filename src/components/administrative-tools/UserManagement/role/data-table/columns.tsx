import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { Role } from '@/types';
import { getPermissionTranslation } from '../../permission/utils/getPermissionTranslation';

export const getRoleColumns = (t: Function, tPermission: Function): ColumnDef<Role>[] => {
  const translationNamespace = 'settings';
  const translate = (value: string, namespace: string = '') => {
    return t(value, { ns: namespace || translationNamespace });
  };
  return [
    {
      accessorKey: 'label',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('roles.attributes.label')}
          attribute="label"
        />
      ),
      cell: ({ row }) => <div>{row.original.label}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('roles.attributes.description')}
          attribute="description"
        />
      ),
      cell: ({ row }) => (
        <div>{row.original.description || t('roles.attributes.no_description')}</div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'permissions',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('roles.attributes.permissions')}
          attribute="permissions"
        />
      ),
      cell: ({ row }) => {
        const entries = row.original.permissionsEntries;

        if (entries?.length === 0) {
          return <div className="opacity-70">{t('roles.attributes.no_permissions')}</div>;
        }

        const visiblePermissions = entries?.slice(0, 2) || []; // Show first 3 permissions
        const hiddenPermissions = entries ? entries?.length - visiblePermissions?.length : 0;

        return (
          <div>
            <div className="line-clamp-1">
              {visiblePermissions.map((entry, index) => (
                <span key={index} className="mr-1">
                  {tPermission(`${getPermissionTranslation(entry?.permission?.label)}.value`)}
                  {index < visiblePermissions.length - 1 && ', '}
                </span>
              ))}
              {hiddenPermissions > 0 && (
                <span className="opacity-50 mx-2">{`+${hiddenPermissions} more`}</span>
              )}
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DataTableRowActions row={row} />
        </div>
      )
    }
  ];
};
