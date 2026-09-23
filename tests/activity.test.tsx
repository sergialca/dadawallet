import { render, screen } from '@testing-library/react-native';
import { usePathname } from 'expo-router';

import ActivityScreen from '@/app/(app)/activity';
import { useWalletActivity } from '@/hooks/use-wallet-activity';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'dark',
}));

jest.mock('@/hooks/use-wallet-activity', () => ({
  useWalletActivity: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseWalletActivity = useWalletActivity as jest.MockedFunction<typeof useWalletActivity>;

describe('ActivityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/activity');
  });

  test('lists wallet transfers from Solana RPC', async () => {
    mockUseWalletActivity.mockReturnValue({
      error: null,
      isLoading: false,
      transfers: [
        {
          id: 'sig:transfer',
          asset: 'SOL',
          value: '0.5',
          from: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
          to: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          hash: '5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF',
        },
      ],
    });

    await render(<ActivityScreen />);

    expect(screen.getAllByText('Activity').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('SOL')).toBeOnTheScreen();
    expect(screen.getByText('0.5')).toBeOnTheScreen();
    expect(screen.getByText('From')).toBeOnTheScreen();
    expect(screen.getByText('To')).toBeOnTheScreen();
    expect(screen.getByText('Hash')).toBeOnTheScreen();
    expect(screen.getByText('7EcD…FLtV')).toBeOnTheScreen();
    expect(screen.getByText('EPjF…Dt1v')).toBeOnTheScreen();
    expect(screen.getByText('5Kb8…B9KF')).toBeOnTheScreen();
    expect(screen.getByText('Screen: src/app/(app)/activity.tsx')).toBeOnTheScreen();
    expect(screen.getByText('Route: /activity')).toBeOnTheScreen();
  });

  test('shows an empty state when the wallet has no transfers', async () => {
    mockUseWalletActivity.mockReturnValue({
      error: null,
      isLoading: false,
      transfers: [],
    });

    await render(<ActivityScreen />);

    expect(screen.getByText('No transactions yet.')).toBeOnTheScreen();
  });
});
