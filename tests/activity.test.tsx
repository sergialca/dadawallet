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
          id: '0xaaa:external',
          asset: 'ETH',
          value: '0.5',
          from: '0xef4396d9ff8107086d215a1c9f8866c54795d7c7',
          to: '0x5c43b1ed97e52d009611d89b74fa829fe4ac56b1',
          hash: '0x3847245c01829b043431067fb2bfa95f7b5bdc7e4246c843e7a573ab6f26f5ff',
        },
      ],
    });

    await render(<ActivityScreen />);

    expect(screen.getAllByText('Activity').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('ETH')).toBeOnTheScreen();
    expect(screen.getByText('0.5')).toBeOnTheScreen();
    expect(screen.getByText('From')).toBeOnTheScreen();
    expect(screen.getByText('To')).toBeOnTheScreen();
    expect(screen.getByText('Hash')).toBeOnTheScreen();
    expect(screen.getByText('0xef43…d7c7')).toBeOnTheScreen();
    expect(screen.getByText('0x5c43…56b1')).toBeOnTheScreen();
    expect(screen.getByText('0x3847…f5ff')).toBeOnTheScreen();
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
