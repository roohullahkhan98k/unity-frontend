const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AuthChallenge {
  message: string;
  nonce: string;
}

export interface WalletAuthResponse {
  token: string;
  user: {
    userId: string;
    username: string;
    walletAddress: string;
    profileImage?: string;
  };
}

export class MetaMaskAuthService {
  static async getAuthChallenge(walletAddress: string): Promise<AuthChallenge> {
    const response = await fetch(`${BASE_URL}/api/wallet/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get authentication challenge');
    }

    const data = await response.json();
    return data.challenge;
  }

  static async walletSignup(
    walletAddress: string,
    signature: string,
    nonce: string,
    username: string
  ): Promise<WalletAuthResponse> {
    const response = await fetch(`${BASE_URL}/api/wallet/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        signature,
        nonce,
        username,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Wallet signup failed');
    }

    return await response.json();
  }

  static async walletLogin(
    walletAddress: string,
    signature: string,
    nonce: string
  ): Promise<WalletAuthResponse> {
    const response = await fetch(`${BASE_URL}/api/wallet/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        signature,
        nonce,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Wallet login failed');
    }

    return await response.json();
  }
} 