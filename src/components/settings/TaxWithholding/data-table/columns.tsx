import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';
import { DataTableColumnHeader } from './data-table-column-header';
import { Label } from '@/components/ui/label';
import { TAX_WITHHOLDING_FILTER_ATTRIBUTES } from '@/constants/tax-withholding-attributes';
import { TaxWithholding } from '@/types';

export const getTaxWithholdingColumns = (t: Function): ColumnDef<TaxWithholding>[] => {
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
          title={translate('withholding.attributes.label')}
          attribute={TAX_WITHHOLDING_FILTER_ATTRIBUTES.LABEL}
        />
      ),
      cell: ({ row }) => <Label className="font-bold">{row.original.label}</Label>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.rate')}
          attribute={TAX_WITHHOLDING_FILTER_ATTRIBUTES.RATE}
        />
      ),
      cell: ({ row }) => (
        <Label className="font-bold">
          {row.original.rate?.toFixed(2)}
          {row.original.rate && '%'}
        </Label>
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
