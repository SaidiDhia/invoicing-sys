import { DatabaseEntity } from './response/DatabaseEntity';

export interface Article extends DatabaseEntity {
  id?: number;
  title?: string;
  description?: string;
}
