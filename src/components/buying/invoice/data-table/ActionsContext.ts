/* eslint-disable prettier/prettier */
import React from 'react';

// Define the interface for the context properties
interface InvoiceActionsContextProps {
  openDeleteDialog?: () => void; // Function to open the delete dialog
  openDuplicateDialog?: () => void; // Function to open the duplicate dialog
  openDownloadDialog?: () => void; // Function to open the download dialog
  openInvoiceDialog?: () => void; // Function to open the invoice dialog
  searchTerm?: string; // Search term for filtering invoices
  setSearchTerm?: (value: string) => void; // Function to set the search term
  page?: number; // Current page number
  totalPageCount?: number; // Total number of pages
  setPage?: (value: number) => void; // Function to set the current page
  size?: number; // Number of items per page
  setSize?: (value: number) => void; // Function to set the number of items per page
  order?: boolean; // Sorting order (true for ascending, false for descending)
  sortKey?: string; // Key to sort by
  setSortDetails?: (order: boolean, sortKey: string) => void; // Function to set sorting details
  firmId?: number; // ID of the firm
  interlocutorId?: number; // ID of the interlocutor
}

// Create the context with the defined properties
export const InvoiceActionsContext = React.createContext<InvoiceActionsContextProps>({});

// Custom hook to use the InvoiceActionsContext
export const useInvoiceActions = () => React.useContext(InvoiceActionsContext);