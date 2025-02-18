import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

//defined so we can handle the main process
const TEST_CABINET =
  typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_CABINET_ID : process.env.CABINET_ID;

const useCabinet = (enabled: boolean = true) => {
  const {
    isPending: isFetchCabinetPending,
    error,
    data: cabinetResp,
    refetch: refetchCabinet
  } = useQuery({
    queryKey: ['cabinet'],
    queryFn: () => api.cabinet.findOne(parseInt(TEST_CABINET || '0'), 'indeed'),
    enabled
  });

  const cabinet = React.useMemo(() => {
    if (!cabinetResp) return null;
    return cabinetResp;
  }, [cabinetResp]);

  return {
    cabinet,
    isFetchCabinetPending,
    error,
    refetchCabinet
  };
};

export default useCabinet;
