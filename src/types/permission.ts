import { DatabaseEntity } from './response/DatabaseEntity';

export interface Permission extends DatabaseEntity {
  id?: number;
  label?: string;
  description?: string;
}
