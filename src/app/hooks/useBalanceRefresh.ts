import { useEffect, useRef, useState } from 'react';
import { useMetaMask } from './useMetaMask';
import { BalanceService } from '../services/balanceService';
import useAuthToken from './useAuthToken';
import { useToast } from './useToast';

export const useBalanceRefresh = (
  onBalanceUpdate: (balance: any) => void,
  intervalMs: number = 30000, // 30 seconds default
  isWalletConnected: boolean = false
) => {
  const { isConnected, account } = useMetaMask();
  const token = useAuthToken();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const showToast = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchBalance = async () => {
    if (!token || !isWalletConnected) return;
    
    try {
      const balanceData = await BalanceService.getAccountBalance(token);
      onBalanceUpdate(balanceData);
    } catch (error) {
      // Silently handle errors for auto-refresh
      console.warn('Auto-refresh balance failed:', error);
    }
  };

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
  }, [isWalletConnected, token, intervalMs, isClient]);

  return { fetchBalance };
}; 