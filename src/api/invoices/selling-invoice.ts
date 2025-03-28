import axios from '../axios';
import { differenceInDays, isAfter } from 'date-fns';
import { DISCOUNT_TYPE } from '../../types/enums/discount-types';
import { upload } from '../upload';
import { api } from '..';
import {DateRange,ToastValidation,UpdateInvoiceSequentialNumber}  from '@/types';
import {
  CreateInvoiceDto,
  
  DuplicateInvoiceDto,
  INVOICE_STATUS,
  Invoice,
  InvoiceUploadedFile,
  PagedInvoice,
  ResponseInvoiceRangeDto,
  
  UpdateInvoiceDto,
  
} from '@/types/invoices/selling-invoice';
import { INVOICE_FILTER_ATTRIBUTES } from '@/constants/invoice.filter-attributes';

const factory = (): CreateInvoiceDto => {
  return {
    date: '',
    dueDate: '',
    status: INVOICE_STATUS.Unpaid,
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
      showDeliveryAddress: true,
      showInvoiceAddress: true,
      hasBankingDetails: true,
      hasGeneralConditions: true,
      showArticleDescription: true,
      taxSummary: []
    },
    files: []
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
): Promise<PagedInvoice> => {
  const generalFilter = search
    ? Object.values(INVOICE_FILTER_ATTRIBUTES)
      .map((key) => `${key}||$cont||${search}`)
      .join('||$or||')
    : '';

    let filters: string=""
    let mainCondition = "";
    if(firmId || interlocutorId){
      mainCondition = firmId ? `firmId||$eq||${firmId}` : interlocutorId?`interlocutorId||$cont||${interlocutorId}`:"";
    }
    filters = mainCondition && generalFilter ? `${mainCondition}&&(${generalFilter})` : mainCondition || generalFilter;

  const response = await axios.get<PagedInvoice>(
    new String().concat(
      'public/selling-invoice/list?',
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
    'firm.deliveryAddress',
    'firm.invoicingAddress',
    'articleInvoiceEntries',
    'firm.interlocutorsToFirm',
    'articleInvoiceEntries.article',
    'articleInvoiceEntries.articleInvoiceEntryTaxes',
    'articleInvoiceEntries.articleInvoiceEntryTaxes.tax'
  ]
): Promise<Invoice & { files: InvoiceUploadedFile[] }> => {
  const response = await axios.get<Invoice>(`public/selling-invoice/${id}?join=${relations.join(',')}`);
  return { ...response.data, files: await getInvoiceUploads(response.data) };
};

const findByRange = async (id?: number): Promise<ResponseInvoiceRangeDto> => {
  const response = await axios.get<ResponseInvoiceRangeDto>(
    `public/selling-invoice/sequential-range/${id}`
  );
  return response.data;
};

const uploadInvoiceFiles = async (files: File[]): Promise<number[]> => {
  return files && files?.length > 0 ? await upload.uploadFiles(files) : [];
};

const create = async (invoice: CreateInvoiceDto, files: File[]): Promise<Invoice> => {
  const uploadIds = await uploadInvoiceFiles(files);
  const response = await axios.post<Invoice>('public/selling-invoice', {
    ...invoice,
    uploads: uploadIds.map((id) => {
      return { uploadId: id };
    })
  });
  return response.data;
};

const getInvoiceUploads = async (invoice: Invoice): Promise<InvoiceUploadedFile[]> => {
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
    ) as InvoiceUploadedFile[];
};

const download = async (id: number, template: string): Promise<any> => {
  const invoice = await findOne(id, []);
  const response = await axios.get<string>(`public/selling-invoice/${id}/download?template=${template}`, {
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

const duplicate = async (duplicateInvoiceDto: DuplicateInvoiceDto): Promise<Invoice> => {
  const response = await axios.post<Invoice>('/public/selling-invoice/duplicate', duplicateInvoiceDto);
  return response.data;
};

const update = async (invoice: UpdateInvoiceDto, files: File[]): Promise<Invoice> => {
  const uploadIds = await uploadInvoiceFiles(files);
  const response = await axios.put<Invoice>(`public/selling-invoice/${invoice.id}`, {
    ...invoice,
    uploads: [
      ...(invoice.uploads || []),
      ...uploadIds.map((id) => {
        return { uploadId: id };
      })
    ]
  });
  return response.data;
};

const remove = async (id: number): Promise<Invoice> => {
  const response = await axios.delete<Invoice>(`public/selling-invoice/${id}`);
  return response.data;
};

const validate = (invoice: Partial<Invoice>, dateRange?: DateRange): ToastValidation => {
  if (!invoice.date) return { message: 'La date est obligatoire' };
  const invoiceDate = new Date(invoice.date);
  if (
    dateRange?.from &&
    !isAfter(invoiceDate, dateRange.from) &&
    invoiceDate.getTime() !== dateRange.from.getTime()
  ) {
    return { message: `La date doit être après ou égale à ${dateRange.from.toLocaleDateString()}` };
  }
  if (
    dateRange?.to &&
    isAfter(invoiceDate, dateRange.to) &&
    invoiceDate.getTime() !== dateRange.to.getTime()
  ) {
    return { message: `La date doit être avant ou égale à ${dateRange.to.toLocaleDateString()}` };
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

  if (invoice.articleInvoiceEntries?.length === 1){
    console.log(invoice.articleInvoiceEntries[0]?.article?.title)
    if(!invoice.articleInvoiceEntries[0]?.article?.title)
      return { message: 'Au moins un article est obligatoire' };
  }
  if (invoice.articleInvoiceEntries?.some((entry) => !entry.article?.title))
    return { message: 'Le titre d\'article est obligatoire' };

  if (invoice.articleInvoiceEntries?.some((entry) => !entry.quantity))
    return { message: 'La quantité est obligatoire' };
  if (invoice.articleInvoiceEntries?.some((entry) => entry.quantity && entry.quantity <= 0))
    return { message: 'La quantité doit être supérieure à 0' };
  
  
  
  if (invoice.articleInvoiceEntries?.some((entry) => !entry.unit_price))
    return { message: 'Le prix unitaire est obligatoire' };
  if (invoice.articleInvoiceEntries?.some((entry) => entry.unit_price && entry.unit_price <= 0))
    return { message: 'Le prix unitaire doit être supérieur à 0' };


  if (invoice.articleInvoiceEntries?.some((entry) => entry.discount  && entry.discount < 0))
    return { message: 'La remise doit être supérieure ou égale à 0' };

  if (invoice.articleInvoiceEntries?.some((entry) =>  entry.discount  && entry.discount_type==="PERCENTAGE"&& entry.discount > 100))
    return { message: 'La remise doit être inférieure à 100' };

  if (invoice.discount  && invoice.discount < 0)
    return { message: 'La remise doit être supérieure ou égale à 0' };

  if (invoice.discount && invoice.discount_type==="PERCENTAGE"&& invoice.discount >= 100)
    return { message: 'La remise doit être inférieure à 100' };
  return { message: '' };
};

const updateInvoicesSequentials = async (updatedSequenceDto: UpdateInvoiceSequentialNumber) => {
  const response = await axios.put<Invoice>(
    `/public/selling-invoice/update-invoice-sequences`,
    updatedSequenceDto
  );
  return response.data;
};

export const invoice = {
  factory,
  findPaginated,
  findOne,
  findByRange,
  create,
  download,
  duplicate,
  update,
  updateInvoicesSequentials,
  remove,
  validate
};
