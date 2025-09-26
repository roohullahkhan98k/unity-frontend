"use client";
import { useState, useEffect } from "react";
import { Wallet, RefreshCw, AlertCircle } from "lucide-react";
import { useMetaMask } from "../hooks/useMetaMask";
import { BalanceService, BalanceData } from "../services/balanceService";
import useAuthToken from "../hooks/useAuthToken";
import { useToast } from "../hooks/useToast";
import { useBalanceRefresh } from "../hooks/useBalanceRefresh";

export default function WalletBalance() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const { account, isConnected } = useMetaMask();
  const token = useAuthToken();
  const showToast = useToast();

  // Check if user has wallet address in their profile
  const hasWalletAddress = userProfile?.walletAddress;
  const isWalletConnected = isConnected && hasWalletAddress;

  const fetchUserProfile = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.warn('Failed to fetch user profile:', error);
    }
  };

  const fetchBalance = async () => {
    if (!token || !isWalletConnected) return;
    
    setLoading(true);
    setError(null);
    try {
      const balanceData = await BalanceService.getAccountBalance(token);
      setBalance(balanceData);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh balance every 30 seconds
  useBalanceRefresh((balanceData) => {
    setBalance(balanceData);
    setLastUpdated(new Date());
  }, 30000, isWalletConnected);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (token && isClient) {
      fetchUserProfile();
    }
  }, [token, isClient]);

  useEffect(() => {
    if (token && isWalletConnected && isClient) {
      fetchBalance();
    }
  }, [token, isWalletConnected, isClient]);

  const formatBalance = (balance: string) => {
    const numBalance = parseFloat(balance);
    if (numBalance === 0) return "0.00";
    if (numBalance < 0.001) return "< 0.001";
    return numBalance.toFixed(4);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
        <div className="flex flex-col items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isWalletConnected) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Wallet className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Connect your MetaMask wallet to view your balance and manage your account.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              <strong>Tip:</strong> You can connect your wallet from the header or login page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Wallet Balance</h3>
        </div>
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
          aria-label="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && !balance ? (
        <div className="flex flex-col items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
          <p className="text-gray-500 text-sm">Loading balance...</p>
        </div>
      ) : balance ? (
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Available Balance</div>
            <div className="text-2xl font-bold mb-1">
              {formatBalance(balance.balance)} {balance.currency}
            </div>
            <div className="text-xs opacity-75">
              {parseFloat(balance.balanceWei).toLocaleString()} Wei
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Connected Wallet</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-mono text-sm text-gray-700">
                {formatAddress(balance.address)}
              </span>
            </div>
          </div>

          {/* Network Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Network</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Ethereum Mainnet</span>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-gray-400 text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">
            Unable to load balance. Please try refreshing.
          </p>
        </div>
      )}
    </div>
  );
} 