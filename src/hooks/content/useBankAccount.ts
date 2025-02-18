import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

const useBankAccount = (enabled: boolean = true) => {
  const { isPending: isFetchBankAccountsPending, data: bankAccountsResp } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => api.bankAccount.find(),
    enabled
  });

  const bankAccounts = React.useMemo(() => {
    if (!bankAccountsResp) return [];
    return bankAccountsResp;
  }, [bankAccountsResp]);

  return {
    bankAccounts,
    isFetchBankAccountsPending
  };
};

export default useBankAccount;
