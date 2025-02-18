import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

const useFirmChoices = (params: string[], enabled: boolean = true) => {
  const { isPending: isFetchFirmsPending, data: firmsResp } = useQuery({
    queryKey: ['firm-choices', params],
    queryFn: () => api.firm.findChoices(params),
    enabled
  });

  const firms = React.useMemo(() => {
    if (!firmsResp) return [];
    return firmsResp;
  }, [firmsResp]);

  return {
    firms,
    isFetchFirmsPending
  };
};

export default useFirmChoices;
