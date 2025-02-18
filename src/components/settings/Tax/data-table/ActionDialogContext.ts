import React from 'react';

export const TaxActionsContext = React.createContext({
  openCreateDialog: () => {},
  openUpdateDialog: () => {},
  openDeleteDialog: () => {},
  searchTerm: '',
  setSearchTerm: (value: string) => {},
  page: 1,
  totalPageCount: 1,
  setPage: (value: number) => {},
  size: 1,
  setSize: (value: number) => {},
  order: true,
  sortKey: '',
  setSortDetails: (order: boolean, sortKey: string) => {}
});

export const useTaxActions = () => React.useContext(TaxActionsContext);
