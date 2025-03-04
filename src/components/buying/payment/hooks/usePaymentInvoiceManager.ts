import { Currency, PaymentInvoiceEntry } from '@/types';
import dinero from 'dinero.js';
import { createDineroAmountFromFloatWithDynamicCurrency } from '@/utils/money.utils';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { BuyingPaymentInvoiceEntry } from '@/types/payments/buying-payment';

type PaymentPseudoItem = { id: string; invoice: BuyingPaymentInvoiceEntry };

export type PaymentInvoiceManager = {
  invoices: PaymentPseudoItem[];
  add: (invoice?: BuyingPaymentInvoiceEntry) => void;
  update: (id: string, article: BuyingPaymentInvoiceEntry) => void;
  delete: (id: string) => void;
  setInvoices: (
    entries: BuyingPaymentInvoiceEntry[],
    currency: Currency,
    convertionRate: number,
    mode?: 'EDIT' | 'NEW'
  ) => void;
  reset: () => void;
  getInvoices: () => BuyingPaymentInvoiceEntry[];
  calculateUsedAmount: () => number;
  init: () => void;
};

export const usePaymentInvoiceManager = create<PaymentInvoiceManager>()((set, get) => ({
  invoices: [],
  add: (invoice: BuyingPaymentInvoiceEntry = {} as BuyingPaymentInvoiceEntry) => {
    set((state) => ({
      invoices: [...state.invoices, { id: uuidv4(), invoice }]
    }));
  },

  update: (id: string, invoice: BuyingPaymentInvoiceEntry) => {
    set((state) => ({
      invoices: state.invoices.map((a) => (a.id === id ? { ...a, invoice } : a))
    }));
  },

  delete: (id: string) => {
    set((state) => ({
      invoices: state.invoices.filter((a) => a.id !== id)
    }));
  },

  setInvoices: (
    entries: BuyingPaymentInvoiceEntry[],
    currency: Currency,
    convertionRate: number,
    mode?: 'EDIT' | 'NEW'
  ) => {
    const actualEntries =
      mode === 'EDIT'
        ? entries.map((entry) => {
            const amountPaid = entry?.invoice?.amountPaid || 0;
            const entryAmount = entry?.amount || 0;
            return {
              ...entry,
              invoice: {
                ...entry.invoice,
                amountPaid: amountPaid - entryAmount
              },
              amount: dinero({
                amount: createDineroAmountFromFloatWithDynamicCurrency(
                  currency.id != entry.invoice?.currencyId
                    ? entryAmount / convertionRate
                    : entryAmount,
                  currency.digitAfterComma || 3
                ),
                precision: currency.digitAfterComma || 3
              }).toUnit()
            };
          })
        : entries;
    set({
      invoices: actualEntries.map((invoice) => {
        return {
          id: uuidv4(),
          invoice
        };
      })
    });
  },

  reset: () =>
    set({
      invoices: []
    }),
  init: () => {
    const updatedInvoices = get().invoices.map((i) => ({
      ...i,
      invoice: {
        ...i.invoice,
        amount: 0
      }
    }));
    set({ invoices: updatedInvoices });
  },
  getInvoices: () => {
    return get().invoices.map((item) => {
      return item.invoice;
    });
  },
  calculateUsedAmount: () => {
    const invoices = get().invoices.map((i) => i.invoice);
    return invoices.reduce((acc, invoice) => {
      return acc + (invoice?.amount || 0);
    }, 0);
  }
}));
