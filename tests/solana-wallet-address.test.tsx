import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import * as Clipboard from 'expo-clipboard';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { SolanaWalletAddress, truncateSolanaAddress } from '@/components/solana-wallet-address';

jest.mock('@privy-io/expo', () => ({
  usePrivy: jest.fn(),
  useEmbeddedSolanaWallet: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

const mockUsePrivy = usePrivy as jest.MockedFunction<typeof usePrivy>;
const mockUseEmbeddedSolanaWallet = useEmbeddedSolanaWallet as jest.MockedFunction<
  typeof useEmbeddedSolanaWallet
>;
const mockSetStringAsync = Clipboard.setStringAsync as jest.MockedFunction<typeof Clipboard.setStringAsync>;

const EXISTING_ADDRESS = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';

describe('SolanaWalletAddress', () => {
  const create = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    create.mockResolvedValue({ user: { id: 'did:privy:user' } });
    mockSetStringAsync.mockResolvedValue(true);
  });

  test('shows a returning user wallet address without creating another wallet', async () => {
    mockUsePrivy.mockReturnValue({
      user: { id: 'did:privy:user' },
      isReady: true,
    } as ReturnType<typeof usePrivy>);

    mockUseEmbeddedSolanaWallet.mockReturnValue({
      wallets: [{ address: EXISTING_ADDRESS, chainType: 'solana', walletIndex: 0, getProvider: jest.fn() }],
      create,
    } as unknown as ReturnType<typeof useEmbeddedSolanaWallet>);

    await render(<SolanaWalletAddress />);

    expect(await screen.findByText(truncateSolanaAddress(EXISTING_ADDRESS))).toBeOnTheScreen();
    expect(create).not.toHaveBeenCalled();
  });

  test('copies the full wallet address when the chip is pressed', async () => {
    mockUsePrivy.mockReturnValue({
      user: { id: 'did:privy:user' },
      isReady: true,
    } as ReturnType<typeof usePrivy>);

    mockUseEmbeddedSolanaWallet.mockReturnValue({
      wallets: [{ address: EXISTING_ADDRESS, chainType: 'solana', walletIndex: 0, getProvider: jest.fn() }],
      create,
    } as unknown as ReturnType<typeof useEmbeddedSolanaWallet>);

    await render(<SolanaWalletAddress />);

    fireEvent.press(await screen.findByLabelText(`Wallet address ${EXISTING_ADDRESS}`));

    await waitFor(() => {
      expect(mockSetStringAsync).toHaveBeenCalledWith(EXISTING_ADDRESS);
    });
  });

  test('creates an embedded Solana wallet for a first-time user', async () => {
    mockUsePrivy.mockReturnValue({
      user: { id: 'did:privy:new-user' },
      isReady: true,
    } as ReturnType<typeof usePrivy>);

    mockUseEmbeddedSolanaWallet.mockReturnValue({
      wallets: [],
      create,
    } as unknown as ReturnType<typeof useEmbeddedSolanaWallet>);

    await render(<SolanaWalletAddress />);

    expect(await screen.findByText('Preparing wallet…')).toBeOnTheScreen();
    await waitFor(() => {
      expect(create).toHaveBeenCalledTimes(1);
    });
  });
});
