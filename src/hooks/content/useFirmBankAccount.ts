import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

const useFirmBankAccount = (enabled: boolean = true) => {
  const { isPending: isFetchFirmBankAccountsPending, data: firmBankAccountsResp } = useQuery({
    queryKey: ['firm-bank-accounts'],
    queryFn: () => api.firmBankAccount.find(),
    enabled
  });

  const firmBankAccounts = React.useMemo(() => {
    if (!firmBankAccountsResp) return [];
    return firmBankAccountsResp;
  }, [firmBankAccountsResp]);

  return {
    firmBankAccounts,
    isFetchFirmBankAccountsPending
  };
};

export default useFirmBankAccount;
