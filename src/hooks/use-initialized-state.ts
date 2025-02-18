import React from 'react';
import _ from 'lodash';

interface UseInitializedStateProps {
  data: any;
  getCurrentData: () => any;
  setFormData: (data: any) => void;
  resetData: () => void;
  loading: boolean;
}

const useInitializedState = ({
  data,
  getCurrentData,
  setFormData,
  resetData,
  loading
}: UseInitializedStateProps) => {
  const [initialData, setInitialData] = React.useState<any | null>(null);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const initializeData = () => {
    if (data) {
      setFormData(data);
      setInitialData(getCurrentData());
      setIsDataLoaded(true);
    }
  };

  React.useEffect(() => {
    if (!loading) {
      initializeData();
    }
  }, [data, loading]);

  const globalReset = () => {
    resetData();
    initializeData();
  };

  const isDisabled = React.useMemo(() => {
    if (!isDataLoaded || loading) return true;
    return _.isEqual(initialData, getCurrentData());
  }, [initialData, getCurrentData, isDataLoaded, loading]);

  return {
    isDisabled,
    globalReset,
    setInitialData,
    isDataLoaded
  };
};

export default useInitializedState;
