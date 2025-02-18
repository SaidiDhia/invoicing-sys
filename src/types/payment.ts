import { Currency } from './currency';
import { Firm } from './firm';
import { Invoice } from './invoice';
import { PagedResponse } from './response';
import { DatabaseEntity } from './response/DatabaseEntity';
import { Upload } from './upload';

export enum PAYMENT_MODE {
  Cash = 'payment.payment_mode.cash',
  CreditCard = 'payment.payment_mode.credit_card',
  Check = 'payment.payment_mode.check',
  BankTransfer = 'payment.payment_mode.bank_transfer',
  WireTransfer = 'payment.payment_mode.wire_transfer'
}

export interface PaymentUpload extends DatabaseEntity {
  id?: number;
  paymentId?: number;
  payment?: Payment;
  uploadId?: number;
  upload?: Upload;
}

export interface PaymentInvoiceEntry extends DatabaseEntity {
  id?: number;
  invoiceId?: number;
  invoice?: Invoice;
  paymentId?: number;
  payment?: Payment;
  amount?: number;
}

export interface Payment extends DatabaseEntity {
  id?: number;
  amount?: number;
  fee?: number;
  convertionRate?: number;
  date?: string;
  mode?: PAYMENT_MODE;
  notes?: string;
  uploads?: PaymentUpload[];
  invoices?: PaymentInvoiceEntry[];
  currency?: Currency;
  currencyId?: number;
  firm?: Firm;
  firmId?: number;
}

export interface CreatePaymentDto
  extends Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeletionRestricted'> {
  files?: File[];
}

export interface UpdatePaymentDto extends CreatePaymentDto {
  id?: number;
}

export interface PagedPayment extends PagedResponse<Payment> {}

export interface PaymentUploadedFile {
  upload: PaymentUpload;
  file: File;
}
