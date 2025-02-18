import { Permission } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './data-table-column-header';
import { getPermissionTranslation } from '../utils/getPermissionTranslation';

export const getPermissionColumns = (
  t: Function,
  tPermission: Function
): ColumnDef<Permission>[] => {
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
          title={translate('permissions.attributes.label')}
          attribute="label"
        />
      ),
      cell: ({ row }) => {
        return <div>{tPermission(`${getPermissionTranslation(row?.original?.label)}.value`)}</div>;
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('permissions.attributes.description')}
          attribute="description"
        />
      ),
      cell: ({ row }) => (
        <div>
          {tPermission(`${getPermissionTranslation(row?.original?.label)}.description`) ||
            t('permissions.attributes.no_description')}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    }
  ];
};
