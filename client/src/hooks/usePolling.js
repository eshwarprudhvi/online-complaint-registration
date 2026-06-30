import { useEffect, useRef } from 'react';

/**
 * usePolling hook
 * 
 * Sets up an interval and invokes the callback every `delay` milliseconds.
 * Designed to be easily replaceable by a WebSocket hook (e.g., useSocket) later.
 * 
 * @param {Function} callback - The function to call on each interval
 * @param {Number|null} delay - Delay in ms. Pass null to pause polling.
 */
function usePolling(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default usePolling;
