import { useState, useEffect } from 'react';
import useAuthToken from './useAuthToken';

export const useCurrentUser = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const token = useAuthToken();

  useEffect(() => {
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          setCurrentUserId(payload.userId);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    } else {
      setCurrentUserId(null);
    }
  }, [token]);

  return currentUserId;
}; 