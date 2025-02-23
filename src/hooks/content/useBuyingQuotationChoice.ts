import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BUYING_QUOTATION_STATUS } from '@/types/quotations/buying-quotation';
import { api } from '@/api';

const useQuotationChoices = (status: BUYING_QUOTATION_STATUS, enabled: boolean = true) => {
  const { isPending: isFetchQuotationPending, data: quotationsResp } = useQuery({
    queryKey: ['quotation-choices', status],
    queryFn: () => api.buyingQuotation.findChoices(status),
    enabled: enabled
  });

  const quotations = React.useMemo(() => {
    if (!quotationsResp) return [];
    return quotationsResp;
  }, [quotationsResp]);

  return {
    quotations,
    isFetchQuotationPending
  };
};

export default useQuotationChoices;
