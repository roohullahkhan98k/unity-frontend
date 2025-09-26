"use client";
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchNotifications, fetchUnreadCount } from '../../store/notificationsSlice';
import useAuthToken from './useAuthToken';

export function useNotificationSync() {
  const dispatch = useDispatch();
  const token = useAuthToken();
  const lastFetchTime = useRef<number>(0);
  const isPolling = useRef<boolean>(false);

  const fetchNotificationsWithThrottle = useCallback(() => {
    const now = Date.now();
    // Only fetch if it's been more than 5 seconds since last fetch
    if (now - lastFetchTime.current > 5000) {
      lastFetchTime.current = now;
      if (token) {
        dispatch(fetchNotifications({ includeRead: true, token }));
      }
    }
  }, [token, dispatch]);

  const fetchUnreadCountWithThrottle = useCallback(() => {
    const now = Date.now();
    // Only fetch if it's been more than 2 seconds since last fetch
    if (now - lastFetchTime.current > 2000) {
      lastFetchTime.current = now;
      if (token) {
        dispatch(fetchUnreadCount({ token }));
      }
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (!token || isPolling.current) return;

    isPolling.current = true;
    
    // Initial fetch
    dispatch(fetchNotifications({ includeRead: true, token }));
    dispatch(fetchUnreadCount({ token }));

    // Fast polling for unread count (every 10 seconds)
    const countInterval = setInterval(() => {
      dispatch(fetchUnreadCount({ token }));
    }, 10000);

    // Slower polling for full notifications (every 45 seconds)
    const notificationsInterval = setInterval(() => {
      dispatch(fetchNotifications({ includeRead: true, token }));
    }, 45000);

    return () => {
      clearInterval(countInterval);
      clearInterval(notificationsInterval);
      isPolling.current = false;
    };
  }, [token, dispatch]);

  return {
    fetchNotifications: fetchNotificationsWithThrottle,
    fetchUnreadCount: fetchUnreadCountWithThrottle
  };
} 