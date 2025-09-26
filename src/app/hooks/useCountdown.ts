"use client";
import { useState, useEffect, useCallback } from 'react';

export function useCountdown(endTime: string | null) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const updateTimeRemaining = useCallback(() => {
    if (!endTime) return;
    
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining("Ended");
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeRemaining(`${minutes}m ${seconds}s`);
    } else {
      setTimeRemaining(`${seconds}s`);
    }
  }, [endTime]);

  useEffect(() => {
    if (!endTime) return;
    
    // Set initial time
    updateTimeRemaining();
    
    // Set up interval
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [endTime, updateTimeRemaining]);

  return timeRemaining;
} 