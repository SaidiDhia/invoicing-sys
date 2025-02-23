import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { BuyingInvoice } from '@/types/invoices/buying-invoice';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface QuotationInvoiceListProps {
  className?: string;
  invoices: BuyingInvoice[];
}

export const QuotationInvoiceList = ({ className, invoices }: QuotationInvoiceListProps) => {
  const { t: tInvoicing } = useTranslation('invoicing');
  return (
    <Accordion type="multiple" className={cn(className)}>
      <AccordionItem value="invoice-list">
        <AccordionTrigger>
          <h1 className="font-bold">{tInvoicing('invoice.invoice_list')}</h1>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-inside space-y-0.5">
            {invoices
              .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
              .map((invoice, index) => (
                <li key={invoice.id} className="font-medium">
                  <Label>
                    <span>{`${tInvoicing('invoice.singular')} ${(index + 1).toString().padStart(2, '0')} : `}</span>
                  </Label>
                  <Link
                    className="underline cursor-pointer"
                    href={`/buying/invoice/${invoice.id}`}>
                    {invoice.sequential}
                  </Link>
                </li>
              ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
