import { Article } from '../article';
import { BankAccount } from '../bank-account';
import { Cabinet } from '../cabinet';
import { Currency } from '../currency';
import { DISCOUNT_TYPE } from '../enums/discount-types';
import { Firm } from '../firm';
import { Interlocutor } from '../interlocutor';
import { BuyingInvoice } from '../invoices/buying-invoice';
import { PagedResponse } from '../response';
import { DatabaseEntity } from '../response/DatabaseEntity';
import { Tax } from '../tax';
import { Upload } from '../upload';

export enum BUYING_QUOTATION_STATUS {
  Nonexistent = 'quotation.status.non_existent',
  Expired = 'quotation.status.expired',
  Draft = 'quotation.status.draft',
  Validated = 'quotation.status.validated',
  Sent = 'quotation.status.sent',
  Accepted = 'quotation.status.accepted',
  Rejected = 'quotation.status.rejected',
  Invoiced = 'quotation.status.invoiced'
}

export interface BuyingQuotationTaxEntry extends DatabaseEntity {
  id?: number;
  articleQuotationEntryId?: number;
  tax?: Tax;
  taxId?: number;
}

export interface BuyingArticleQuotationEntry extends DatabaseEntity {
  id?: number;
  quotationId?: number;
  article?: Article;
  articleId?: number;
  unit_price?: number;
  quantity?: number;
  discount?: number;
  discount_type?: DISCOUNT_TYPE;
  articleQuotationEntryTaxes?: BuyingQuotationTaxEntry[];
  subTotal?: number;
  total?: number;
}

export interface CreateBuyingArticleQuotationEntry
  extends Omit<
  BuyingArticleQuotationEntry,
    | 'id'
    | 'quotationId'
    | 'subTotal'
    | 'total'
    | 'updatedAt'
    | 'createdAt'
    | 'deletedAt'
    | 'isDeletionRestricted'
    | 'articleQuotationEntryTaxes'
  > {
  taxes?: number[];
}

export interface BuyingQuotationMetaData extends DatabaseEntity {
  id?: number;
  showArticleDescription?: boolean;
  hasBankingDetails?: boolean;
  hasGeneralConditions?: boolean;
  taxSummary?: { taxId: number; amount: number }[];
}

export interface BuyingQuotationUpload extends DatabaseEntity {
  id?: number;
  quotationId?: number;
  quotation?: BuyingQuotation;
  uploadId?: number;
  upload?: Upload;
  file?: File;

}

export interface BuyingQuotation extends DatabaseEntity {
  id?: number;
  sequential?: string;
  object?: string;
  date?: string;
  dueDate?: string;
  status?: BUYING_QUOTATION_STATUS;
  generalConditions?: string;
  defaultCondition?: boolean;
  total?: number;
  subTotal?: number;
  discount?: number;
  discount_type?: DISCOUNT_TYPE;
  currencyId?: number | null;
  currency?: Currency;
  bankAccountId?: number | null;
  bankAccount?: BankAccount;
  firmId?: number;
  firm?: Firm;
  cabinet?: Cabinet;
  cabinetId?: number;
  interlocutorId?: number;
  interlocutor?: Interlocutor;
  notes?: string;
  articleQuotationEntries?: BuyingArticleQuotationEntry[];
  quotationMetaData?: BuyingQuotationMetaData;
  uploads?: BuyingQuotationUpload[];
  invoices: BuyingInvoice[];

  referenceDoc?:BuyingQuotationUpload;
  referenceDocId?:number;
  referenceDocFile?:File | null;

}

export interface CreateBuyingQuotationDto
  extends Omit<
  BuyingQuotation,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'isDeletionRestricted'
    | 'articles'
    | 'firm'
    | 'interlocutor'
    | 'bankAccount'
    | 'invoices'
  > {
  sequential?:string;
  articleQuotationEntries?: CreateBuyingArticleQuotationEntry[];
  files?: File[];
  referenceDocId?: number;
  referenceDocFile?: File;
}

export interface UpdateBuyingQuotationDto extends CreateBuyingQuotationDto {
  id?: number;
  createInvoice?: boolean;
}

export interface DuplicateBuyingQuotationDto {
  id?: number;
  includeFiles?: boolean;
}

export interface PagedBuyingQuotation extends PagedResponse<BuyingQuotation> { }

export interface BuyingQuotationUploadedFile {
  upload: BuyingQuotationUpload;
  file: File;
  
}
