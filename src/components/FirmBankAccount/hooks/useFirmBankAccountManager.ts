import {  Currency, Firm } from '@/types';
import { FirmBankAccount } from '@/types/firm-bank-account';
import { create } from 'zustand';

type FirmBankAccountManager = {
  // data
  id?: number;
  name?: string;
  bic?: string;
  currency?: Currency;
  currencyId?: number;
  rib?: string;
  iban?: string;
  isMain?: boolean;
  firm?:Firm;
  firmId?:number;
  // methods
  set: (name: keyof FirmBankAccountManager, value: any) => void;
  reset: () => void;
  getBankAccount: () => Partial<FirmBankAccount>;
  setBankAccount: (bankAccount: Partial<FirmBankAccount>) => void;
};

const initialState: Omit<
  FirmBankAccountManager,
  'set' | 'reset' | 'getBankAccount' | 'setBankAccount'
> = {
  id: 0,
  name: '',
  bic: '',
  currency: undefined,
  currencyId:undefined,
  rib: '',
  iban: '',
  isMain: false,
  firm:undefined,
  firmId:undefined
};

export const useFirmBankAccountManager = create<FirmBankAccountManager>((set, get) => ({
  ...initialState,
  set: (name: keyof FirmBankAccountManager, value: any) =>
    set((state) => ({
      ...state,
      [name]: value
    })),
  reset: () => set({ ...initialState }),
  getBankAccount: () => {
    const data = get();
    return {
      id: data.id,
      name: data.name,
      bic: data.bic,
      currency: data.currency,
      currencyId:data.currencyId,
      rib: data.rib,
      iban: data.iban,
      isMain: data.isMain,
      firm:data.firm,
      firmId:data.firmId
    };
  },
  setBankAccount: (bankAccount: Partial<FirmBankAccount>) => {
    set((state) => ({
      ...state,
      ...bankAccount
    }));
  }
}));
