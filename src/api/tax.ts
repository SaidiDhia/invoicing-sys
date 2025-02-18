import { TAX_FILTER_ATTRIBUTES } from '@/constants/tax.filter-attributes';
import axios from './axios';
import { CreateTaxDto, PagedTax, Tax, ToastValidation, UpdateTaxDto } from '@/types';

const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string = 'id',
  search: string = ''
): Promise<PagedTax> => {
  const generalFilters = search
    ? Object.values(TAX_FILTER_ATTRIBUTES)
        .map((key) => `${key}||$cont||${search}`)
        .join('||$or||')
    : '';

  const response = await axios.get<PagedTax>(
    `public/tax/list?sort=${sortKey},${order}&filter=${generalFilters}&limit=${size}&page=${page}`
  );
  return response.data;
};

const find = async (): Promise<Tax[]> => {
  const response = await axios.get<Tax[]>(`public/tax/all`);
  return response.data;
};

const create = async (tax: CreateTaxDto): Promise<Tax> => {
  const response = await axios.post<Tax>('public/tax', tax);
  return response.data;
};

const update = async (tax: UpdateTaxDto): Promise<Tax> => {
  const response = await axios.put<Tax>(`public/tax/${tax.id}`, tax);
  return response.data;
};

const remove = async (id: number) => {
  const { data, status } = await axios.delete<Tax>(`public/tax/${id}`);
  return { data, status };
};

const validate = (tax: CreateTaxDto | UpdateTaxDto): ToastValidation => {
  const { label, value, isRate } = tax;

  if (!label || label.length < 3) {
    return { message: 'Veuillez entrer un titre valide' };
  }

  if (isRate) {
    if (value && (value <= 0 || value > 99)) {
      return {
        message: 'Veuillez entrer un taux valide (entre 0 et 99% pour un taux en pourcentage)'
      };
    }
  } else {
    if (value && value <= 0) {
      return { message: 'Veuillez entrer un montant fixe valide' };
    }
  }

  return { message: '' };
};

export const tax = { findPaginated, find, create, update, remove, validate };
