import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { QUOTATION_STATUS } from '@/types';

const useQuotationChoices = (status: QUOTATION_STATUS, enabled: boolean = true) => {
  const { isPending: isFetchQuotationPending, data: quotationsResp } = useQuery({
    queryKey: ['quotation-choices', status],
    queryFn: () => api.quotation.findChoices(status),
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
