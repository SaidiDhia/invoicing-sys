import axios from '../axios';
import { differenceInDays } from 'date-fns';
import { DISCOUNT_TYPE } from '../../types/enums/discount-types';
import { upload } from '../upload';
import { api } from '..';

import { QUOTATION_FILTER_ATTRIBUTES } from '@/constants/quotation.filter-attributes';
import { CreateQuotationDto, DuplicateQuotationDto, PagedQuotation, Quotation, QUOTATION_STATUS, QuotationUploadedFile, UpdateQuotationDto } from '@/types/quotations/selling-quotation';
import { ToastValidation, UpdateQuotationSequentialNumber } from '@/types';

const factory = (): CreateQuotationDto => {
  return {
    date: '',
    dueDate: '',
    status: QUOTATION_STATUS.Draft,
    generalConditions: '',
    total: 0,
    subTotal: 0,
    discount: 0,
    discount_type: DISCOUNT_TYPE.AMOUNT,
    currencyId: 0,
    firmId: 0,
    interlocutorId: 0,
    notes: '',
    articleQuotationEntries: [],
    quotationMetaData: {
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
): Promise<PagedQuotation> => {
  const generalFilter = search
    ? Object.values(QUOTATION_FILTER_ATTRIBUTES)
      .map((key) => `${key}||$cont||${search}`)
      .join('||$or||')
    : '';
    
    let filters: string=""
    let mainCondition = "";
    if(firmId || interlocutorId){
      mainCondition = firmId ? `firmId||$eq||${firmId}` : interlocutorId?`interlocutorId||$cont||${interlocutorId}`:"";
    }
    filters = mainCondition && generalFilter ? `${mainCondition}&&(${generalFilter})` : mainCondition || generalFilter;

  const response = await axios.get<PagedQuotation>(
    new String().concat(
      'public/selling-quotation/list?',
      `sort=${sortKey},${order}&`,
      `filter=${filters}&`,
      `limit=${size}&page=${page}&`,
      `join=${relations.join(',')}`
    )
  );
  return response.data;
};

const findChoices = async (status: QUOTATION_STATUS): Promise<Quotation[]> => {
  const response = await axios.get<Quotation[]>(
    `public/selling-quotation/all?filter=status||$eq||${status}`
  );
  return response.data;
};

const findOne = async (
  id: number,
  relations: string[] = [
    'firm',
    'currency',
    'bankAccount',
    'interlocutor',
    'firm.currency',
    'quotationMetaData',
    'uploads',
    'invoices',
    'uploads.upload',
    'firm.deliveryAddress',
    'firm.invoicingAddress',
    'articleQuotationEntries',
    'firm.interlocutorsToFirm',
    'articleQuotationEntries.article',
    'articleQuotationEntries.articleQuotationEntryTaxes',
    'articleQuotationEntries.articleQuotationEntryTaxes.tax'
  ]
): Promise<Quotation & { files: QuotationUploadedFile[] }> => {
  const response = await axios.get<Quotation>(`public/selling-quotation/${id}?join=${relations.join(',')}`);
  return { ...response.data, files: await getQuotationUploads(response.data) };
};

const uploadQuotationFiles = async (files: File[]): Promise<number[]> => {
  return files && files?.length > 0 ? await upload.uploadFiles(files) : [];
};

const create = async (quotation: CreateQuotationDto, files: File[]): Promise<Quotation> => {
  const uploadIds = await uploadQuotationFiles(files);
  const response = await axios.post<Quotation>('public/selling-quotation', {
    ...quotation,
    uploads: uploadIds.map((id) => {
      return { uploadId: id };
    })
  });
  return response.data;
};

const getQuotationUploads = async (quotation: Quotation): Promise<QuotationUploadedFile[]> => {
  if (!quotation?.uploads) return [];

  const uploads = await Promise.all(
    quotation.uploads.map(async (u) => {
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
    ) as QuotationUploadedFile[];
};

const download = async (id: number, template: string): Promise<any> => {
  const quotation = await findOne(id, []);
  const response = await axios.get<string>(`public/selling-quotation/${id}/download?template=${template}`, {
    responseType: 'blob'
  });
  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${quotation.sequential}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return response;
};

const duplicate = async (duplicateQuotationDto: DuplicateQuotationDto): Promise<Quotation> => {
  const response = await axios.post<Quotation>(
    '/public/selling-quotation/duplicate',
    duplicateQuotationDto
  );
  return response.data;
};

const update = async (quotation: UpdateQuotationDto, files: File[]): Promise<Quotation> => {
  const uploadIds = await uploadQuotationFiles(files);
  const response = await axios.put<Quotation>(`public/selling-quotation/${quotation.id}`, {
    ...quotation,
    uploads: [
      ...(quotation.uploads || []),
      ...uploadIds.map((id) => {
        return { uploadId: id };
      })
    ]
  });
  return response.data;
};

const invoice = async (id?: number, createInvoice?: boolean): Promise<Quotation> => {
  const response = await axios.put<Quotation>(`public/selling-quotation/invoice/${id}/${createInvoice}`);
  return response.data;
};

const remove = async (id: number): Promise<Quotation> => {
  const response = await axios.delete<Quotation>(`public/selling-quotation/${id}`);
  return response.data;
};

const validate = (quotation: Partial<Quotation>): ToastValidation => {
  if (!quotation.date) return { message: 'La date est obligatoire' };
  if (!quotation.dueDate) return { message: "L'échéance est obligatoire" };
  if (!quotation.object) return { message: "L'objet est obligatoire" };
  if (differenceInDays(new Date(quotation.date), new Date(quotation.dueDate)) >= 0)
    return { message: "L'échéance doit être supérieure à la date" };
  if (!quotation.firmId || !quotation.interlocutorId)
    return { message: 'Entreprise et interlocuteur sont obligatoire' };

  if (quotation.articleQuotationEntries?.length === 1){
    console.log(quotation.articleQuotationEntries[0]?.article?.title)
    if(!quotation.articleQuotationEntries[0]?.article?.title)
      return { message: 'Au moins un article est obligatoire' };
  }
  if (quotation.articleQuotationEntries?.some((entry) => !entry.article?.title))
    return { message: 'Le titre d\'article est obligatoire' };

  if (quotation.articleQuotationEntries?.some((entry) => !entry.quantity))
    return { message: 'La quantité est obligatoire' };
  if (quotation.articleQuotationEntries?.some((entry) => entry.quantity && entry.quantity <= 0))
    return { message: 'La quantité doit être supérieure à 0' };
  
  
  
  if (quotation.articleQuotationEntries?.some((entry) => !entry.unit_price))
    return { message: 'Le prix unitaire est obligatoire' };
  if (quotation.articleQuotationEntries?.some((entry) => entry.unit_price && entry.unit_price <= 0))
    return { message: 'Le prix unitaire doit être supérieur à 0' };


  if (quotation.articleQuotationEntries?.some((entry) => entry.discount  && entry.discount < 0))
    return { message: 'La remise doit être supérieure ou égale à 0' };

  if (quotation.articleQuotationEntries?.some((entry) =>  entry.discount  && entry.discount_type==="PERCENTAGE"&& entry.discount > 100))
    return { message: 'La remise doit être inférieure à 100' }; 

  if (quotation.discount  && quotation.discount < 0)
    return { message: 'La remise doit être supérieure ou égale à 0' };

  if (quotation.discount && quotation.discount_type==="PERCENTAGE"&& quotation.discount >= 100)
    return { message: 'La remise doit être inférieure à 100' };
  return { message: '' };
};

const updateQuotationsSequentials = async (updatedSequenceDto: UpdateQuotationSequentialNumber) => {
  const response = await axios.put<Quotation>(
    `/public/selling-quotation/update-quotation-sequences`,
    updatedSequenceDto
  );
  return response.data;
};

export const quotation = {
  factory,
  findPaginated,
  findOne,
  findChoices,
  create,
  download,
  invoice,
  duplicate,
  update,
  updateQuotationsSequentials,
  remove,
  validate
};
