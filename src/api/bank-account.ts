import axios from './axios';
import {
  BankAccount,
  CreateBankAccountDto,
  PagedBankAccount,
  ToastValidation,
  UpdateBankAccountDto
} from '@/types';
import { BANK_ACCOUNT_FILTER_ATTRIBUTES } from '@/constants/bank-account.filter-attributes';

const factory = (): BankAccount => {
  return {
    id: undefined,
    name: '',
    bic: '',
    currency: undefined,
    iban: '',
    rib: '',
    isMain: false
  };
};

const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string = '',
  search: string = ''
): Promise<PagedBankAccount> => {
  const generalFilters = search
    ? Object.values(BANK_ACCOUNT_FILTER_ATTRIBUTES)
        .map((key) => `${key}||$cont||${search}`)
        .join('||$or||')
    : '';

  let requestUrl = `public/bank-account/list?join=currency&limit=${size}&page=${page}`;

  if (sortKey) {
    requestUrl += `&sort=${sortKey},${order}`;
  }

  if (generalFilters) {
    requestUrl += `&filter=${generalFilters}`;
  }

  const response = await axios.get<PagedBankAccount>(requestUrl);
  return response.data;
};

const find = async (): Promise<BankAccount[]> => {
  const response = await axios.get('public/bank-account/all');
  return response.data;
};

const create = async (bankAccount: CreateBankAccountDto): Promise<BankAccount> => {
  const response = await axios.post<BankAccount>('public/bank-account', bankAccount);
  return response.data;
};

const update = async (bankAccount: UpdateBankAccountDto): Promise<BankAccount> => {
  const response = await axios.put<BankAccount>(
    `public/bank-account/${bankAccount.id}`,
    bankAccount
  );
  return response.data;
};

const remove = async (id: number) => {
  const { data, status } = await axios.delete<BankAccount>(`public/bank-account/${id}`);
  return { data, status };
};

const validate = (
  bankAccount: Partial<BankAccount>,
  mainByDefault: boolean = false
): ToastValidation => {
  if (!bankAccount?.name) return { message: 'Nom de la banque est obligatoire' };
  if (bankAccount?.name.length < 3)
    return { message: 'Nom de la banque doit comporter au moins 3 caractères' };
  if (!bankAccount?.currency?.id) return { message: 'Devise est obligatoire' };
  if (bankAccount?.bic === '') return { message: 'BIC/SWIFT est obligatoire' };
  if (bankAccount?.iban === '') return { message: 'IBAN est obligatoire' };
  if (bankAccount?.rib === '') return { message: 'RIB est obligatoire' };
  if (mainByDefault && !bankAccount.isMain) return { message: 'La banque doit être principale' };
  return { message: '' };
};

export const bankAccount = {
  find,
  findPaginated,
  factory,
  create,
  update,
  remove,
  validate
};
