// components/buying/invoice/form/InvoiceRefrenceDocument.tsx
import { FileUploader } from '@/components/ui/file-uploader';
import { Label } from '@/components/ui/label';
import { Files } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInvoiceManager } from '../hooks/useInvoiceManager';
import { cn } from '@/lib/utils';
import React from 'react';

interface InvoiceReferenceDocumentProps {
  className?: string;
  loading?: boolean;
}

export const InvoiceRefrenceDocument = ({ className, loading }: InvoiceReferenceDocumentProps) => {
  const { t: tInvoicing } = useTranslation('invoicing');
  const invoiceManager = useInvoiceManager();

  const handleFileChange = (files: File[]) => {
    invoiceManager.set('referenceDocFile', files[0] || null);
  };

  return (
    <div className={cn(className, 'space-y-4')}>
      <Label  className="text-2xl flex justify-between">{tInvoicing('invoice.attributes.reference_doc')} (*)</Label>
      
      {invoiceManager.referenceDoc?.upload && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <span>{invoiceManager.referenceDoc.upload.filename}</span>
          <button 
            onClick={() => invoiceManager.set('referenceDoc', undefined)}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <FileUploader
        accept={{
          'application/pdf': [],
          'application/msword': [],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
        }}
        maxFileCount={1}
        value={invoiceManager.referenceDocFile ? [invoiceManager.referenceDocFile] : []}
        onValueChange={handleFileChange}
      />
    </div>
  );
};
