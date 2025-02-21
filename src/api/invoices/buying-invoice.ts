import axios from '../axios';
import { differenceInDays, isAfter } from 'date-fns';
import { DISCOUNT_TYPE } from '../../types/enums/discount-types';
import { upload } from '../upload';
import { api } from '..';
import {

  DateRange,
  ToastValidation,
  UpdateInvoiceSequentialNumber
} from '@/types';
import { BuyingCreateInvoiceDto, BuyingDuplicateInvoiceDto, BUYING_INVOICE_STATUS, BuyingInvoice, BuyingResponseInvoiceRangeDto, BuyingPagedInvoice, BuyingUpdateInvoiceDto, BuyingInvoiceUploadedFile, } from '@/types/invoices/buying-invoice';
import { INVOICE_FILTER_ATTRIBUTES } from '@/constants/invoice.filter-attributes';

const factory = (): BuyingCreateInvoiceDto => {
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
): Promise<BuyingPagedInvoice> => {
  const generalFilter = search
    ? Object.values(INVOICE_FILTER_ATTRIBUTES)
      .map((key) => `${key}||$cont||${search}`)
      .join('||$or||')
    : '';
  const firmCondition = firmId ? `firmId||$eq||${firmId}` : '';
  const interlocutorCondition = interlocutorId ? `interlocutorId||$cont||${interlocutorId}` : '';
  const filters = [generalFilter, firmCondition, interlocutorCondition].filter(Boolean).join(',');

  const response = await axios.get<BuyingPagedInvoice>(
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
    'firm.deliveryAddress',
    'firm.invoicingAddress',
    'articleInvoiceEntries',
    'firm.interlocutorsToFirm',
    'articleInvoiceEntries.article',
    'articleInvoiceEntries.articleInvoiceEntryTaxes',
    'articleInvoiceEntries.articleInvoiceEntryTaxes.tax'
  ]
): Promise<BuyingInvoice & { files: BuyingInvoiceUploadedFile[] }> => {
  const response = await axios.get<BuyingInvoice>(`public/buying-invoice/${id}?join=${relations.join(',')}`);
  return { ...response.data, files: await getInvoiceUploads(response.data) };
};

const findByRange = async (id?: number): Promise<BuyingResponseInvoiceRangeDto> => {
  const response = await axios.get<BuyingResponseInvoiceRangeDto>(
    `public/buying-invoice/sequential-range/${id}`
  );
  return response.data;
};

const uploadInvoiceFiles = async (files: File[]): Promise<number[]> => {
  return files && files?.length > 0 ? await upload.uploadFiles(files) : [];
};

const create = async (invoice: BuyingCreateInvoiceDto, files: File[]): Promise<BuyingInvoice> => {
  const uploadIds = await uploadInvoiceFiles(files);
  const response = await axios.post<BuyingInvoice>('public/buying-invoice', {
    ...invoice,
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

const download = async (id: number, template: string): Promise<any> => {
  const invoice = await findOne(id, []);
  const response = await axios.get<string>(`public/buying-invoice/${id}/download?template=${template}`, {
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

const duplicate = async (duplicateInvoiceDto: BuyingDuplicateInvoiceDto): Promise<BuyingInvoice> => {
  const response = await axios.post<BuyingInvoice>('/public/buying-invoice/duplicate', duplicateInvoiceDto);
  return response.data;
};

const update = async (invoice: BuyingUpdateInvoiceDto, files: File[]): Promise<BuyingInvoice> => {
  const uploadIds = await uploadInvoiceFiles(files);
  const response = await axios.put<BuyingInvoice>(`public/buying-invoice/${invoice.id}`, {
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

const remove = async (id: number): Promise<BuyingInvoice> => {
  const response = await axios.delete<BuyingInvoice>(`public/buying-invoice/${id}`);
  return response.data;
};

const validate = (invoice: Partial<BuyingInvoice>, dateRange?: DateRange): ToastValidation => {
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
  return { message: '' };
};

const updateInvoicesSequentials = async (updatedSequenceDto: UpdateInvoiceSequentialNumber) => {
  const response = await axios.put<BuyingInvoice>(
    `/public/buying-invoice/update-invoice-sequences`,
    updatedSequenceDto
  );
  return response.data;
};

export const buyingInvoice = {
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
