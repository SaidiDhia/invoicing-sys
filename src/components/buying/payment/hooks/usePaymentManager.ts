import { Currency, Firm} from '@/types';
import { BUYING_PAYMENT_MODE, BuyingPayment, BuyingPaymentUploadedFile } from '@/types/payments/buying-payment';
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
  mode?: BUYING_PAYMENT_MODE;
  uploadedFiles: BuyingPaymentUploadedFile[];
  firm?: Firm;
  firmId?: number;
  // methods
  set: (name: keyof PaymentManager, value: any) => void;
  getPayment: () => Partial<PaymentManager>;
  setPayment: (payment: Partial<BuyingPayment & { files: BuyingPaymentUploadedFile[] }>) => void;
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
  mode: BUYING_PAYMENT_MODE.Cash,
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
  setPayment: (payment: Partial<BuyingPayment & { files: BuyingPaymentUploadedFile[] }>) => {
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
