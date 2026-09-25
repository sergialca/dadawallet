import { renderHook, waitFor } from '@testing-library/react-native';
import { act } from 'react';

import { useFavoriteStock, useFavoriteTickers } from '@/hooks/use-favorite-stock';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { getSupabase } from '@/lib/supabase';

jest.mock('@/hooks/use-solana-wallet', () => ({
  useSolanaWallet: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(),
}));

const focusEffects: Array<() => void | (() => void)> = [];

jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    focusEffects.push(effect);
  },
}));

const mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>;
const mockGetSupabase = getSupabase as jest.MockedFunction<typeof getSupabase>;

const walletAddress = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';

function supabaseFor(row: { ticker: string } | null, writeError: { message: string } | null = null) {
  const maybeSingle = jest.fn().mockResolvedValue({ data: row, error: null });
  const insert = jest.fn().mockResolvedValue({ error: writeError });
  const deleteEqTicker = jest.fn().mockResolvedValue({ error: writeError });
  const deleteEqWallet = jest.fn().mockReturnValue({ eq: deleteEqTicker });
  const remove = jest.fn().mockReturnValue({ eq: deleteEqWallet });
  const eqTicker = jest.fn().mockReturnValue({ maybeSingle });
  const eqWallet = jest.fn().mockReturnValue({ eq: eqTicker });
  const select = jest.fn().mockReturnValue({ eq: eqWallet });

  return {
    client: {
      from: jest.fn((table: string) => {
        if (table !== 'favorite_stocks') {
          throw new Error(`Unexpected table ${table}`);
        }
        return { delete: remove, insert, select };
      }),
    },
    insert,
    remove,
  };
}

describe('useFavoriteStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSolanaWallet.mockReturnValue({
      address: walletAddress,
      error: null,
      isLoading: false,
      wallet: null,
    });
  });

  test('saves the wallet and ticker when the stock is not a favorite', async () => {
    const supabase = supabaseFor(null);
    mockGetSupabase.mockReturnValue(supabase.client as never);

    const { result } = await renderHook(() => useFavoriteStock('AAPL'));

    await waitFor(() => {
      expect(result.current.isFavorite).toBe(false);
    });

    await act(async () => {
      await result.current.toggle();
    });

    expect(supabase.insert).toHaveBeenCalledWith({
      ticker: 'AAPL',
      wallet_address: walletAddress,
    });
    expect(result.current.isFavorite).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('removes the favorite when it is already saved', async () => {
    const supabase = supabaseFor({ ticker: 'AAPL' });
    mockGetSupabase.mockReturnValue(supabase.client as never);

    const { result } = await renderHook(() => useFavoriteStock('AAPL'));

    await waitFor(() => {
      expect(result.current.isFavorite).toBe(true);
    });

    await act(async () => {
      await result.current.toggle();
    });

    expect(supabase.remove).toHaveBeenCalled();
    expect(result.current.isFavorite).toBe(false);
  });

  test('stays unsaved when Supabase is not configured', async () => {
    mockGetSupabase.mockReturnValue(null);

    const { result } = await renderHook(() => useFavoriteStock('AAPL'));

    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current.isFavorite).toBe(false);
    expect(result.current.error).toBe('Favorites are unavailable.');
  });
});

describe('useFavoriteTickers', () => {
  beforeEach(() => {
    focusEffects.length = 0;
    jest.clearAllMocks();
    mockUseSolanaWallet.mockReturnValue({
      address: walletAddress,
      error: null,
      isLoading: false,
      wallet: null,
    });
  });

  test('reloads favorites when the trade screen is focused again', async () => {
    let rows = [{ ticker: 'AAPL' }];
    const eq = jest.fn(() => Promise.resolve({ data: rows, error: null }));
    mockGetSupabase.mockReturnValue({
      from: () => ({
        select: () => ({ eq }),
      }),
    } as never);

    const { result } = await renderHook(() => useFavoriteTickers());

    await act(async () => {
      focusEffects.at(-1)?.();
    });
    await waitFor(() => {
      expect(result.current.tickers).toEqual(['AAPL']);
    });

    rows = [];
    await act(async () => {
      focusEffects.at(-1)?.();
    });

    await waitFor(() => {
      expect(result.current.tickers).toEqual([]);
    });
  });
});
