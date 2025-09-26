import { useRef, useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }

      // Clear any existing timer
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }

      // Set a timer to call the function after the delay
      lastCallTimer.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }) as T,
    [callback, delay]
  );
}

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
} 