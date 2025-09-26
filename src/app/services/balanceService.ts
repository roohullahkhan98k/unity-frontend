const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface BalanceData {
  balance: string;
  balanceWei: string;
  address: string;
  currency: string;
}

export interface BalanceResponse {
  message: string;
  balance: string;
  balanceWei: string;
  address: string;
  currency: string;
}

export class BalanceService {
  static async getAccountBalance(token: string): Promise<BalanceData> {
    const response = await fetch(`${BASE_URL}/api/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get account balance');
    }

    const data: BalanceResponse = await response.json();
    return {
      balance: data.balance,
      balanceWei: data.balanceWei,
      address: data.address,
      currency: data.currency,
    };
  }

  static async getAddressBalance(address: string): Promise<BalanceData> {
    const response = await fetch(`${BASE_URL}/api/balance/${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get address balance');
    }

    const data: BalanceResponse = await response.json();
    return {
      balance: data.balance,
      balanceWei: data.balanceWei,
      address: data.address,
      currency: data.currency,
    };
  }
} 