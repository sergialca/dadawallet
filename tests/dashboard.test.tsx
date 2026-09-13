import { usePrivy } from '@privy-io/expo';
import { render, screen, userEvent } from '@testing-library/react-native';
import { usePathname } from 'expo-router';

import DashboardScreen from '@/app/(app)/dashboard';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@privy-io/expo', () => ({
  usePrivy: jest.fn(),
  useEmbeddedEthereumWallet: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'dark',
}));

jest.mock('@/hooks/use-evm-wallet', () => ({
  useEvmWallet: () => ({
    address: '0x1111111111111111111111111111111111111111',
    error: null,
    isLoading: false,
    wallet: { address: '0x1111111111111111111111111111111111111111' },
  }),
}));

jest.mock('@/hooks/use-wallet-balances', () => ({
  useWalletBalances: () => ({
    assets: [
      {
        id: 'eth',
        icon: 'eth',
        name: 'ETH - sepolia',
        symbol: 'ETH',
        amountLabel: '0.02 ETH',
        usdValue: 50,
        usdLabel: '$50',
      },
      {
        id: 'usdc',
        icon: 'usdc',
        name: 'USD Coin',
        symbol: 'USDC',
        amountLabel: '5.56 USDC',
        usdValue: 5.56,
        usdLabel: '$5.56',
      },
    ],
    error: null,
    isLoading: false,
    totalUsd: 55.56,
    totalUsdLabel: '$55.56',
  }),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUsePrivy = usePrivy as jest.MockedFunction<typeof usePrivy>;

describe('DashboardScreen', () => {
  const logout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
    mockUsePrivy.mockReturnValue({ logout } as unknown as ReturnType<typeof usePrivy>);
  });

  test('renders the portfolio dashboard', async () => {
    await render(<DashboardScreen />);

    expect((await screen.findAllByText('Dashboard')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Sepolia')).toBeOnTheScreen();
    expect(screen.getByText('Total portfolio value')).toBeOnTheScreen();
    expect(screen.getByText('$55.56')).toBeOnTheScreen();
    expect(screen.getByText('Receive')).toBeOnTheScreen();
    expect(screen.getByText('Send')).toBeOnTheScreen();
    expect(screen.getByText('ETH - sepolia')).toBeOnTheScreen();
    expect(screen.getByText('USD Coin')).toBeOnTheScreen();
  });

  test('switches to the watchlist tab', async () => {
    const user = userEvent.setup();
    await render(<DashboardScreen />);

    await user.press(screen.getByRole('tab', { name: 'Watchlist' }));

    expect(screen.queryByText('ETH - sepolia')).toBeNull();
    expect(screen.getByText('Microsoft')).toBeOnTheScreen();
  });

  test('logs out from the profile control', async () => {
    const user = userEvent.setup();
    await render(<DashboardScreen />);

    await user.press(screen.getByLabelText('Log out'));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
