import apiClient from './client';

export interface LoyaltySummary {
  points_balance: number;
  lifetime_points: number;
  tier: string;
  tier_multiplier: number;
  discount_value: number;
  next_tier: { tier: string; points_needed: number; threshold: number } | null;
}

export interface LoyaltyTransaction {
  id: number;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  description: string;
  reference: string | null;
  booking_code: string | null;
  created_at: string;
}

export const loyaltyApi = {
  getSummary: () =>
    apiClient.get<{ data: LoyaltySummary }>('/loyalty'),

  getTransactions: (page = 1) =>
    apiClient.get('/loyalty/transactions', { params: { page } }),

  redeem: (points: number) =>
    apiClient.post('/loyalty/redeem', { points }),
};
