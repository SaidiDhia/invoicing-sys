import { Activity } from './activity';
import { Address, UpdateAddressDto } from './address';
import { Currency } from './currency';
import { DatabaseEntity } from './response/DatabaseEntity';

export interface Cabinet extends DatabaseEntity {
  id?: number;
  enterpriseName?: string;
  email?: string;
  phone?: string;
  taxIdNumber?: string;
  activity?: Activity;
  activityId?: number;
  currency?: Currency;
  currencyId?: number;
  address?: Address;
  logo?: File;
  logoId?: number;
  signature?: File;
  signatureId?: number;
}

export interface UpdateCabinetDto
  extends Omit<
    Cabinet,
    | 'activity'
    | 'currency'
    | 'address'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'isDeletionRestricted'
  > {
  address?: UpdateAddressDto;
}
