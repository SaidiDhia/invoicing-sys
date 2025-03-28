import { Firm, Interlocutor } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import React from 'react';
import { cn } from '@/lib/utils';
import { SequenceInput } from '@/components/invoicing-commons/SequenceInput';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { UneditableCalendarDayPicker } from '@/components/ui/uneditable/uneditable-calendar-day-picker';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';
import { DatePicker } from '@/components/ui/date-picker';
import { useInvoiceManager } from '../hooks/useInvoiceManager';
import { AddressDetails } from '@/components/invoicing-commons/AddressDetails';

interface InvoiceGeneralInformationProps {
  className?: string;
  firms: Firm[];

  edit?: boolean;
  loading?: boolean;
}

export const InvoiceGeneralInformation = ({
  className,
  firms,

  edit = true,
  loading
}: InvoiceGeneralInformationProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tInvoicing } = useTranslation('invoicing');
  const router = useRouter();
  const invoiceManager = useInvoiceManager();
  const mainInterlocutor = invoiceManager.firm?.interlocutorsToFirm?.find((entry) => entry?.isMain);

  return (
    <div className={cn(className)}>
      <div className="flex gap-4 pb-5 border-b">
        <div className="w-full">
          <Label>{tInvoicing('invoice.attributes.date')} (*)</Label>
          {edit ? (
            <DatePicker
              className="w-full mt-2"
              value={invoiceManager?.date || new Date()}
              onChange={(value: Date) => {
                invoiceManager.set('date', value);
              }}
              isPending={loading}
            />
          ) : (
            <UneditableCalendarDayPicker value={invoiceManager?.date} />
          )}
        </div>
        <div className="w-full">
          <Label>{tInvoicing('invoice.attributes.due_date')} (*)</Label>
          {edit ? (
            <DatePicker
              className="w-full mt-2"
              value={invoiceManager?.dueDate || undefined}
              onChange={(value: Date) => {
                invoiceManager.set('dueDate', value);
              }}
              isPending={loading}
            />
          ) : (
            <UneditableCalendarDayPicker value={invoiceManager?.date} />
          )}
        </div>
      </div>

      <div className="flex gap-4 pb-5 border-b mt-5">
        <div className="w-4/6">
          <Label>{tInvoicing('invoice.attributes.object')} (*)</Label>
          {edit ? (
            <Input
              className="mt-1"
              placeholder="Ex. Facture pour le 1er trimestre 2024"
              value={invoiceManager.object || ''}
              onChange={(e) => {
                invoiceManager.set('object', e.target.value);
              }}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={invoiceManager.object} />
          )}
        </div>
        {/* Sequential */}
        <div className="w-2/6">
          <Label>{tInvoicing('invoice.singular')} N° (*)</Label>
          {edit ? (
            <Input
              className="mt-1"
              placeholder="INV-2025-02-24-13"
              value={invoiceManager.sequential || ''}
              onChange={(e) => {
                invoiceManager.set('sequential', e.target.value);
              }}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={invoiceManager.sequential} />
          )}
        </div>
      </div>
      <div>
        <div className="flex gap-4 pb-5 border-b mt-5">
          <div className="flex flex-col gap-4 w-1/2">
            <div>
              <Label>{tInvoicing('invoice.attributes.firm')} (*)</Label>
              {edit ? (
                <SelectShimmer isPending={loading}>
                  <Select
                    onValueChange={(e) => {
                      const firm = firms?.find((firm) => firm.id === parseInt(e));
                      invoiceManager.setFirm(firm);
                      invoiceManager.set('currency', firm?.currency);
                    }}
                    value={invoiceManager.firm?.id?.toString()}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={tInvoicing('invoice.associate_firm')} />
                    </SelectTrigger>
                    <SelectContent>
                      {firms?.map((firm: Partial<Firm>) => (
                        <SelectItem
                          key={firm.id}
                          value={firm.id?.toString() || ''}
                          className="mx-1">
                          {firm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SelectShimmer>
              ) : (
                <UneditableInput value={invoiceManager?.firm?.name} />
              )}
            </div>

            {/* Shortcut to access firm form */}
            {edit && (
              <Label
                className="mx-1 underline cursor-pointer"
                onClick={() => router.push('/contacts/new-firm')}>
                {tInvoicing('common.firm_not_there')}
              </Label>
            )}
          </div>
          <div className="w-1/2">
            <Label>{tInvoicing('invoice.attributes.interlocutor')} (*)</Label>
            {edit ? (
              <SelectShimmer isPending={loading}>
                <Select
                  disabled={!invoiceManager?.firm?.id}
                  onValueChange={(e) => {
                    invoiceManager.setInterlocutor({ id: parseInt(e) } as Interlocutor);
                  }}
                  value={invoiceManager.interlocutor?.id?.toString()}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={tInvoicing('invoice.associate_interlocutor')} />
                  </SelectTrigger>
                  <SelectContent>
                    {invoiceManager.firm?.interlocutorsToFirm?.map((entry: any) => (
                      <SelectItem
                        key={entry.interlocutor?.id || 'interlocutor'}
                        value={entry.interlocutor?.id?.toString()}
                        className="mx-1">
                        {entry.interlocutor?.name} {entry.interlocutor?.surname}{' '}
                        {entry.isMain && (
                          <span className="font-bold">({tCommon('words.main_m')})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SelectShimmer>
            ) : (
              <UneditableInput
                value={
                  <div>
                    {invoiceManager?.interlocutor?.name} {invoiceManager.interlocutor?.surname}
                    {invoiceManager?.interlocutor?.id == mainInterlocutor?.interlocutor?.id && (
                      <span className="font-bold mx-1"> ({tCommon('words.main_m')})</span>
                    )}
                  </div>
                }
              />
            )}
          </div>
        </div>
         
      </div>
    </div>
  );
};
