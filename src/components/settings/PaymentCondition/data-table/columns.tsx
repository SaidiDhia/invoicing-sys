import { PaymentCondition } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';
import { DataTableColumnHeader } from './data-table-column-header';
import { PAYMENT_CONDITION_FILTER_ATTRIBUTES } from '@/constants/payment-condition.filter-attributes';

export const getPayementConditionColumns = (t: Function): ColumnDef<PaymentCondition>[] => {
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
          title={translate('payment_condition.attributes.label')}
          attribute={PAYMENT_CONDITION_FILTER_ATTRIBUTES.LABEL}
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
          title={translate('payment_condition.attributes.description')}
          attribute={PAYMENT_CONDITION_FILTER_ATTRIBUTES.DESCRIPTION}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.description || <span className="text-slate-400">Aucune Description</span>}
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
