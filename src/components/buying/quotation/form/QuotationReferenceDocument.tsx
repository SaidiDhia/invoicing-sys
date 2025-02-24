// components/buying/quotation/form/QuotationRefrenceDocument.tsx
import { FileUploader } from '@/components/ui/file-uploader';
import { Label } from '@/components/ui/label';
import { Files } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuotationManager } from '../hooks/useQuotationManager';
import { cn } from '@/lib/utils';
import React from 'react';

interface QuotationReferenceDocumentProps {
  className?: string;
  loading?: boolean;
}

export const QuotationReferenceDocument = ({ className, loading }: QuotationReferenceDocumentProps) => {
  const { t: tInvoicing } = useTranslation('invoicing');
  const quotationManager = useQuotationManager();

  const handleFileChange = (files: File[]) => {
    quotationManager.set('referenceDocFile', files[0] || null);
  };

  return (
    <div className={cn(className, 'space-y-4')}>
      <Label  className="text-2xl flex justify-between">{tInvoicing('quotation.attributes.reference_doc')} (*)</Label>
      
      {quotationManager.referenceDoc?.upload && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <span>{quotationManager.referenceDoc.upload.filename}</span>
          <button 
            onClick={() => quotationManager.set('referenceDoc', undefined)}
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
        value={quotationManager.referenceDocFile ? [quotationManager.referenceDocFile] : []}
        onValueChange={handleFileChange}
      />
    </div>
  );
};
