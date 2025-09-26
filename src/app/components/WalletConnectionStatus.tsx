"use client";
import { useState, useEffect } from "react";
import { Wallet, AlertCircle } from "lucide-react";
import { useMetaMask } from "../hooks/useMetaMask";
import useAuthToken from "../hooks/useAuthToken";
import { useToast } from "../hooks/useToast";
import { useRouter } from "next/navigation";

export default function WalletConnectionStatus() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const { account, isConnected, connectWallet } = useMetaMask();
  const token = useAuthToken();
  const showToast = useToast();
  const router = useRouter();

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (token && isClient) {
      fetchUserProfile();
    }
  }, [token, isClient]);

  const handleConnectWallet = async () => {
    if (!isConnected) {
      // If MetaMask is not connected, connect it first
      const connectedAccount = await connectWallet();
      if (connectedAccount) {
        showToast('MetaMask connected! Now redirecting to link wallet to your account.', 'success');
        // Redirect to login page with wallet mode
        setTimeout(() => {
          router.push('/login?mode=wallet');
        }, 1500);
      }
    } else {
      // If MetaMask is connected but wallet is not linked to account
      // Show a confirmation dialog to choose between login and register
      const shouldRegister = window.confirm(
        'Do you want to create a new account with your wallet, or link it to an existing account?\n\nClick OK to create a new account, or Cancel to link to existing account.'
      );
      
      if (shouldRegister) {
        showToast('Redirecting to create account with your wallet...', 'success');
        setTimeout(() => {
          router.push('/register?mode=wallet');
        }, 1000);
      } else {
        showToast('Redirecting to link your wallet to existing account...', 'success');
        setTimeout(() => {
          router.push('/login?mode=wallet');
        }, 1000);
      }
    }
  };

  if (!token || !isClient) return null; // Don't show if not logged in or not on client

  return (
    <div className="flex items-center gap-2">
      {isWalletConnected ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <Wallet className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">
            {hasWalletAddress?.slice(0, 6)}...{hasWalletAddress?.slice(-4)}
          </span>
        </div>
      ) : (
        <button
          onClick={handleConnectWallet}
          className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1 hover:bg-orange-100 transition-colors"
        >
          <AlertCircle className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-orange-700 font-medium">
            {isConnected ? 'Link Wallet' : 'Connect Wallet'}
          </span>
        </button>
      )}
    </div>
  );
} 