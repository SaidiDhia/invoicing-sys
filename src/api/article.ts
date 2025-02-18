import { ArticleQuotationEntry } from '@/types';
import { DISCOUNT_TYPE } from '../types/enums/discount-types';

const factory = (): ArticleQuotationEntry => {
  return {
    article: { title: '', description: '' },
    unit_price: 0,
    quantity: 0,
    discount: 0,
    discount_type: DISCOUNT_TYPE.PERCENTAGE,
    articleQuotationEntryTaxes: [],
    total: 0
  };
};

export const article = { factory };
