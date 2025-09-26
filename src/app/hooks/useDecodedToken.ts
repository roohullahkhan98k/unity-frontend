import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';')[0] || null;
  return null;
}

export default function useDecodedToken(): DecodedToken | null {
  if (typeof window === 'undefined') return null;

  const token = getCookie('token');
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
