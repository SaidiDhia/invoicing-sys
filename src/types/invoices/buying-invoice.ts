import { Article } from '../article';
import { Cabinet } from '../cabinet';
import { Currency } from '../currency';
import { DISCOUNT_TYPE } from '../enums/discount-types';
import { Firm } from '../firm';
import { Interlocutor } from '../interlocutor';
import { PaymentInvoiceEntry } from '../payments/buying-payment';
import { Quotation } from '../quotations/buying-quotation';
import { PagedResponse } from '../response';
import { DatabaseEntity } from '../response/DatabaseEntity';
import { Tax } from '../tax';
import { TaxWithholding } from '../tax-withholding';
import { Upload } from '../upload';

export enum BUYING_INVOICE_STATUS {
  Nonexistent = 'invoice.status.non_existent',
  Draft = 'invoice.status.draft',
  Validated = 'invoice.status.validated',
  Sent = 'invoice.status.sent',
  Paid = 'invoice.status.paid',
  PartiallyPaid = 'invoice.status.partially_paid',
  Unpaid = 'invoice.status.unpaid',
  Expired = 'invoice.status.expired'
}

export interface BuyingInvoiceTaxEntry extends DatabaseEntity {
  id?: number;
  articleInvoiceEntryId?: number;
  tax?: Tax;
  taxId?: number;
}

export interface BuyingArticleInvoiceEntry extends DatabaseEntity {
  id?: number;
  invoiceId?: number;
  article?: Article;
  articleId?: number;
  unit_price?: number;
  quantity?: number;
  discount?: number;
  discount_type?: DISCOUNT_TYPE;
  articleInvoiceEntryTaxes?: BuyingInvoiceTaxEntry[];
  subTotal?: number;
  total?: number;
}

export interface BuyingCreateArticleInvoiceEntry
  extends Omit<
    BuyingArticleInvoiceEntry,
    | 'id'
    | 'invoiceId'
    | 'subTotal'
    | 'total'
    | 'updatedAt'
    | 'createdAt'
    | 'deletedAt'
    | 'isDeletionRestricted'
    | 'articleInvoiceEntryTaxes'
  > {
  taxes?: number[];
}

export interface BuyingInvoiceMetaData extends DatabaseEntity {
  id?: number;
  showInvoiceAddress?: boolean;
  showDeliveryAddress?: boolean;
  showArticleDescription?: boolean;
  hasBankingDetails?: boolean;
  hasGeneralConditions?: boolean;
  hasTaxStamp?: boolean;
  taxSummary?: { taxId: number; amount: number }[];
  hasTaxWithholding?: boolean;
}

export interface BuyingInvoiceUpload extends DatabaseEntity {
  id?: number;
  invoiceId?: number;
  invoice?: BuyingInvoice;
  uploadId?: number;
  upload?: Upload;
}

export interface BuyingInvoice extends DatabaseEntity {
  id?: number;
  sequential?: string;
  object?: string;
  date?: string;
  dueDate?: string;
  status?: BUYING_INVOICE_STATUS;
  generalConditions?: string;
  defaultCondition?: boolean;
  total?: number;
  amountPaid?: number;
  subTotal?: number;
  discount?: number;
  discount_type?: DISCOUNT_TYPE;
  currencyId?: number;
  currency?: Currency;
  bankAccountId?: number;
  bankAccount?: Currency;
  firmId?: number;
  firm?: Firm;
  cabinet?: Cabinet;
  cabinetId?: number;
  interlocutorId?: number;
  interlocutor?: Interlocutor;
  notes?: string;
  quotationId?: number;
  quotation?: Quotation;
  articleInvoiceEntries?: BuyingArticleInvoiceEntry[];
  invoiceMetaData?: BuyingInvoiceMetaData;
  uploads?: BuyingInvoiceUpload[];
  payments?: PaymentInvoiceEntry[];
  taxStamp?: Tax;
  taxStampId?: number;
  taxWithholding?: TaxWithholding;
  taxWithholdingId?: number;
  taxWithholdingAmount?: number;
}

export interface BuyingCreateInvoiceDto
  extends Omit<
    BuyingInvoice,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'isDeletionRestricted'
    | 'articles'
    | 'firm'
    | 'interlocutor'
    | 'sequential'
    | 'bankAccount'
  > {
  articleInvoiceEntries?: BuyingCreateArticleInvoiceEntry[];
  files?: File[];
}

export interface BuyingUpdateInvoiceDto extends BuyingCreateInvoiceDto {
  id?: number;
}

export interface BuyingDuplicateInvoiceDto {
  id?: number;
  includeFiles?: boolean;
}

export interface BuyingPagedInvoice extends PagedResponse<BuyingInvoice> { }

export interface BuyingInvoiceUploadedFile {
  upload: BuyingInvoiceUpload;
  file: File;
}

export interface BuyingResponseInvoiceRangeDto {
  next?: BuyingInvoice;
  previous?: BuyingInvoice;
}
