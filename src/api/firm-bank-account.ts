import axios from './axios';
import {
  ToastValidation,
  
} from '@/types';
import { FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES } from '@/constants/firm-bank-account.filter-attributes';
import { 
  FirmBankAccount ,
  UpdateFirmBankAccountDto , 
  CreateFirmBankAccountDto,
  PagedFirmBankAccount,} from '@/types/firm-bank-account';

const factory = (): FirmBankAccount => {
  return {
    id: undefined,
    name: '',
    bic: '',
    currency: undefined,
    iban: '',
    rib: '',
    isMain: false,
    firm: undefined,
    firmId: undefined};
};

const findPaginated = async (
  firmId: number,
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string = '',
  search: string = '',
): Promise<PagedFirmBankAccount> => {
  const generalFilters = search
    ? Object.values(FIRM_BANK_ACCOUNT_FILTER_ATTRIBUTES)
        .map((key) => `${key}||$cont||${search}`)
        .join('||$or||')
    : '';

  let requestUrl = `public/firm-bank-account/list?join=firm,currency&limit=${size}&page=${page}`;

  if (sortKey) {
    requestUrl += `&sort=${sortKey},${order}`;
  }
  requestUrl += `&filter=firmId||$eq||${firmId}`;
  if (generalFilters) {
    requestUrl += `&&(${generalFilters})`;
  }

  const response = await axios.get<PagedFirmBankAccount>(requestUrl);
  return response.data;
};

const find = async (): Promise<FirmBankAccount[]> => {
  const response = await axios.get('public/firm-bank-account/all');
  return response.data;
};

const create = async (bankAccount: CreateFirmBankAccountDto): Promise<FirmBankAccount> => {
  const response = await axios.post<FirmBankAccount>('public/firm-bank-account', bankAccount);
  return response.data;
};

const update = async (bankAccount: UpdateFirmBankAccountDto): Promise<FirmBankAccount> => {
  const response = await axios.put<FirmBankAccount>(
    `public/firm-bank-account/${bankAccount.id}`,
    bankAccount
  );
  return response.data;
};

const remove = async (id: number) => {
  const { data, status } = await axios.delete<FirmBankAccount>(`public/firm-bank-account/${id}`);
  return { data, status };
};

const validate = (
  bankAccount: Partial<FirmBankAccount>,
  mainByDefault: boolean = false
): ToastValidation => {
  console.log("bankaccount : ",bankAccount);
  if (!bankAccount?.name) return { message: 'Nom de la banque est obligatoire' };
  if (bankAccount?.name.length < 3)
    return { message: 'Nom de la banque doit comporter au moins 3 caractères' };
  if (bankAccount?.currencyId==undefined) return { message: 'Devise est obligatoire' };
  if (bankAccount?.bic === '') return { message: 'BIC/SWIFT est obligatoire' };
  if (bankAccount?.iban === '') return { message: 'IBAN est obligatoire' };
  if (bankAccount?.rib === '') return { message: 'RIB est obligatoire' };
  if (mainByDefault && !bankAccount.isMain) return { message: 'La banque doit être principale' };
  return { message: '' };
};

export const firmBankAccount = {
  find,
  findPaginated,
  factory,
  create,
  update,
  remove,
  validate
};
