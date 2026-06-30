import { useState, useCallback } from 'react';
import useSocket from './useSocket';

const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const handleUserOnline = useCallback(({ userId }) => {
    setOnlineUsers(prev => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
  }, []);

  const handleUserOffline = useCallback(({ userId }) => {
    setOnlineUsers(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  useSocket('USER_ONLINE', handleUserOnline);
  useSocket('USER_OFFLINE', handleUserOffline);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return { isUserOnline };
};

export default usePresence;
