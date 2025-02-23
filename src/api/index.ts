import { admin } from './admin';
export * from './admin';
import { auth } from './auth';
export * from './auth';
import { activity } from './activity';
export * from './activity';
import { address } from './address';
export * from './address';
import { article } from './article';
export * from './article';
import { appConfig } from './app-config';
export * from './app-config';
import { bankAccount } from './bank-account';
export * from './bank-account';
import { cabinet } from './cabinet';
export * from './cabinet';
import { country } from './country';
export * from './country';
import { currency } from './currency';
export * from './currency';
import { defaultCondition } from './default-condition';
export * from './default-condition';
import { firm } from './firm';
export * from './firm';
import { firmInterlocutorEntry } from './firm-interlocutor-entry';
export * from './firm-interlocutor-entry';
import { interlocutor } from './interlocutor';
export * from './interlocutor';
import { buyingInvoice } from './invoices/buying-invoice';
export * from './invoices/buying-invoice';
import { invoice } from './invoices/selling-invoice';
export * from './invoices/selling-invoice';
import { payment } from './payments/selling-payment';
export * from './payments/selling-payment';
import { paymentCondition } from './payment-condition';
export * from './payment-condition';
import { permission } from './permission';
export * from './permission';
import { quotation } from './quotations/selling-quotation';
export * from './quotations/selling-quotation';
import { buyingQuotation } from './quotations/buying-quotation';
export * from './quotations/buying-quotation';
import { role } from './role';
export * from './role';
import { tax } from './tax';
export * from './tax';
import { taxWithholding } from './tax-withholding';
export * from './tax-withholding';
import { upload } from './upload';
export * from './upload';
import { user } from './user';
export * from './user';

export * from '../types/response';
export * from '../types/enums';

export const api = {
  admin,
  auth,
  activity,
  address,
  article,
  appConfig,
  bankAccount,
  cabinet,
  country,
  currency,
  defaultCondition,
  firm,
  firmInterlocutorEntry,
  interlocutor,
  buyingInvoice,
  invoice,
  payment,
  paymentCondition,
  permission,
  quotation,
  buyingQuotation,
  role,
  tax,
  taxWithholding,
  upload,
  user
};