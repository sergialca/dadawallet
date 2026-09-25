import { usePrivy } from '@privy-io/expo';
import * as Clipboard from 'expo-clipboard';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';

import ProfileScreen from '@/app/(app)/profile';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@privy-io/expo', () => ({
  usePrivy: jest.fn(),
  useEmbeddedSolanaWallet: jest.fn(),
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

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePrivy = usePrivy as jest.MockedFunction<typeof usePrivy>;
const mockSetStringAsync = Clipboard.setStringAsync as jest.MockedFunction<typeof Clipboard.setStringAsync>;

const FULL_ADDRESS = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';

describe('ProfileScreen', () => {
  const logout = jest.fn();
  const router = {
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/profile');
    mockUseRouter.mockReturnValue(router as unknown as ReturnType<typeof useRouter>);
    mockSetStringAsync.mockResolvedValue(true);
    mockUsePrivy.mockReturnValue({
      logout,
      user: {
        id: 'did:privy:user',
        created_at: 0,
        has_accepted_terms: true,
        is_guest: false,
        linked_accounts: [{ type: 'email', address: 'trader@example.com' }],
        mfa_methods: [],
      },
    } as unknown as ReturnType<typeof usePrivy>);
  });

  test('shows email, the full wallet address, and log out', async () => {
    await render(<ProfileScreen />);

    expect(await screen.findByText('Profile')).toBeOnTheScreen();
    expect(screen.getByText('trader@example.com')).toBeOnTheScreen();
    expect(screen.getByText(FULL_ADDRESS)).toBeOnTheScreen();
    expect(screen.getByLabelText('Log out')).toBeOnTheScreen();
    expect(screen.getByText('Screen: src/app/(app)/profile.tsx')).toBeOnTheScreen();
    expect(screen.getByText('Route: /profile')).toBeOnTheScreen();
  });

  test('copies the full wallet address', async () => {
    await render(<ProfileScreen />);

    fireEvent.press(await screen.findByLabelText(`Wallet address ${FULL_ADDRESS}`));

    await waitFor(() => {
      expect(mockSetStringAsync).toHaveBeenCalledWith(FULL_ADDRESS);
    });
  });

  test('logs out from the profile screen', async () => {
    await render(<ProfileScreen />);

    fireEvent.press(await screen.findByLabelText('Log out'));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
