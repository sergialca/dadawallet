import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { useWalletBalances } from '@/hooks/use-wallet-balances';
import { getSolanaBalanceLamports, getSplTokenBalance } from '@/lib/solana-rpc';

jest.mock('@/hooks/use-solana-wallet', () => ({
  useSolanaWallet: jest.fn(),
}));

jest.mock('@/lib/solana-rpc', () => {
  const actual = jest.requireActual('@/lib/solana-rpc') as typeof import('@/lib/solana-rpc');
  return {
    ...actual,
    getSolanaBalanceLamports: jest.fn(),
    getSplTokenBalance: jest.fn(),
  };
});

const mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>;
const mockGetSolanaBalanceLamports = getSolanaBalanceLamports as jest.MockedFunction<
  typeof getSolanaBalanceLamports
>;
const mockGetSplTokenBalance = getSplTokenBalance as jest.MockedFunction<typeof getSplTokenBalance>;

const walletAddress = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';

function BalancesProbe() {
  const balances = useWalletBalances();

  return (
    <View>
      <Text testID="loading">{String(balances.isLoading)}</Text>
      <Text testID="refreshing">{String(balances.isRefreshing)}</Text>
      <Text testID="total">{balances.totalUsdLabel}</Text>
      <Text testID="error">{balances.error?.message ?? ''}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void balances.refresh();
        }}
        testID="refresh-button"
      >
        <Text>Reload</Text>
      </Pressable>
      {balances.assets.map((asset) => (
        <Text key={asset.id} testID={`asset-${asset.id}`}>
          {asset.amountLabel}
        </Text>
      ))}
    </View>
  );
}

function mockWallet() {
  mockUseSolanaWallet.mockReturnValue({
    address: walletAddress,
    error: null,
    isLoading: false,
    wallet: { address: walletAddress },
  } as ReturnType<typeof useSolanaWallet>);
}

function mockBalances(lamports: number, usdcRaw = 5_560_000n) {
  mockGetSolanaBalanceLamports.mockResolvedValue(lamports);
  mockGetSplTokenBalance.mockResolvedValue({
    decimals: 6,
    raw: usdcRaw,
  });
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({ solana: { usd: 100 } }),
  })) as unknown as typeof fetch;
}

describe('useWalletBalances', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWallet();
    mockBalances(20_000_000);
  });

  test('loads wallet assets on mount', async () => {
    await render(<BalancesProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('asset-sol')).toBeOnTheScreen();
    expect(screen.getByTestId('asset-usdc')).toBeOnTheScreen();
    expect(screen.getByTestId('total')).toHaveTextContent('$7.56');
  });

  test('refresh keeps visible balances and uses isRefreshing instead of isLoading', async () => {
    await render(<BalancesProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    mockBalances(40_000_000);
    fireEvent.press(screen.getByTestId('refresh-button'));

    await waitFor(() => {
      expect(screen.getByTestId('asset-sol')).toHaveTextContent('0.04 SOL');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('refreshing')).toHaveTextContent('false');
  });

  test('keeps the last assets when a pull-to-refresh reload fails', async () => {
    await render(<BalancesProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const previousSol = screen.getByTestId('asset-sol').props.children;
    mockGetSolanaBalanceLamports.mockRejectedValue(new Error('rpc down'));

    fireEvent.press(screen.getByTestId('refresh-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('rpc down');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('asset-sol')).toHaveTextContent(previousSol);
  });
});
