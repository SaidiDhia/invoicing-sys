import { Currency, Firm, PAYMENT_MODE, Payment, PaymentUploadedFile } from '@/types';
import { create } from 'zustand';

type PaymentManager = {
  // data
  id?: number;
  date?: Date | undefined;
  amount?: number;
  fee?: number;
  convertionRate: number;
  currency?: Currency;
  currencyId?: number;
  notes?: string;
  mode?: PAYMENT_MODE;
  uploadedFiles: PaymentUploadedFile[];
  firm?: Firm;
  firmId?: number;
  // methods
  set: (name: keyof PaymentManager, value: any) => void;
  getPayment: () => Partial<PaymentManager>;
  setPayment: (payment: Partial<Payment & { files: PaymentUploadedFile[] }>) => void;
  reset: () => void;
};

const initialState: Omit<PaymentManager, 'set' | 'reset' | 'getPayment' | 'setPayment'> = {
  id: -1,
  date: undefined,
  amount: 0,
  fee: 0,
  convertionRate: 1,
  currencyId: undefined,
  notes: '',
  mode: PAYMENT_MODE.Cash,
  uploadedFiles: [],
  firmId: undefined
};

export const usePaymentManager = create<PaymentManager>((set, get) => ({
  ...initialState,
  set: (name: keyof PaymentManager, value: any) => {
    if (name === 'date') {
      const dateValue = typeof value === 'string' ? new Date(value) : value;
      set((state) => ({
        ...state,
        [name]: dateValue
      }));
    } else {
      set((state) => ({
        ...state,
        [name]: value
      }));
    }
  },
  getPayment: () => {
    const { id, date, amount, fee, convertionRate, mode, notes, uploadedFiles, ...rest } = get();

    return {
      id,
      date,
      amount,
      fee,
      convertionRate,
      notes,
      uploadedFiles
    };
  },
  setPayment: (payment: Partial<Payment & { files: PaymentUploadedFile[] }>) => {
    set((state) => ({
      ...state,
      id: payment?.id,
      date: payment?.date ? new Date(payment?.date) : undefined,
      amount: payment?.amount,
      fee: payment?.fee,
      convertionRate: payment?.convertionRate,
      notes: payment?.notes,
      mode: payment?.mode,
      firmId: payment?.firmId,
      firm: payment?.firm,
      currencyId: payment?.currencyId,
      currency: payment?.currency,
      uploadedFiles: payment?.files || []
    }));
  },
  reset: () => set({ ...initialState })
}));
