import { render, screen, userEvent } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';

import DashboardScreen from '@/app/(app)/dashboard';
import { useWalletBalances } from '@/hooks/use-wallet-balances';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'dark',
}));

jest.mock('@/hooks/use-solana-wallet', () => ({
  useSolanaWallet: () => ({
    address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
    error: null,
    isLoading: false,
    wallet: { address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' },
  }),
}));

jest.mock('@/hooks/use-wallet-balances', () => ({
  useWalletBalances: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseWalletBalances = useWalletBalances as jest.MockedFunction<typeof useWalletBalances>;
const mockRefreshBalances = jest.fn();

const walletBalances = {
  assets: [
    {
      id: 'sol' as const,
      icon: 'sol' as const,
      name: 'SOL',
      symbol: 'SOL',
      amountLabel: '0.02 SOL',
      usdValue: 50,
      usdLabel: '$50',
    },
    {
      id: 'usdc' as const,
      icon: 'usdc' as const,
      name: 'USD Coin',
      symbol: 'USDC',
      amountLabel: '5.56 USDC',
      usdValue: 5.56,
      usdLabel: '$5.56',
    },
    {
      id: 'kalshi-tessera',
      icon: 'token' as const,
      name: 'Kalshi',
      symbol: 'tKalshi',
      amountLabel: '1.5 tKalshi',
      usdValue: null,
      usdLabel: '—',
      logoUrl: 'https://logo.clearbit.com/kalshi.com',
    },
  ],
  error: null,
  isLoading: false,
  isRefreshing: false,
  refresh: mockRefreshBalances,
  totalUsd: 55.56,
  totalUsdLabel: '$55.56',
};

describe('DashboardScreen', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseRouter.mockReturnValue(router as unknown as ReturnType<typeof useRouter>);
    mockUseWalletBalances.mockReturnValue(walletBalances);
  });

  test('renders the portfolio dashboard', async () => {
    await render(<DashboardScreen />);

    expect((await screen.findAllByText('Dashboard')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Solana Devnet')).toBeOnTheScreen();
    expect(screen.getByText('Total portfolio value')).toBeOnTheScreen();
    expect(screen.getByText('$55.56')).toBeOnTheScreen();
    expect(screen.getByText('Receive')).toBeOnTheScreen();
    expect(screen.getByText('Send')).toBeOnTheScreen();
    expect(screen.getAllByText('SOL').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('USD Coin')).toBeOnTheScreen();
    expect(screen.getByText('Kalshi')).toBeOnTheScreen();
    expect(screen.getByText('1.5 tKalshi')).toBeOnTheScreen();
  });

  test('opens the profile screen from the user icon', async () => {
    const user = userEvent.setup();
    await render(<DashboardScreen />);

    await user.press(screen.getByLabelText('Profile'));

    expect(router.push).toHaveBeenCalledWith('/profile');
  });

  test('reloads wallet balances when the dashboard is pulled to refresh', async () => {
    await render(<DashboardScreen />);

    const scroll = screen.getByTestId('dashboard-scroll');
    scroll.props.refreshControl.props.onRefresh();

    expect(scroll.props.refreshControl.props.refreshing).toBe(false);
    expect(mockRefreshBalances).toHaveBeenCalledTimes(1);
  });

  test('shows the native refresh indicator while balances are reloading', async () => {
    mockUseWalletBalances.mockReturnValue({
      ...walletBalances,
      isRefreshing: true,
    });

    await render(<DashboardScreen />);

    expect(screen.getByTestId('dashboard-scroll').props.refreshControl.props.refreshing).toBe(true);
    expect(screen.getByText('USD Coin')).toBeOnTheScreen();
  });
});
