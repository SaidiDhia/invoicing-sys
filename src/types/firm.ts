import { FirmInterlocutorEntry } from './firm-interlocutor-entry';
import { Activity } from './activity';
import { Address } from './address';
import { Cabinet } from './cabinet';
import { Currency } from './currency';
import { PaymentCondition } from './payment-condition';
import { SOCIAL_TITLE } from './enums';
import { PagedResponse } from './response';
import { Quotation } from './quotation';
import { Invoice } from './invoice';
import { DatabaseEntity } from './response/DatabaseEntity';

export interface Firm extends DatabaseEntity {
  id?: number;
  website?: string;
  phone?: string;
  name?: string;
  taxIdNumber?: string;
  isPerson?: boolean;
  invoicingAddress?: Address;
  invoicingAddressId?: number;
  deliveryAddress?: Address;
  deliveryAddressId?: number;
  cabinet?: Cabinet;
  cabinetId?: number;
  activity?: Activity;
  activityId?: number;
  currency?: Currency;
  currencyId?: number;
  paymentCondition?: PaymentCondition;
  paymentConditionId?: number;
  interlocutorsToFirm?: FirmInterlocutorEntry[];
  notes?: string;
  quotations?: Quotation[];
  invoices?: Invoice[];
}

export interface CreateFirmDto
  extends Omit<
    Firm,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeletionRestricted' | 'interlocutorsToFirm'
  > {
  mainInterlocutor: {
    title: SOCIAL_TITLE;
    name: string;
    surname: string;
    email: string;
    phone: string;
    position: string;
  };
}

export interface UpdateFirmDto extends CreateFirmDto {
  id: number;
}

export type FirmQueryKeyParams = { [P in keyof Firm]?: boolean };

export interface PagedFirm extends PagedResponse<Firm> {}
