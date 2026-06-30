import { useCallback } from 'react';
import useSocket from './useSocket';

const useComplaintUpdates = (onUpdate) => {
  const handleUpdate = useCallback((payload) => {
    if (onUpdate) {
      onUpdate(payload);
    }
  }, [onUpdate]);

  useSocket('COMPLAINT_UPDATED', handleUpdate);
  useSocket('COMPLAINT_ASSIGNED', handleUpdate);
  useSocket('DASHBOARD_REFRESH', handleUpdate);
};

export default useComplaintUpdates;
