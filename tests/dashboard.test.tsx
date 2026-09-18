import { render, screen, userEvent } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';

import DashboardScreen from '@/app/(app)/dashboard';

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
  useWalletBalances: () => ({
    assets: [
      {
        id: 'sol',
        icon: 'sol',
        name: 'SOL',
        symbol: 'SOL',
        amountLabel: '0.02 SOL',
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
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('DashboardScreen', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseRouter.mockReturnValue(router as unknown as ReturnType<typeof useRouter>);
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
  });

  test('switches to the watchlist tab', async () => {
    const user = userEvent.setup();
    await render(<DashboardScreen />);

    await user.press(screen.getByRole('tab', { name: 'Watchlist' }));

    expect(screen.queryByText('SOL')).toBeNull();
    expect(screen.getByText('Microsoft')).toBeOnTheScreen();
  });

  test('opens the profile screen from the user icon', async () => {
    const user = userEvent.setup();
    await render(<DashboardScreen />);

    await user.press(screen.getByLabelText('Profile'));

    expect(router.push).toHaveBeenCalledWith('/profile');
  });
});
