import { api } from '@/api';
import { Activity, Address, Currency, Firm, PaymentCondition, SOCIAL_TITLE } from '@/types';
import _ from 'lodash';
import { create } from 'zustand';

type FirmManager = {
  //snapshot
  snapshot?: Firm;
  changed?: boolean;
  // data
  id?: number;
  title?: SOCIAL_TITLE;
  name?: string;
  surname?: string;
  enterpriseName?: string;
  position?: string;
  website?: string;
  entreprisePhone?: string;
  email?: string;
  phone?: string;
  isPerson?: boolean;
  taxIdNumber?: string;
  activity?: Activity;
  currency?: Currency;
  paymentCondition?: PaymentCondition;
  notes?: string;
  invoicingAddress?: Address;
  deliveryAddress?: Address;
  // methods
  set: (name: keyof FirmManager, value: any) => void;
  setFirm: (firm: Firm) => void;
  reset: () => void;
  getFirm: () => Firm;
};

const getNormalizedFirm = (data: any) => {
  return {
    id: data.id,
    name: data.enterpriseName,
    mainInterlocutor: {
      title: data?.title,
      name: data?.name,
      surname: data?.surname,
      phone: data?.phone,
      email: data?.email,
      position: data?.position
    },
    activityId: data?.activity?.id,
    currencyId: data?.currency?.id,
    paymentConditionId: data?.paymentCondition?.id,
    isPerson: data?.isPerson,
    website: data?.website,
    phone: data?.entreprisePhone,
    ...(data?.isPerson ? {} : { taxIdNumber: data?.taxIdNumber }),
    notes: data?.notes,
    invoicingAddress: data?.invoicingAddress,
    deliveryAddress: data?.deliveryAddress
  } as Firm;
};

const initialState: Omit<FirmManager, 'set' | 'setFirm' | 'reset' | 'getFirm' | 'hasChanged'> = {
  id: undefined,
  title: SOCIAL_TITLE.MR,
  name: '',
  surname: '',
  enterpriseName: '',
  website: '',
  entreprisePhone: '',
  email: '',
  phone: '',
  isPerson: false,
  taxIdNumber: '',
  activity: undefined,
  currency: undefined,
  paymentCondition: undefined,
  notes: '',
  invoicingAddress: api.address.factory(),
  deliveryAddress: api.address.factory(),
  position: '',
  snapshot: undefined,
  changed: false
};

export const useFirmManager = create<FirmManager>((set, get) => ({
  ...initialState,
  set: (name: keyof FirmManager, value: any) => {
    set((state) => {
      const newState = {
        ...state,
        [name]: value
      };
      newState.changed = !_.isEqual(newState.snapshot, getNormalizedFirm(newState));
      return newState;
    });
  },
  setFirm: (firm: Firm) => {
    const mainInterlocutor = firm?.interlocutorsToFirm?.find((interlocutor) => interlocutor.isMain);
    const data = {
      id: firm?.id,
      title: mainInterlocutor?.interlocutor?.title as SOCIAL_TITLE,
      name: mainInterlocutor?.interlocutor?.name,
      surname: mainInterlocutor?.interlocutor?.surname,
      enterpriseName: firm?.name,
      website: firm?.website,
      entreprisePhone: firm?.phone,
      email: mainInterlocutor?.interlocutor?.email,
      phone: mainInterlocutor?.interlocutor?.phone,
      position: mainInterlocutor?.position,
      isPerson: firm?.isPerson,
      taxIdNumber: firm?.taxIdNumber,
      activity: firm?.activity,
      currency: firm?.currency,
      paymentCondition: firm?.paymentCondition,
      notes: firm?.notes,
      invoicingAddress: firm?.invoicingAddress,
      deliveryAddress: firm?.deliveryAddress
    };
    set((state) => ({
      ...state,
      ...data,
      snapshot: getNormalizedFirm(data)
    }));
  },
  getFirm: () => {
    const { set, reset, ...data } = get();
    return getNormalizedFirm(data);
  },
  reset: () => {
    set(() => ({
      ...initialState
    }));
  }
}));
