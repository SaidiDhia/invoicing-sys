import { Currency } from '@/types/currency';
import { Firm } from '@/types/firm';
import { PagedResponse } from '@/types/response';
import { DatabaseEntity } from '@/types/response/DatabaseEntity';
import { Upload } from '@/types/upload';
import { BuyingInvoice } from '../invoices/buying-invoice';

export enum BUYING_PAYMENT_MODE {
    Cash = 'payment.payment_mode.cash',
    CreditCard = 'payment.payment_mode.credit_card',
    Check = 'payment.payment_mode.check',
    BankTransfer = 'payment.payment_mode.bank_transfer',
    WireTransfer = 'payment.payment_mode.wire_transfer'
}

export interface BuyingPaymentUpload extends DatabaseEntity {
    id?: number;
    paymentId?: number;
    payment?: BuyingPayment;
    uploadId?: number;
    upload?: Upload;
}

export interface BuyingPaymentInvoiceEntry extends DatabaseEntity {
    id?: number;
    invoiceId?: number;
    invoice?: BuyingInvoice;
    paymentId?: number;
    payment?: BuyingPayment;
    amount?: number;
}

export interface BuyingPayment extends DatabaseEntity {
    id?: number;
    amount?: number;
    fee?: number;
    convertionRate?: number;
    date?: string;
    mode?: BUYING_PAYMENT_MODE;
    notes?: string;
    uploads?: BuyingPaymentUpload[];
    invoices?: BuyingPaymentInvoiceEntry[];
    currency?: Currency;
    currencyId?: number;
    firm?: Firm;
    firmId?: number;
}

export interface CreateBuyingPaymentDto
    extends Omit<BuyingPayment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeletionRestricted'> {
    files?: File[];
}

export interface UpdateBuyingPaymentDto extends CreateBuyingPaymentDto {
    id?: number;
}

export interface PagedBuyingPayment extends PagedResponse<BuyingPayment> { }

export interface BuyingPaymentUploadedFile {
    upload: BuyingPaymentUpload;
    file: File;
}
