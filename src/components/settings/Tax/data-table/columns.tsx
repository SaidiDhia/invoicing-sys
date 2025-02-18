import { Tax } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';
import { TAX_FILTER_ATTRIBUTES } from '@/constants/tax.filter-attributes';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from './data-table-column-header';
import { Label } from '@/components/ui/label';

export const getTaxColumns = (t: Function, tCommon: Function): ColumnDef<Tax>[] => {
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
          title={translate('tax.attributes.label')}
          attribute={TAX_FILTER_ATTRIBUTES.LABEL}
        />
      ),
      cell: ({ row }) => <Label className="font-bold">{row.original.label}</Label>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'isRate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('tax.attributes.type')}
          attribute={TAX_FILTER_ATTRIBUTES.ISRATE}
        />
      ),
      cell: ({ row }) => (
        <Badge>
          {row.original.isRate ? translate('tax.types.rate') : translate('tax.types.fixed')}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('tax.attributes.value')}
          attribute={TAX_FILTER_ATTRIBUTES.VALUE}
        />
      ),
      cell: ({ row }) => (
        <Label className="font-bold">
          {row.original.value?.toFixed(2)}
          {row.original.isRate && '%'}
        </Label>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'is_special',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('tax.attributes.is_special')}
          attribute={TAX_FILTER_ATTRIBUTES.ISSPECIAL}
        />
      ),
      cell: ({ row }) => (
        <div>
          <Badge>{row.original.isSpecial ? tCommon('answer.yes') : tCommon('answer.no')}</Badge>
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions row={row} />
        </div>
      )
    }
  ];
};
