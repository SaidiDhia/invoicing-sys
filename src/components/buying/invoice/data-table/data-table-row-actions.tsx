import { useRouter } from 'next/router';
import { BuyingInvoice } from '@/types/invoices/buying-invoice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Copy, Download, Settings2, Telescope, Trash2 } from 'lucide-react';
import { useInvoiceManager } from '../hooks/useInvoiceManager';
import { useInvoiceActions } from './ActionsContext';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api';
import { getErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';

interface DataTableRowActionsProps {
  row: Row<BuyingInvoice>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const invoice = row.original;
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const invoiceManager = useInvoiceManager();
  const { openDeleteDialog, openDownloadDialog, openDuplicateDialog } = useInvoiceActions();

  const targetInvoice = () => {
    invoiceManager.set('id',invoice.id);
    invoiceManager.set('sequential',invoice.sequential);
  };

  const { t: tInvoicing, ready: invoicingReady } = useTranslation('invoicing');


  const { mutate: downloadInvoice } = useMutation({
    mutationFn: (data: { id: number}) =>
      api.buyingInvoice.download(data.id),
    onSuccess: () => {
      toast.success(tInvoicing('invoice.action_download_success'));
    },
    onError: (error) => {
      toast.error(
        getErrorMessage('invoicing', error, tInvoicing('invoice.action_download_failure'))
      );
    }
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[160px]">
        <DropdownMenuLabel className="text-center">{tCommon('commands.actions')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Inspect */}
        <DropdownMenuItem onClick={() => router.push('/buying/invoice/' + invoice.id)}>
          <Telescope className="h-5 w-5 mr-2" /> {tCommon('commands.inspect')}
        </DropdownMenuItem>
        {/* Print */}
        <DropdownMenuItem
          onClick={() => {
            targetInvoice();
            invoice?.id && downloadInvoice({ id: invoice.id })
          }}>
          <Download className="h-5 w-5 mr-2" /> {tCommon('commands.download')}
        </DropdownMenuItem>
        {/* Duplicate */}
        <DropdownMenuItem
          onClick={() => {
            targetInvoice();
            openDuplicateDialog?.();
          }}>
          <Copy className="h-5 w-5 mr-2" /> {tCommon('commands.duplicate')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/buying/invoice/' + invoice.id)}>
          <Settings2 className="h-5 w-5 mr-2" /> {tCommon('commands.modify')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            targetInvoice();
            openDeleteDialog?.();
          }}>
          <Trash2 className="h-5 w-5 mr-2" /> {tCommon('commands.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
