import type { MarketPrice } from '@/types/meals';
import { create } from 'zustand';

interface MarketState {
  prices: MarketPrice[];
  lastFetchedAt: number | null;
  isLoading: boolean;
  error: string | null;
  marketId: number | null;
  marketName: string | null;
  setPrices: (prices: MarketPrice[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMarket: (id: number, name: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  prices: [],
  lastFetchedAt: null,
  isLoading: false,
  error: null,
  marketId: null,
  marketName: null,
  setPrices: (prices) => set({ prices, lastFetchedAt: Date.now(), error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setMarket: (id, name) => set({ marketId: id, marketName: name }),
}));
