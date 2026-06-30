import { useCallback } from 'react';
import useSocket from './useSocket';

const useNotifications = (onNewNotification) => {
  const handleNewNotification = useCallback((notification) => {
    if (onNewNotification) {
      onNewNotification(notification);
    }
  }, [onNewNotification]);

  useSocket('NEW_NOTIFICATION', handleNewNotification);
};

export default useNotifications;
