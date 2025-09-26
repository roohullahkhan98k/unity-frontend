import { useEffect, useRef, useState, useCallback } from 'react';
import { BalanceService, BalanceData } from '../services/balanceService';
import useAuthToken from './useAuthToken';

export const useBalanceRefresh = (
  onBalanceUpdate: (balance: BalanceData) => void,
  intervalMs: number = 30000, // 30 seconds default
  isWalletConnected: boolean = false
) => {
  const token = useAuthToken();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!token || !isWalletConnected) return;
    
    try {
      const balanceData = await BalanceService.getAccountBalance(token);
      onBalanceUpdate(balanceData);
    } catch (error) {
      // Silently handle errors for auto-refresh
      console.warn('Auto-refresh balance failed:', error);
    }
  }, [token, isWalletConnected, onBalanceUpdate]);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up new interval if connected and on client
    if (isWalletConnected && token && isClient) {
      intervalRef.current = setInterval(fetchBalance, intervalMs);
      
      // Initial fetch
      fetchBalance();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isWalletConnected, token, intervalMs, isClient, fetchBalance]);

  return { fetchBalance };
}; 