import { Firm } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';
import { DataTableColumnHeader } from './data-table-column-header';
import { transformDateTime } from '@/utils/date.utils';
import { NextRouter } from 'next/router';
import { ExternalLinkIcon } from 'lucide-react';
import { FIRM_FILTER_ATTRIBUTES } from '@/constants/firm.filter-attributes';

export const getFirmColumns = (
  t: Function,
  tCurrency: Function,
  router: NextRouter
): ColumnDef<Firm>[] => {
  const translationNamespace = 'contacts';
  const translate = (value: string, namespace: string = '') => {
    return t(value, { ns: namespace || translationNamespace });
  };

  return [
    {
      accessorKey: 'entreprise_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.entreprise_name')}
          attribute={FIRM_FILTER_ATTRIBUTES.ENTREPRISENAME}
        />
      ),
      cell: ({ row }) => <div>{row.original.name}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'main_interlocurtor_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.main_interlocurtor_name')}
          attribute={FIRM_FILTER_ATTRIBUTES.INTERLOCUTORNAME}
        />
      ),
      cell: ({ row }) => {
        const mainInterlocutor = row.original.interlocutorsToFirm?.find(
          (entry) => entry.isMain
        )?.interlocutor;
        return <div>{mainInterlocutor?.name}</div>;
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'main_interlocurtor_surname',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.main_interlocurtor_surname')}
          attribute={FIRM_FILTER_ATTRIBUTES.INTERLOCUTORSURNAME}
        />
      ),
      cell: ({ row }) => {
        const mainInterlocutor = row.original.interlocutorsToFirm?.find(
          (interlocutor) => interlocutor.isMain
        )?.interlocutor;
        return <div>{mainInterlocutor?.surname}</div>;
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.phone')}
          attribute={FIRM_FILTER_ATTRIBUTES.PHONE}
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.phone ? (
            row.original?.phone
          ) : (
            <span className="text-slate-400">{translate('firm.empty_cells.phone')}</span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'website',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.website')}
          attribute={FIRM_FILTER_ATTRIBUTES.WEBSITE}
        />
      ),
      cell: ({ row }) => (
        <div className="font-bold">
          {' '}
          {row.original?.website ? (
            <a
              className="flex items-center gap-1"
              href={row.original?.website}
              target="_blank"
              rel="noreferrer">
              {row.original?.website}
              <ExternalLinkIcon className="h-5 w-5" />
            </a>
          ) : (
            <span className="text-slate-400">{translate('firm.empty_cells.website')}</span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'tax_number',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.tax_number')}
          attribute={FIRM_FILTER_ATTRIBUTES.TAXIDNUMBER}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original?.taxIdNumber || (
            <span className="text-slate-400">{translate('firm.empty_cells.tax_number')}</span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.type')}
          attribute={FIRM_FILTER_ATTRIBUTES.ISPERSON}
        />
      ),
      cell: ({ row }) => (
        <div>
          <Badge className="px-4 py-1">
            {row.original?.isPerson
              ? translate('firm.attributes.particular_entreprise_type')
              : translate('firm.attributes.entreprise_type')}
          </Badge>
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'activity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.activity')}
          attribute={FIRM_FILTER_ATTRIBUTES.ACTIVITY}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original?.activity?.label ? (
            row.original?.activity?.label
          ) : (
            <span className="text-slate-400">{translate('firm.empty_cells.activity')}</span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'currency',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('firm.attributes.currency')}
          attribute={FIRM_FILTER_ATTRIBUTES.CURRENCY}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original?.currency ? (
            <span>
              {row.original?.currency?.code && tCurrency(row.original?.currency?.code)} (
              {row.original?.currency?.symbol})
            </span>
          ) : (
            <span className="text-slate-400">{translate('firm.empty_cells.currency')}</span>
          )}
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
          title={translate('firm.attributes.created_at')}
          attribute={FIRM_FILTER_ATTRIBUTES.CREATEDAT}
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
};
