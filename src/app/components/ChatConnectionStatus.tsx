"use client";
import { useSelector } from 'react-redux';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import type { RootState } from '../../store/store';

export default function ChatConnectionStatus() {
  const { isConnected, error } = useSelector((state: RootState) => state.chat);

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Wifi className="w-4 h-4" />
        <span className="text-sm">Connected</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-yellow-600">
      <RefreshCw className="w-4 h-4 animate-spin" />
      <span className="text-sm">Connecting...</span>
    </div>
  );
} 