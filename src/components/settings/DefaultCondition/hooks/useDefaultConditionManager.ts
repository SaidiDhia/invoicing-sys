import { DefaultCondition } from '@/types';
import { create } from 'zustand';

type DefaultConditionManager = {
  // data
  defaultConditions: DefaultCondition[];
  // methods
  setDefaultConditionById: (id: number, value: string) => void;
  getDefaultConditionById: (id: number) => DefaultCondition | undefined;
  getDefaultConditions: () => DefaultCondition[];
  setDefaultConditions: (defaultConditions: DefaultCondition[]) => void;
  reset: () => void;
};

const initialState: Omit<
  DefaultConditionManager,
  | 'setDefaultConditionById'
  | 'getDefaultConditionById'
  | 'getDefaultConditions'
  | 'setDefaultConditions'
  | 'setPropagationById'
  | 'reset'
> = {
  defaultConditions: []
};

export const useDefaultConditionManager = create<DefaultConditionManager>((set, get) => ({
  ...initialState,
  setDefaultConditionById: (id: number, value: string) => {
    const defaultConditions = get().defaultConditions;
    const updatedConditions = defaultConditions.map((condition) =>
      condition.id === id ? { ...condition, value } : condition
    );
    set({ defaultConditions: updatedConditions });
  },

  getDefaultConditionById: (id: number) => {
    const defaultConditions = get().defaultConditions;
    return defaultConditions.find((condition) => condition.id === id);
  },

  getDefaultConditions: () => {
    return get().defaultConditions;
  },

  setDefaultConditions: (defaultConditions: DefaultCondition[]) =>
    set((state) => ({
      ...state,
      defaultConditions
    })),

  reset: () => set({ ...initialState })
}));
