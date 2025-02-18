import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

const useTaxWithholding = (enabled: boolean = true) => {
  const { isPending: isFetchTaxWithholdingsPending, data: taxWithholdingsResp } = useQuery({
    queryKey: ['tax-withholdings'],
    queryFn: () => api.taxWithholding.find(),
    enabled
  });

  const taxWithholdings = React.useMemo(() => {
    if (!taxWithholdingsResp) return [];
    return taxWithholdingsResp;
  }, [taxWithholdingsResp]);

  return {
    taxWithholdings,
    isFetchTaxWithholdingsPending
  };
};

export default useTaxWithholding;
