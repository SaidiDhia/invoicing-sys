import { BankAccount } from '@/types';
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
import { useBankAccountManager } from '../hooks/useBankAccountManager';
import { ArrowUp, Settings2, Trash2 } from 'lucide-react';
import { useBankAccountActions } from './ActionsContext';

interface DataTableRowActionsProps {
  row: Row<BankAccount>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const account = row.original;
  const { t: tCommon } = useTranslation('common');
  const bankAccountManager = useBankAccountManager();
  const { openUpdateDialog, openDeleteDialog, openPromoteDialog } = useBankAccountActions();
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
        <DropdownMenuItem
          onClick={() => {
            bankAccountManager.setBankAccount(account);
            openUpdateDialog();
          }}>
          <Settings2 className="h-5 w-5 mr-2" /> {tCommon('commands.modify')}
        </DropdownMenuItem>
        {!account.isMain && (
          <DropdownMenuItem
            onClick={() => {
              bankAccountManager.setBankAccount(account);
              openPromoteDialog();
            }}>
            <ArrowUp className="h-5 w-5 mr-2" /> {tCommon('commands.promote')}
          </DropdownMenuItem>
        )}
        {!account.isMain && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                bankAccountManager.setBankAccount(account);
                openDeleteDialog();
              }}>
              <Trash2 className="h-5 w-5 mr-2" /> {tCommon('commands.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
