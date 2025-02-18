import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { FileUploader } from '@/components/ui/file-uploader';
import { Textarea } from '@/components/ui/textarea';
import { Files, NotebookTabs } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInvoiceManager } from 'C:/Users/MSI/Desktop/PFE/invoicing-sys-pfe/invoicing-sys/src/components/selling/invoice/hooks/useInvoiceManager';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import React from 'react';

interface InvoiceExtraOptionsProps {
  className?: string;
  loading?: boolean;
}

export const InvoiceExtraOptions = ({ className, loading }: InvoiceExtraOptionsProps) => {
  const { t: tInvoicing } = useTranslation('invoicing');
  const invoiceManager = useInvoiceManager();

  const handleFilesChange = (files: File[]) => {
    if (files.length > invoiceManager.uploadedFiles.length) {
      const newFiles = files.filter(
        (file) => !invoiceManager.uploadedFiles.some((uploadedFile) => uploadedFile.file === file)
      );
      invoiceManager.set('uploadedFiles', [
        ...invoiceManager.uploadedFiles,
        ...newFiles.map((file) => ({ file }))
      ]);
    } else {
      const updatedFiles = invoiceManager.uploadedFiles.filter((uploadedFile) =>
        files.some((file) => file === uploadedFile.file)
      );
      invoiceManager.set('uploadedFiles', updatedFiles);
    }
  };

  return (
    <Accordion type="multiple" className={cn(className, 'mx-1 border-b')}>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex gap-2 justify-center items-center">
            <Files />
            <Label>{tInvoicing('invoice.attributes.files')}</Label>
          </div>
        </AccordionTrigger>
        <AccordionContent className="m-5">
          <FileUploader
            accept={{
              'image/*': [],
              'application/pdf': [],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
              'application/msword': [],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
              'application/vnd.ms-excel': []
            }}
            className="my-5"
            maxFileCount={Infinity}
            value={invoiceManager.uploadedFiles?.map((d) => d.file)}
            onValueChange={handleFilesChange}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <div className="flex gap-2 justify-center items-center">
            <NotebookTabs />
            <Label>{tInvoicing('invoice.attributes.notes')}</Label>
          </div>
        </AccordionTrigger>
        <AccordionContent className="m-5">
          <Textarea
            placeholder={tInvoicing('invoice.attributes.notes')}
            className="resize-none"
            value={invoiceManager.notes}
            onChange={(e) => invoiceManager.set('notes', e.target.value)}
            isPending={loading}
            rows={7}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
