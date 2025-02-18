import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/common';
import { BankAccountForm } from '../BankAccountForm';
import { Info, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/other/useMediaQuery';

interface BankAccountCreateDialogProps {
  className?: string;
  open: boolean;
  createBankAccount: () => void;
  isCreatePending?: boolean;
  onClose: () => void;
  mainByDefault: boolean;
}

export const BankAccountCreateDialog: React.FC<BankAccountCreateDialogProps> = ({
  className,
  open,
  createBankAccount,
  isCreatePending,
  onClose,
  mainByDefault
}) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tSettings } = useTranslation('settings');

  const isDesktop = useMediaQuery('(min-width: 1500px)');

  const title = (
    <>
      <Landmark />
      <Label className="font-semibold">{tSettings('bank_account.new')}</Label>
    </>
  );
  const description = (
    <>
      <Info className="w-12 h-12" />
      <Label className="leading-5">{tSettings('bank_account.hints.create_dialog_hint')}</Label>
    </>
  );
  const footer = (
    <div className="flex gap-2 mt-2">
      <Button
        onClick={() => {
          createBankAccount?.();
        }}>
        {tCommon('commands.save')}
        <Spinner show={isCreatePending} />
      </Button>
      <Button
        variant={'secondary'}
        onClick={() => {
          onClose();
        }}>
        {tCommon('commands.cancel')}
      </Button>
    </div>
  );
  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={cn('max-w-[35vw]', className)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
            <DialogDescription className="flex gap-2 pt-4 items-center px-2">
              {description}
            </DialogDescription>
          </DialogHeader>
          <BankAccountForm className="gap-2 px-3 pb-5" mainByDefault={mainByDefault} />
          <DialogFooter className="border-t pt-2">{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className={cn('overflow-hidden', className)}>
        <ScrollArea className="h-[calc(100vh-100px)] w-full rounded-md px-4">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">{title}</DrawerTitle>
            <DrawerDescription className="flex gap-2 py-4 items-center px-2">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          <BankAccountForm className="gap-2 px-3 pb-5" mainByDefault={mainByDefault} />
        </ScrollArea>
        <DrawerFooter className="border-t py-2">{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
