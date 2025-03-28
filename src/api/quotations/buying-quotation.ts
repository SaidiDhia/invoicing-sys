import axios from '../axios';
import { differenceInDays } from 'date-fns';
import { DISCOUNT_TYPE } from '../../types/enums/discount-types';
import { upload } from '../upload';
import { api } from '..';

import { QUOTATION_FILTER_ATTRIBUTES } from '@/constants/quotation.filter-attributes';
import { BUYING_QUOTATION_STATUS, BuyingQuotation, BuyingQuotationUploadedFile, CreateBuyingQuotationDto, DuplicateBuyingQuotationDto, PagedBuyingQuotation, UpdateBuyingQuotationDto } from '@/types/quotations/buying-quotation';
import {  ToastValidation } from '@/types';

const factory = (): CreateBuyingQuotationDto => {
  return {
    date: '',
    dueDate: '',
    status: BUYING_QUOTATION_STATUS.Draft,
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
): Promise<PagedBuyingQuotation> => {
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

  const response = await axios.get<PagedBuyingQuotation>(
    new String().concat(
      'public/buying-quotation/list?',
      `sort=${sortKey},${order}&`,
      `filter=${filters}&`,
      `limit=${size}&page=${page}&`,
      `join=${relations.join(',')}`
    )
  );
  return response.data;
};

const findChoices = async (status: BUYING_QUOTATION_STATUS): Promise<BuyingQuotation[]> => {
  const response = await axios.get<BuyingQuotation[]>(
    `public/buying-quotation/all?filter=status||$eq||${status}`
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
    'articleQuotationEntries',
    'firm.interlocutorsToFirm',
    'articleQuotationEntries.article',
    'articleQuotationEntries.articleQuotationEntryTaxes',
    'articleQuotationEntries.articleQuotationEntryTaxes.tax',
    'referenceDoc'
  ]
): Promise<BuyingQuotation & { files: BuyingQuotationUploadedFile[] }> => {
  const response = await axios.get<BuyingQuotation>(`public/buying-quotation/${id}?join=${relations.join(',')}`);
  return { ...response.data, files: await getQuotationUploads(response.data) };
};




const uploadQuotationFiles = async (files: File[]): Promise<number[]> => {
  return files && files?.length > 0 ? await upload.uploadFiles(files) : [];
};

const create = async (quotation: CreateBuyingQuotationDto, files: File[]): Promise<BuyingQuotation> => {
  
  let referenceDocId = quotation.referenceDocId;
  if (quotation.referenceDocFile) {
    const [uploadId] = await uploadQuotationFiles([quotation.referenceDocFile]);
    referenceDocId = uploadId;
  }
  
  const uploadIds = await uploadQuotationFiles(files);
  const response = await axios.post<BuyingQuotation>('public/buying-quotation', {
    ...quotation,
    referenceDocId,
    uploads: uploadIds.map((id) => {
      return { uploadId: id };
    })
  });
  return response.data;
};

const getQuotationUploads = async (quotation: BuyingQuotation): Promise<BuyingQuotationUploadedFile[]> => {
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
    ) as BuyingQuotationUploadedFile[];
};

const download = async (id: number): Promise<any> => {
  const quotation = await findOne(id, []);
  const response = await axios.get<string>(`public/buying-quotation/${id}/download`, {
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

const duplicate = async (duplicateQuotationDto: DuplicateBuyingQuotationDto): Promise<BuyingQuotation> => {
  const response = await axios.post<BuyingQuotation>(
    '/public/buying-quotation/duplicate',
    duplicateQuotationDto
  );
  return response.data;
};

const update = async (quotation: UpdateBuyingQuotationDto, files: File[]): Promise<BuyingQuotation> => {
  let existQuotation;

  if(quotation.id){
    existQuotation=await findOne(quotation.id);
  }
  let referenceDocId
  let referenceDocFile = quotation.referenceDocFile;
  if(referenceDocFile!=existQuotation?.referenceDocFile){
    if(referenceDocFile) {
      [referenceDocId] = await uploadQuotationFiles([referenceDocFile]);
 
    }
    else{
      referenceDocId=existQuotation?.referenceDocId
    }
  }

  
  const uploadIds = await uploadQuotationFiles(files);
  const response = await axios.put<BuyingQuotation>(`public/buying-quotation/${quotation.id}`, {
    ...quotation,
    referenceDocId,
    uploads: [
      ...(quotation.uploads || []),
      ...uploadIds.map((id) => {
        return { uploadId: id };
      })
    ]
  });
  return response.data;
};


const invoice = async (id?: number, createInvoice?: boolean): Promise<BuyingQuotation> => {
  const response = await axios.put<BuyingQuotation>(`public/buying-quotation/invoice/${id}/${createInvoice}`);
  return response.data;
};

const remove = async (id: number): Promise<BuyingQuotation> => {
  const response = await axios.delete<BuyingQuotation>(`public/buying-quotation/${id}`);
  return response.data;
};
import { AxiosError } from 'axios';

const existSequential = async (sequential: string, firmId: number)=> {
  try {
    return await axios.get(`public/buying-quotation/seq?sequential=${sequential}&firmId=${firmId}`);

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

const  validate = async(quotation: Partial<BuyingQuotation>): Promise<ToastValidation> => {

  console.log(quotation.articleQuotationEntries);

  if (!quotation.date) return { message: 'La date est obligatoire' };
  if (!quotation.dueDate) return { message: "L'échéance est obligatoire" };
  if (!quotation.object) return { message: "L'objet est obligatoire" };
  if ((!quotation.referenceDocId && !quotation.referenceDocFile ) || (!quotation.referenceDocFile)) {
  return { message: 'Le document de référence est obligatoire' };
}
  if (!quotation.sequential) return { message: "Le numero de sequence est obligatoire" };
  if (!/^[A-Z0-9\-]+$/.test(quotation.sequential)) {
    return{ message :"Le numéro séquentiel ne peut contenir que des lettres majuscules, des chiffres et des tirets."};
  }
  if (quotation.sequential.length < 5) {
    return{ message :"Le numéro séquentiel doit contenir au moins 5 caractères."};
  }
  if (!quotation.firmId) return { message: "Le firm est obligatoire" };
  const existQuotation=await existSequential(quotation.sequential,quotation.firmId)
  if(existQuotation && existQuotation.data?.id!==quotation?.id){
    return{ message :" Un Devis avec ce numéro séquentiel existe déjà pour l'entreprise spécifiée. 1"};
  }
  if(!quotation.id && existQuotation){
    return{ message :" Un Devis avec ce numéro séquentiel existe déjà pour l'entreprise spécifiée. 2"};
  }
  if (quotation.sequential.length > 20) {
    return{ message :"Le numéro séquentiel ne peut pas dépasser 20 caractères."};
  }
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


export const buyingQuotation = {
  factory,
  findPaginated,
  findOne,
  findChoices,
  create,
  download,
  invoice,
  duplicate,
  update,
  remove,
  validate
};
