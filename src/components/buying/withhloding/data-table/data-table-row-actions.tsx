import { useRouter } from 'next/router';
import { Withholding } from '@/types';
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
import { useWithholdingManager } from '../hooks/useWithholdingManager';
import { useWithholdingActions } from './ActionsContext';

interface DataTableRowActionsProps {
  row: Row<Withholding>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const withholding = row.original;
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const withholdingManager = useWithholdingManager();
  const { openDeleteDialog, openDownloadDialog, openDuplicateDialog } = useWithholdingActions();

  const targetWithholding = () => {
    withholdingManager.set('id', withholding?.id);
    withholdingManager.set('sequential', withholding?.sequential);
  };

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
        <DropdownMenuItem onClick={() => router.push('/buying/withholding/' + withholding.id)}>
          <Telescope className="h-5 w-5 mr-2" /> {tCommon('commands.inspect')}
        </DropdownMenuItem>
        {/* Print */}
        <DropdownMenuItem
          onClick={() => {
            targetWithholding();
            openDownloadDialog?.();
          }}>
          <Download className="h-5 w-5 mr-2" /> {tCommon('commands.download')}
        </DropdownMenuItem>
        {/* Duplicate */}
        <DropdownMenuItem
          onClick={() => {
            targetWithholding();
            openDuplicateDialog?.();
          }}>
          <Copy className="h-5 w-5 mr-2" /> {tCommon('commands.duplicate')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/buying/withholding/' + withholding.id)}>
          <Settings2 className="h-5 w-5 mr-2" /> {tCommon('commands.modify')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            targetWithholding();
            openDeleteDialog?.();
          }}>
          <Trash2 className="h-5 w-5 mr-2" /> {tCommon('commands.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
