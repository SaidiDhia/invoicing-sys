import { BankAccount, Currency } from '@/types';
import { create } from 'zustand';

type BankAccountManager = {
  // data
  id?: number;
  name?: string;
  bic?: string;
  currency?: Currency;
  rib?: string;
  iban?: string;
  isMain?: boolean;
  // methods
  set: (name: keyof BankAccountManager, value: any) => void;
  reset: () => void;
  getBankAccount: () => Partial<BankAccount>;
  setBankAccount: (bankAccount: Partial<BankAccount>) => void;
};

const initialState: Omit<
  BankAccountManager,
  'set' | 'reset' | 'getBankAccount' | 'setBankAccount'
> = {
  id: 0,
  name: '',
  bic: '',
  currency: undefined,
  rib: '',
  iban: '',
  isMain: false
};

export const useBankAccountManager = create<BankAccountManager>((set, get) => ({
  ...initialState,
  set: (name: keyof BankAccountManager, value: any) =>
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
      rib: data.rib,
      iban: data.iban,
      isMain: data.isMain
    };
  },
  setBankAccount: (bankAccount: Partial<BankAccount>) => {
    set((state) => ({
      ...state,
      ...bankAccount
    }));
  }
}));
