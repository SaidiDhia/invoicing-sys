import { BankAccount } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';
import { X } from 'lucide-react';
import { DataTableColumnHeader } from './data-table-column-header';
import { FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES } from '@/constants/firm-bank-account.filter-attributes';

export const getBankAccountColumns = (
  t: Function,
  tCurrency: Function
): ColumnDef<BankAccount>[] => {
  const translationNamespace = 'contacts';
  const translate = (value: string, namespace: string = '') => {
    return t(value, { ns: namespace || translationNamespace });
  };

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('bank_accounts.attributes.name')}
          attribute={FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES.NAME}
        />
      ),
      cell: ({ row }) => <div>{row.original.name}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'bic',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('bank_accounts.attributes.bic')}
          attribute={FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES.BIC}
        />
      ),
      cell: ({ row }) => <div>{row.original.bic}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'rib',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('bank_accounts.attributes.rib')}
          attribute={FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES.RIB}
        />
      ),
      cell: ({ row }) => <div>{row.original.rib}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'iban',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('bank_accounts.attributes.iban')}
          attribute={FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES.IBAN}
        />
      ),
      cell: ({ row }) => <div>{row.original.iban}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'currency',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('bank_accounts.attributes.currency')}
          attribute={FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES.CURRENCY}
        />
      ),
      cell: ({ row }) =>
        row.original.currency ? (
          <div>
            {tCurrency(row.original.currency?.code)} ({row.original.currency?.symbol})
          </div>
        ) : (
          <div className="flex items-center gap-2 font-bold">
            <X className="h-5 w-5" /> <span>No Currency</span>
          </div>
        ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'isMain',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('bank_accounts.attributes.isMain')}
          attribute={FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES.ISMAIN}
        />
      ),
      cell: ({ row }) => (
        <div>
          {
            <Badge className="px-5">
              {row.original.isMain
                ? translate('answer.yes', 'common')
                : translate('answer.no', 'common')}
            </Badge>
          }
        </div>
      ),
      enableSorting: false,
      enableHiding: false
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
