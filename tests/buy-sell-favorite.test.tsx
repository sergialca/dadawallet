import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import BuySellScreen from '@/app/(app)/trade/[stockId]';
import { Design } from '@/constants/design';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { getSupabase } from '@/lib/supabase';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ stockId: 'aapl-ondo' }),
  usePathname: () => '/trade/aapl-ondo',
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'dark',
}));

jest.mock('@/hooks/use-usdc-balance', () => ({
  useUsdcBalance: () => ({
    balance: 100,
    isLoading: false,
    refresh: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-trade-quote', () => ({
  useTradeQuote: () => ({
    isLoading: false,
    quote: {
      estimatedShares: 1,
      feeUsdc: 0,
      midPrice: 100,
      minShares: 1,
      quotePrice: 100,
      slippagePercent: 1,
    },
  }),
}));

jest.mock('@/hooks/use-solana-wallet', () => ({
  useSolanaWallet: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(),
}));

const mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>;
const mockGetSupabase = getSupabase as jest.MockedFunction<typeof getSupabase>;

const walletAddress = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';

function supabaseFor(row: { ticker: string } | null) {
  const maybeSingle = jest.fn().mockResolvedValue({ data: row, error: null });
  const insert = jest.fn().mockResolvedValue({ error: null });
  const deleteEqTicker = jest.fn().mockResolvedValue({ error: null });
  const deleteEqWallet = jest.fn().mockReturnValue({ eq: deleteEqTicker });
  const remove = jest.fn().mockReturnValue({ eq: deleteEqWallet });
  const eqTicker = jest.fn().mockReturnValue({ maybeSingle });
  const eqWallet = jest.fn().mockReturnValue({ eq: eqTicker });
  const select = jest.fn().mockReturnValue({ eq: eqWallet });

  return {
    client: {
      from: jest.fn(() => ({ delete: remove, insert, select })),
    },
    deleteEqTicker,
    deleteEqWallet,
    insert,
  };
}

function starColor(glyph: string) {
  return StyleSheet.flatten(screen.getByText(glyph).props.style).color;
}

describe('BuySellScreen favorite star', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSolanaWallet.mockReturnValue({
      address: walletAddress,
      error: null,
      isLoading: false,
      wallet: null,
    });
  });

  test('colors the star and inserts the favorite when it starts unsaved', async () => {
    const supabase = supabaseFor(null);
    mockGetSupabase.mockReturnValue(supabase.client as never);
    const user = userEvent.setup();

    await render(<BuySellScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Save as favorite')).toBeOnTheScreen();
    });
    expect(starColor('☆')).toBe(Design.colors.onSurfaceVariant);

    await user.press(screen.getByLabelText('Save as favorite'));

    await waitFor(() => {
      expect(screen.getByLabelText('Remove from favorites')).toBeOnTheScreen();
    });
    expect(starColor('★')).toBe(Design.colors.success);
    expect(supabase.insert).toHaveBeenCalledWith({
      ticker: 'AAPL',
      wallet_address: walletAddress,
    });
  });

  test('clears the star color and deletes the favorite when it starts saved', async () => {
    const supabase = supabaseFor({ ticker: 'AAPL' });
    mockGetSupabase.mockReturnValue(supabase.client as never);
    const user = userEvent.setup();

    await render(<BuySellScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Remove from favorites')).toBeOnTheScreen();
    });
    expect(starColor('★')).toBe(Design.colors.success);

    await user.press(screen.getByLabelText('Remove from favorites'));

    await waitFor(() => {
      expect(screen.getByLabelText('Save as favorite')).toBeOnTheScreen();
    });
    expect(starColor('☆')).toBe(Design.colors.onSurfaceVariant);
    expect(supabase.deleteEqWallet).toHaveBeenCalledWith('wallet_address', walletAddress);
    expect(supabase.deleteEqTicker).toHaveBeenCalledWith('ticker', 'AAPL');
  });
});
