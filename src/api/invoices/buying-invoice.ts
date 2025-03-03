import axios from '../axios';
import { differenceInDays, isAfter } from 'date-fns';
import { DISCOUNT_TYPE } from '../../types/enums/discount-types';
import { upload } from '../upload';
import { api } from '..';

import { INVOICE_FILTER_ATTRIBUTES } from '@/constants/invoice.filter-attributes';
import { BUYING_INVOICE_STATUS, BuyingInvoice, BuyingInvoiceUploadedFile, CreateBuyingInvoiceDto, DuplicateBuyingInvoiceDto, PagedBuyingInvoice, ResponseBuyingInvoiceRangeDto, UpdateBuyingInvoiceDto } from '@/types/invoices/buying-invoice';
import { ToastValidation } from '@/types';

import { DateRange } from 'react-day-picker';
import { AxiosError } from 'axios';

const factory = (): CreateBuyingInvoiceDto => {
  return {
    date: '',
    dueDate: '',
    status: BUYING_INVOICE_STATUS.Unpaid,
    generalConditions: '',
    total: 0,
    subTotal: 0,
    discount: 0,
    discount_type: DISCOUNT_TYPE.AMOUNT,
    currencyId: 0,
    firmId: 0,
    interlocutorId: 0,
    notes: '',
    articleInvoiceEntries: [],
    invoiceMetaData: {
      hasBankingDetails: true,
      hasGeneralConditions: true,
      showArticleDescription: true,
      taxSummary: []
    },
    files: [],
    referenceDocId:0,
    referenceDocFile:undefined,
  };
};

const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string,
  search: string = '',
  relations: string[] = ['firm', 'interlocutor'],
  firmId?: number,
  interlocutorId?: number
): Promise<PagedBuyingInvoice> => {
  const generalFilter = search
    ? Object.values(INVOICE_FILTER_ATTRIBUTES)
      .map((key) => `${key}||$cont||${search}`)
      .join('||$or||')
    : '';
  const firmCondition = firmId ? `firmId||$eq||${firmId}` : '';
  const interlocutorCondition = interlocutorId ? `interlocutorId||$cont||${interlocutorId}` : '';
  const filters = [generalFilter, firmCondition, interlocutorCondition].filter(Boolean).join(',');

  const response = await axios.get<PagedBuyingInvoice>(
    new String().concat(
      'public/buying-invoice/list?',
      `sort=${sortKey},${order}&`,
      `filter=${filters}&`,
      `limit=${size}&page=${page}&`,
      `join=${relations.join(',')}`
    )
  );
  return response.data;
};

const findOne = async (
  id: number,
  relations: string[] = [
    'firm',
    'currency',
    'bankAccount',
    'quotation',
    'interlocutor',
    'firm.currency',
    'invoiceMetaData',
    'uploads',
    'uploads.upload',
    'payments',
    'payments.payment',
    'taxWithholding',
    'articleInvoiceEntries',
    'firm.interlocutorsToFirm',
    'articleInvoiceEntries.article',
    'articleInvoiceEntries.articleInvoiceEntryTaxes',
    'articleInvoiceEntries.articleInvoiceEntryTaxes.tax',
    'referenceDoc'
  ]
): Promise<BuyingInvoice & { files: BuyingInvoiceUploadedFile[] }> => {
  const response = await axios.get<BuyingInvoice>(`public/buying-invoice/${id}?join=${relations.join(',')}`);
  return { ...response.data, files: await getInvoiceUploads(response.data) };
};


const uploadInvoiceFiles = async (files: File[]): Promise<number[]> => {
  return files && files?.length > 0 ? await upload.uploadFiles(files) : [];
};

const create = async (invoice: CreateBuyingInvoiceDto, files: File[]): Promise<BuyingInvoice> => {
  
  let referenceDocId = invoice.referenceDocId;
  if (invoice.referenceDocFile) {
    const [uploadId] = await uploadInvoiceFiles([invoice.referenceDocFile]);
    referenceDocId = uploadId;
  }

  const uploadIds = await uploadInvoiceFiles(files);
  const response = await axios.post<BuyingInvoice>('public/buying-invoice', {
    ...invoice,
    referenceDocId,
    uploads: uploadIds.map((id) => {
      return { uploadId: id };
    })
  });
  return response.data;
};

const getInvoiceUploads = async (invoice: BuyingInvoice): Promise<BuyingInvoiceUploadedFile[]> => {
  if (!invoice?.uploads) return [];

  const uploads = await Promise.all(
    invoice.uploads.map(async (u) => {
      if (u?.upload?.slug) {
        const blob = await api.upload.fetchBlobBySlug(u.upload.slug);
        const filename = u.upload.filename || '';
        if (blob)
          return { upload: u, file: new File([blob], filename, { type: u.upload.mimetype }) };
      }
      return { upload: u, file: undefined };
    })
  );
  return uploads
    .filter((u) => !!u.file)
    .sort(
      (a, b) =>
        new Date(a.upload.createdAt ?? 0).getTime() - new Date(b.upload.createdAt ?? 0).getTime()
    ) as BuyingInvoiceUploadedFile[];
};

