/* eslint-disable prettier/prettier */
import { Invoice } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';
import { DataTableColumnHeader } from './data-table-column-header';
import { transformDate, transformDateTime } from '@/utils/date.utils';
import { NextRouter } from 'next/router';
import { INVOICE_FILTER_ATTRIBUTES } from '@/constants/invoice.filter-attributes';

// Function to get the columns for the invoice data table
export const getInvoiceColumns = (
  t: Function, // Translation function
  router: NextRouter, // Next.js router
  firmId?: number, // Optional firm ID
  interlocutorId?: number // Optional interlocutor ID
): ColumnDef<Invoice>[] => {
  const translationNamespace = 'invoicing';
  // eslint-disable-next-line prettier/prettier

  // Helper function for translations
  const translate = (value: string, namespace: string = '') => {
    return t(value, { ns: namespace || translationNamespace });
  };

  // Column definition for the firm
  const firmColumn: ColumnDef<Invoice> = {
    accessorKey: 'firm',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={translate('quotation.attributes.firm')}
        attribute={INVOICE_FILTER_ATTRIBUTES.FIRM}
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
  const interlocutorColumn: ColumnDef<Invoice> = {
    accessorKey: 'interlocutor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={translate('quotation.attributes.interlocutor')}
        attribute={INVOICE_FILTER_ATTRIBUTES.INTERLOCUTOR}
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

  // Array of column definitions for the invoice data table
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'number',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('invoice.attributes.number')}
          attribute={INVOICE_FILTER_ATTRIBUTES.SEQUENTIAL}
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
          title={translate('invoice.attributes.date')}
          attribute={INVOICE_FILTER_ATTRIBUTES.DATE}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.date ? (
            transformDate(row.original.date)
          ) : (
            <span>{t('invoice.attributes.no_date')}</span>
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
          title={translate('invoice.attributes.due_date')}
          attribute={INVOICE_FILTER_ATTRIBUTES.DUEDATE}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.dueDate ? (
            transformDate(row.original.dueDate)
          ) : (
            <span>{t('invoice.attributes.no_due_date')}</span>
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
          title={translate('invoice.attributes.status')}
          attribute={INVOICE_FILTER_ATTRIBUTES.STATUS}
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
          title={translate('invoice.attributes.total')}
          attribute={INVOICE_FILTER_ATTRIBUTES.TOTAL}
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
          title={translate('invoice.attributes.amount_paid')}
          attribute={INVOICE_FILTER_ATTRIBUTES.AMOUNT_PAID}
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
          title={translate('invoice.attributes.withholding')}
          attribute={INVOICE_FILTER_ATTRIBUTES.TAX_WITHHOLDING}
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
          title={translate('invoice.attributes.created_at')}
          attribute={INVOICE_FILTER_ATTRIBUTES.CREATEDAT}
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