import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useInvoiceManager } from '../hooks/useInvoiceManager';
import { cn } from '@/lib/utils';
import React, { useRef } from 'react';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';

interface InvoiceReferenceDocumentProps {
  edit?: boolean;
  className?: string;
  loading?: boolean;
}
export const InvoiceReferenceDocument = ({ edit=true,className, loading }: InvoiceReferenceDocumentProps) => {
  const [fileRemoved, setFileRemoved] = React.useState(false);

  const { t: tInvoicing } = useTranslation('invoicing');
  const invoiceManager = useInvoiceManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Set both properties so validation and UI display work correctly.
      invoiceManager.set('referenceDoc', { upload: { filename: file.name }, file });
      invoiceManager.set('referenceDocFile', file);

    }
    /*else {
      const updatedFiles = invoiceManager.uploadedFiles.filter((uploadedFile) =>
        e.some((file: File) => file === uploadedFile.file)
      );
      invoiceManager.set('uploadedFiles', updatedFiles);
    }*/
  };

  const handleRemoveFile = () => {

    invoiceManager.set('referenceDoc', undefined);
    invoiceManager.set('referenceDocFile', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileRemoved(true);
  };

  // Determine which file name to display: either the freshly uploaded file or the existing upload from the API.
  const fileName = invoiceManager.referenceDoc?.filename;
  return (
    <div className={cn(className, 'space-y-4')}>
      <Label className="text-2xl flex justify-between">
        {tInvoicing('invoice.attributes.reference_doc')} (*)
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