const download = async (id: number): Promise<any> => {
  const invoice = await findOne(id, []);
  console.log("id from api",id)
  const response = await axios.get<string>(`public/buying-invoice/${id}/download`, {
    responseType: 'blob'
  });
  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${invoice.sequential}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return response;
};

const duplicate = async (duplicateInvoiceDto: DuplicateBuyingInvoiceDto): Promise<BuyingInvoice> => {
  const response = await axios.post<BuyingInvoice>('/public/buying-invoice/duplicate', duplicateInvoiceDto);
  return response.data;
};

const update = async (invoice: UpdateBuyingInvoiceDto, files: File[]): Promise<BuyingInvoice> => {
  
  let referenceDocId = invoice.referenceDocId;
  if (invoice.referenceDocFile) {
    const [uploadId] = await uploadInvoiceFiles([invoice.referenceDocFile]);
    referenceDocId = uploadId;
  }
  
  const uploadIds = await uploadInvoiceFiles(files);
  const response = await axios.put<BuyingInvoice>(`public/buying-invoice/${invoice.id}`, {
    ...invoice,
    referenceDocId,
    uploads: [
      ...(invoice.uploads || []),
      ...uploadIds.map((id) => {
        return { uploadId: id };
      })
    ]
  });
  return response.data;
};

const remove = async (id: number): Promise<BuyingInvoice> => {
  const response = await axios.delete<BuyingInvoice>(`public/buying-invoice/${id}`);
  return response.data;
};

const existSequential = async (sequential: string, firmId: number)=> {
  try {
    return await axios.get(`public/buying-invoice/seq?sequential=${sequential}&firmId=${firmId}`);

  } catch (error) {
    if (error instanceof AxiosError) {
      // Now TypeScript knows `error` is of type AxiosError
      if (error.response?.status === 404) {
        return false; // Invoice not found
      }
      console.error('Axios error checking sequential:', error.message);
    } 
    throw new Error('Failed to check sequential');
  }
};

const validate = async(invoice: Partial<BuyingInvoice>, dateRange?: DateRange): Promise<ToastValidation> => {
  if (!invoice.date) return { message: 'La date est obligatoire' };
  const invoiceDate = new Date(invoice.date);
  if (
    dateRange?.from &&
    !isAfter(invoiceDate, dateRange.from) &&
    invoiceDate.getTime() !== dateRange.from.getTime()
  ) {
    return { message: `La date doit être après ou égale à ${dateRange.from.toLocaleDateString()}` };
  }

  
  if (!invoice.referenceDocId && !invoice.referenceDocFile) {
    return { message: 'Le document de référence est obligatoire' };
  }
  if (!invoice.sequential) return { message: "Le numero de sequence est obligatoire" };
  if (!/^[A-Z0-9\-]+$/.test(invoice.sequential)) {
    return{ message :"Le numéro séquentiel ne peut contenir que des lettres majuscules, des chiffres et des tirets."};
  }
  if (invoice.sequential.length < 5) {
    return{ message :"Le numéro séquentiel doit contenir au moins 5 caractères."};
  }

  // Vérifie la longueur maximale
  if (invoice.sequential.length > 20) {
    return{ message :"Le numéro séquentiel ne peut pas dépasser 20 caractères."};
  }

  if (!invoice.firmId) return { message: "Le firm est obligatoire" };

  const existInvoice=await existSequential(invoice.sequential,invoice.firmId)
  console.log("existinvoice",existInvoice)
  console.log("currentId",invoice.id)
  if((existInvoice && existInvoice.data?.id!=invoice?.id)||existInvoice){
    return{ message :" Une Facture avec ce numéro séquentiel existe déjà pour l'entreprise spécifiée. "};
  }


  if (
    dateRange?.to &&
    isAfter(invoiceDate, dateRange.to) &&
    invoiceDate.getTime() !== dateRange.to.getTime()
  ) {
    return { message: `La date doit être avant ou égale à ${dateRange.to.toLocaleDateString()}` };
  }
  if (!invoice.referenceDocId && !invoice.referenceDocFile) {
    return { message: 'Le document de référence est obligatoire' };
  }
  if (!invoice.dueDate) return { message: "L'échéance est obligatoire" };
  if (!invoice.object) return { message: "L'objet est obligatoire" };
  const dueDate = new Date(invoice.dueDate);
  if (differenceInDays(invoiceDate, dueDate) > 0) {
    return { message: "L'échéance doit être supérieure ou égale à la date" };
  }
  if (!invoice.firmId || !invoice.interlocutorId) {
    return { message: 'Entreprise et interlocuteur sont obligatoire' };
  }
  return { message: '' };
};


export const buyingInvoice = {
  factory,
  findPaginated,
  findOne,
  //findByRange,
  create,
  download,
  duplicate,
  update,
  remove,
  validate
};
