import { fireEvent, render, screen } from '@testing-library/react-native';
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

jest.mock('@/hooks/use-evm-wallet', () => ({
  useEvmWallet: () => ({
    address: '0x7a1234567890abcdef4f',
    error: null,
    isLoading: false,
    wallet: { address: '0x7a1234567890abcdef4f' },
  }),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('DashboardScreen', () => {
  const router = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseRouter.mockReturnValue(router as unknown as ReturnType<typeof useRouter>);
  });

  test('renders the portfolio dashboard and keeps screen and route paths at the bottom', async () => {
    await render(<DashboardScreen />);

    expect(await screen.findByText('Dashboard')).toBeOnTheScreen();
    expect(screen.getByText('Sepolia')).toBeOnTheScreen();
    expect(screen.getByText('Total portfolio value')).toBeOnTheScreen();
    expect(screen.getByText('$55.56.')).toBeOnTheScreen();
    expect(screen.getByText('Receive')).toBeOnTheScreen();
    expect(screen.getByText('Send')).toBeOnTheScreen();
    expect(screen.getByText('ETH - sepolia')).toBeOnTheScreen();
    expect(screen.getByText('USD Coin')).toBeOnTheScreen();
    expect(screen.getByText('Microsoft')).toBeOnTheScreen();
    expect(screen.getByText('Screen: src/app/(app)/dashboard.tsx')).toBeOnTheScreen();
    expect(screen.getByText('Route: /dashboard')).toBeOnTheScreen();
  });

  test('switches to the watchlist tab', async () => {
    await render(<DashboardScreen />);

    fireEvent.press(await screen.findByText('Watchlist'));

    expect(screen.queryByText('ETH - sepolia')).toBeNull();
    expect(screen.getByText('Microsoft')).toBeOnTheScreen();
  });

  test('opens the profile screen from the user icon', async () => {
    await render(<DashboardScreen />);

    fireEvent.press(await screen.findByLabelText('Profile'));

    expect(router.push).toHaveBeenCalledWith('/profile');
  });
});
