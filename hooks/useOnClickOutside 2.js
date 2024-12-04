// hooks/useOnClickOutside.js

import { useEffect } from 'react';

/**
 * useOnClickOutside
 * Detects clicks outside the specified ref and triggers the callback.
 *
 * @param {React.RefObject} ref - The ref of the element to detect outside clicks for.
 * @param {Function} handler - The callback to execute on outside click.
 */
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or its descendants
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // Bind the event listener
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener); // For mobile devices

    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Re-run if ref or handler changes
};

export default useOnClickOutside;
