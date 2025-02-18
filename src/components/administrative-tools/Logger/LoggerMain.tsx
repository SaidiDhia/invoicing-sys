import React from 'react';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useLogs from '@/components/administrative-tools/Logger/hooks/useLogs';
import { DataTable } from './data-table/data-table';
import { getLogColumns } from './data-table/columns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import useSocketLogs from './hooks/useSocketLogs';
import { LoggerActionsContext, LoggerActionsContextProps } from './data-table/ActionsContext';
import { useDebounce } from '@/hooks/other/useDebounce';

interface LoggerMainProps {
  className?: string;
}

export const LoggerMain = ({ className }: LoggerMainProps) => {
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');
  const { t: tLogger } = useTranslation('logger');

  const [sortDetails, setSortDetails] = React.useState({
    order: false,
    sortKey: 'id'
  });
  const { value: debouncedSortDetails, loading: sorting } = useDebounce<typeof sortDetails>(
    sortDetails,
    500
  );

  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  const [events, setEvents] = React.useState<string[]>([]);

  //http logs
  const { logs, isPending, loadMoreLogs, hasNextPage, refetchLogs } = useLogs(
    debouncedSortDetails.sortKey,
    debouncedSortDetails.order ? 'ASC' : 'DESC',
    startDate,
    endDate,
    events
  );
  //socket logs
  const { logs: socketLogs, toggleConnection, isConnected } = useSocketLogs();

  const [newLogsCount, setNewLogsCount] = React.useState(0);

  const { setRoutes } = useBreadcrumb();
  React.useEffect(() => {
    setRoutes([
      {
        title: tCommon('menu.administrative_tools'),
        href: '/administrative-tools/user-management/users'
      },
      { title: tCommon('submenu.logger') }
    ]);
  }, [router.locale]);

  const context: LoggerActionsContextProps = {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    events,
    setEvents,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) => {
      setSortDetails({ order, sortKey });
    },
    newLogsCount,
    setNewLogsCount,
    toggleConnection: () => {
      toggleConnection();
      refetchLogs();
    },
    isConnected
  };

  return (
    <LoggerActionsContext.Provider value={context}>
      <div className={cn('flex flex-col flex-1 overflow-hidden m-5 lg:mx-10', className)}>
        <div className="space-y-0.5 py-5 sm:py-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {tLogger('common.singular')}
          </h1>
          <p className="text-muted-foreground">{tLogger('common.description')}</p>
        </div>
        <Separator className="my-4 lg:my-6" />
        <div className="flex flex-1 flex-col overflow-hidden md:space-y-2">
          <DataTable
            className="flex flex-col flex-1 overflow-hidden p-1 mb-5"
            containerClassName="overflow-auto"
            httpLogs={logs}
            socketLogs={socketLogs}
            columns={getLogColumns(tCommon)}
            hasNextPage={hasNextPage}
            loadMoreLogs={loadMoreLogs}
            isPending={isPending}
          />
        </div>
      </div>
    </LoggerActionsContext.Provider>
  );
};
