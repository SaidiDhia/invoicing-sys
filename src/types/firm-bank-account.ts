import { Currency } from './currency';
import { Firm } from './firm';
import { PagedResponse } from './response';
import { DatabaseEntity } from './response/DatabaseEntity';

export interface FirmBankAccount extends DatabaseEntity {
  id?: number;
  name?: string;
  bic?: string;
  rib?: string;
  iban?: string;
  currency?: Currency;
  currencyId?: number;
  isMain?: boolean;
  firm? :Firm;
  firmId?: number;
}

export interface CreateFirmBankAccountDto
  extends Omit<FirmBankAccount, 'id' | 'currency' | 'isDeletionRestricted' | 'firm'> {}
export interface UpdateFirmBankAccountDto
  extends Omit<FirmBankAccount, 'currency' | 'isDeletionRestricted' | 'firm'> {}
export interface PagedFirmBankAccount extends PagedResponse<FirmBankAccount> {}
