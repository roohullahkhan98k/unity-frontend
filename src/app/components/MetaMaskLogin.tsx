"use client";
import React, { useState } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import { MetaMaskAuthService } from '../services/metaMaskAuth';
import { useToast } from '../hooks/useToast';
import MetaMaskInstallGuide from './MetaMaskInstallGuide';

interface MetaMaskLoginProps {
  onSuccess: (token: string) => void;
  mode: 'login' | 'signup';
  onModeChange?: (mode: 'login' | 'signup') => void;
}

export default function MetaMaskLogin({ onSuccess, mode, onModeChange }: MetaMaskLoginProps) {
  const [username, setUsername] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { connectWallet, signMessage, account, error: walletError, isConnecting } = useMetaMask();
  const showToast = useToast();

  // Check if MetaMask is available
  const isMetaMaskAvailable = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  const handleMetaMaskAuth = async () => {
    if (!account) {
      const connectedAccount = await connectWallet();
      if (!connectedAccount) return;
    }

    setIsAuthenticating(true);
    try {
      // Get authentication challenge
      const challenge = await MetaMaskAuthService.getAuthChallenge(account!);
      
      // Sign the challenge message
      const signature = await signMessage(challenge.message);
      if (!signature) {
        throw new Error('Failed to sign message');
      }

      let authResponse;
      if (mode === 'signup') {
        if (!username.trim()) {
          throw new Error('Username is required for signup');
        }
        authResponse = await MetaMaskAuthService.walletSignup(
          account!,
          signature,
          challenge.nonce,
          username
        );
        showToast('Wallet registration successful!', 'success');
      } else {
        authResponse = await MetaMaskAuthService.walletLogin(
          account!,
          signature,
          challenge.nonce
        );
        showToast('Wallet login successful!', 'success');
      }

      onSuccess(authResponse.token);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Authentication failed', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleConnectWallet = async () => {
    const connectedAccount = await connectWallet();
    if (connectedAccount) {
      showToast('Wallet connected successfully!', 'success');
    }
  };

  return (
    <div className="w-full">
      {!isMetaMaskAvailable ? (
        <MetaMaskInstallGuide />
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 14a6 6 0 1112 0H8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Connect with MetaMask
              </h3>
            </div>
            
            {walletError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{walletError}</p>
              </div>
            )}

            {!account ? (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full py-3 px-6 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 14a6 6 0 1112 0H8z" />
                    </svg>
                    Connect MetaMask
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    <strong>Connected:</strong> {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label htmlFor="username" className="block mb-2 font-semibold text-gray-700">
                      Choose Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-orange-400"
                      placeholder="Enter your username"
                      disabled={isAuthenticating}
                    />
                  </div>
                )}

                <button
                  onClick={handleMetaMaskAuth}
                  disabled={isAuthenticating || (mode === 'signup' && !username.trim())}
                  className="w-full py-3 px-6 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    mode === 'signup' ? 'Create Account with Wallet' : 'Sign In with Wallet'
                  )}
                </button>
              </div>
            )}
          </div>

          {onModeChange && (
            <div className="text-center">
              <button
                onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                {mode === 'login' 
                  ? "Don't have an account? Sign up with wallet" 
                  : "Already have an account? Sign in with wallet"
                }
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 