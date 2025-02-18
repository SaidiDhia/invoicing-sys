import { useRouter } from 'next/router';
import { Firm } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useFirmManager } from '@/components/contacts/firm/hooks/useFirmManager';
import { useFirmActions } from './ActionsContext';
import { Settings2, Telescope, Trash2 } from 'lucide-react';

interface DataTableRowActionsProps {
  row: Row<Firm>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const firm = row.original;
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const firmManager = useFirmManager();
  const { openDeleteDialog } = useFirmActions();

  const targetFirm = () => {
    firmManager.set('id', firm.id);
    firmManager.set('name', firm.name);
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
        <DropdownMenuItem onClick={() => router.push(`/contacts/firm/${firm.id}/overview`)}>
          <Telescope className="h-5 w-5 mr-2" /> {tCommon('commands.inspect')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/contacts/modify-firm/${firm.id}`)}>
          <Settings2 className="h-5 w-5 mr-2" /> {tCommon('commands.modify')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            targetFirm();
            openDeleteDialog();
          }}>
          <Trash2 className="h-5 w-5 mr-2" /> {tCommon('commands.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
