import { useState, useEffect, useCallback } from 'react';

interface MetaMaskState {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const useMetaMask = () => {
  const [state, setState] = useState<MetaMaskState>({
    isConnected: false,
    account: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const ethereum = window.ethereum;
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            account: accounts[0],
            chainId,
            error: null,
          }));
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return null;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ethereum = window.ethereum;
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        account: accounts[0],
        chainId,
        isConnecting: false,
        error: null,
      }));

      return accounts[0];
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
      return null;
    }
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!state.account) {
      setState(prev => ({
        ...prev,
        error: 'No wallet connected',
      }));
      return null;
    }

    if (typeof window === 'undefined' || !window.ethereum) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask is not available',
      }));
      return null;
    }

    try {
      const ethereum = window.ethereum;
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, state.account],
      })
      return signature;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to sign message',
      }));
      return null;
    }
  }, [state.account]);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();

    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum;
      
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setState(prev => ({
            ...prev,
            isConnected: false,
            account: null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            account: accounts[0],
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setState(prev => ({
          ...prev,
          chainId,
        }));
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkIfWalletIsConnected]);

  return {
    ...state,
    connectWallet,
    signMessage,
    disconnect,
    checkIfWalletIsConnected,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
} 