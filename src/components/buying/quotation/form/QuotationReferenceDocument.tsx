import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import React, { useRef } from 'react';
import { useQuotationManager } from '../hooks/useQuotationManager';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';

interface QuotationReferenceDocumentProps {
  edit?: boolean;
  className?: string;
  loading?: boolean;
}

export const QuotationReferenceDocument = ({edit=true, className, loading }: QuotationReferenceDocumentProps) => {
   const [fileRemoved, setFileRemoved] = React.useState(false);
 
  const { t: tInvoicing } = useTranslation('invoicing');
  const quotationManager = useQuotationManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Set both properties so validation and UI display work correctly.
      quotationManager.set('referenceDoc', { upload: { filename: file.name }, file });
      quotationManager.set('referenceDocFile', file);
    }
  };

  const handleRemoveFile = () => {
    quotationManager.set('referenceDoc', undefined);
    quotationManager.set('referenceDocFile', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine which file name to display: either the freshly uploaded file or the existing upload from the API.
  const fileName = quotationManager.referenceDoc?.filename;

  return (
    <div className={cn(className, 'space-y-4')}>
      <Label className="text-2xl flex justify-between">
        {tInvoicing('quotation.attributes.reference_doc')} (*)
      </Label>

      {edit ? (
        <>
         {fileName ? (
        <div className="flex items-center gap-2 p-2 border rounded">
          <span>{fileName}</span>
          <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      ) : null}

      {fileRemoved || !fileName ?(
        <input
        type="file"
        accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="block"
      />
      ):null}</>) 
      : <UneditableInput value={fileName} />
      }

    </div>
  );
};
