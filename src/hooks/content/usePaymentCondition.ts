import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

const usePaymentCondition = (enabled: boolean = true) => {
  const { isPending: isFetchPaymentConditionsPending, data: paymentConditionsResp } = useQuery({
    queryKey: ['payment-conditions'],
    queryFn: () => api.paymentCondition.find(),
    enabled
  });

  const paymentConditions = React.useMemo(() => {
    if (!paymentConditionsResp) return [];
    return paymentConditionsResp;
  }, [paymentConditionsResp]);

  return {
    paymentConditions,
    isFetchPaymentConditionsPending
  };
};

export default usePaymentCondition;
