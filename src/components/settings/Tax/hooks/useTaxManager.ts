import { Tax } from '@/types';
import { create } from 'zustand';

type TaxManager = {
  // data
  id?: number;
  label?: string;
  value?: number;
  isRate?: boolean;
  isSpecial?: boolean;
  // methods
  set: (name: keyof TaxManager, value: any) => void;
  reset: () => void;
  getTax: () => Partial<Tax>;
  setTax: (paymentCondition: Partial<Tax>) => void;
};

const initialState: Omit<TaxManager, 'set' | 'reset' | 'getTax' | 'setTax'> = {
  id: 0,
  label: '',
  value: 0,
  isRate: true,
  isSpecial: false
};

export const useTaxManager = create<TaxManager>((set, get) => ({
  ...initialState,
  set: (name: keyof TaxManager, value: any) =>
    set((state) => ({
      ...state,
      [name]: value
    })),
  reset: () => set({ ...initialState }),
  getTax: () => {
    const data = get();
    return {
      id: data.id,
      label: data.label,
      value: data.value,
      isRate: data.isRate,
      isSpecial: data.isSpecial
    };
  },
  setTax: (tax: Partial<Tax>) => {
    set((state) => ({
      ...state,
      ...tax
    }));
  }
}));
