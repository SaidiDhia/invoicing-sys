import { PagedResponse } from 'C:/Users/MSI/Desktop/PFE/invoicing-sys-pfe/invoicing-sys/src/types/response/PagedResponse';
import { DatabaseEntity } from 'C:/Users/MSI/Desktop/PFE/invoicing-sys-pfe/invoicing-sys/src/types/response/DatabaseEntity';

export interface TaxWithholding extends DatabaseEntity {
  id?: number;
  label?: string;
  rate?: number;
}

export interface CreateTaxWithholdingDto
  extends Omit<TaxWithholding, 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeletionRestricted'> {}
export interface UpdateTaxWithholdingDto extends CreateTaxWithholdingDto {
  id?: number;
}
export interface PagedTaxWithholding extends PagedResponse<CreateTaxWithholdingDto> {}
