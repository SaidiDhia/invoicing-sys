import { DatabaseEntity } from './response/DatabaseEntity';

export interface Country extends DatabaseEntity {
  id?: number;
  alpha2code?: string;
  alpha3code?: string;
}
