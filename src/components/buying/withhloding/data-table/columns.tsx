/* eslint-disable prettier/prettier */
import { Withholding } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';
import { DataTableColumnHeader } from './data-table-column-header';
import { transformDate, transformDateTime } from '@/utils/date.utils';
import { NextRouter } from 'next/router';
import { WITHHOLDING_FILTER_ATTRIBUTES } from '@/constants/withholding.filter-attributes';

// Function to get the columns for the withholding data table
export const getWithholdingColumns = (
  t: Function, // Translation function
  router: NextRouter, // Next.js router
  firmId?: number, // Optional firm ID
  interlocutorId?: number // Optional interlocutor ID
): ColumnDef<Withholding>[] => {
  const translationNamespace = 'invoicing';
  // eslint-disable-next-line prettier/prettier

  // Helper function for translations
  const translate = (value: string, namespace: string = '') => {
    return t(value, { ns: namespace || translationNamespace });
  };

  // Column definition for the firm
  const firmColumn: ColumnDef<Withholding> = {
    accessorKey: 'firm',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={translate('quotation.attributes.firm')}
        attribute={WITHHOLDING_FILTER_ATTRIBUTES.FIRM}
      />
    ),
    cell: ({ row }) => (
      <div
        className="font-bold cursor-pointer hover:underline"
        onClick={() => router.push(`/contacts/firm/${row.original?.firmId}`)}>
        {row.original.firm?.name}
      </div>
    ),
    enableSorting: true,
    enableHiding: true
  };

  // Column definition for the interlocutor
  const interlocutorColumn: ColumnDef<Withholding> = {
    accessorKey: 'interlocutor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={translate('quotation.attributes.interlocutor')}
        attribute={WITHHOLDING_FILTER_ATTRIBUTES.INTERLOCUTOR}
      />
    ),
    cell: ({ row }) => (
      <div
        className="font-bold cursor-pointer hover:underline"
        onClick={() => router.push(`/contacts/interlocutor/${row.original?.interlocutorId}`)}>
        {row.original?.interlocutor?.surname} {row.original?.interlocutor?.name}
      </div>
    ),
    enableSorting: true,
    enableHiding: true
  };

  // Array of column definitions for the withholding data table
  const columns: ColumnDef<Withholding>[] = [
    {
      accessorKey: 'number',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.number')}
          attribute={WITHHOLDING_FILTER_ATTRIBUTES.SEQUENTIAL}
        />
      ),
      cell: ({ row }) => <div>{row.original.sequential}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.date')}
          attribute={WITHHOLDING_FILTER_ATTRIBUTES.DATE}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.date ? (
            transformDate(row.original.date)
          ) : (
            <span>{t('withholding.attributes.no_date')}</span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'due_date',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.due_date')}
          attribute={WITHHOLDING_FILTER_ATTRIBUTES.DUEDATE}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.dueDate ? (
            transformDate(row.original.dueDate)
          ) : (
            <span>{t('withholding.attributes.no_due_date')}</span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.status')}
          attribute={WITHHOLDING_FILTER_ATTRIBUTES.STATUS}
        />
      ),
      cell: ({ row }) => (
        <div>
          <Badge className="px-4 py-1">{t(row.original?.status || '')}</Badge>
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.total')}
          attribute={WITHHOLDING_FILTER_ATTRIBUTES.TOTAL}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original?.total?.toFixed(row.original?.currency?.digitAfterComma)}{' '}
          {row.original?.currency?.symbol}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'amount_paid',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.amount_paid')}
          attribute={WITHHOLDING_FILTER_ATTRIBUTES.AMOUNT_PAID}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original?.amountPaid?.toFixed(row.original?.currency?.digitAfterComma)}{' '}
          {row.original?.currency?.symbol}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'withholding',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.withholding')}
          attribute={WITHHOLDING_FILTER_ATTRIBUTES.TAX_WITHHOLDING}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original?.taxWithholdingAmount?.toFixed(row.original?.currency?.digitAfterComma)}{' '}
          {row.original?.currency?.symbol}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('withholding.attributes.created_at')}
          attribute={WITHHOLDING_FILTER_ATTRIBUTES.CREATEDAT}
        />
      ),
      cell: ({ row }) => <div>{transformDateTime(row.original?.createdAt || '')}</div>,
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

  // Conditionally add firm and interlocutor columns if their IDs are not provided
  if (!firmId) columns.splice(2, 0, firmColumn);
  if (!interlocutorId) columns.splice(3, 0, interlocutorColumn);

  return columns;
};