import { useEmbeddedEthereumWallet, usePrivy } from '@privy-io/expo';
import { render, screen, waitFor } from '@testing-library/react-native';

import { EvmWalletAddress } from '@/components/evm-wallet-address';

jest.mock('@privy-io/expo', () => ({
  usePrivy: jest.fn(),
  useEmbeddedEthereumWallet: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

const mockUsePrivy = usePrivy as jest.MockedFunction<typeof usePrivy>;
const mockUseEmbeddedEthereumWallet = useEmbeddedEthereumWallet as jest.MockedFunction<
  typeof useEmbeddedEthereumWallet
>;

const EXISTING_ADDRESS = '0x1111111111111111111111111111111111111111';

describe('EvmWalletAddress', () => {
  const create = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    create.mockResolvedValue({ user: { id: 'did:privy:user' } });
  });

  test('shows a returning user wallet address without creating another wallet', async () => {
    mockUsePrivy.mockReturnValue({
      user: { id: 'did:privy:user' },
      isReady: true,
    } as ReturnType<typeof usePrivy>);

    mockUseEmbeddedEthereumWallet.mockReturnValue({
      wallets: [{ address: EXISTING_ADDRESS, chainType: 'ethereum', walletIndex: 0, getProvider: jest.fn() }],
      create,
    } as unknown as ReturnType<typeof useEmbeddedEthereumWallet>);

    await render(<EvmWalletAddress />);

    expect(await screen.findByText(EXISTING_ADDRESS)).toBeOnTheScreen();
    expect(create).not.toHaveBeenCalled();
  });

  test('creates an embedded EVM wallet for a first-time user', async () => {
    mockUsePrivy.mockReturnValue({
      user: { id: 'did:privy:new-user' },
      isReady: true,
    } as ReturnType<typeof usePrivy>);

    mockUseEmbeddedEthereumWallet.mockReturnValue({
      wallets: [],
      create,
    } as unknown as ReturnType<typeof useEmbeddedEthereumWallet>);

    await render(<EvmWalletAddress />);

    expect(await screen.findByText('Preparing EVM wallet…')).toBeOnTheScreen();
    await waitFor(() => {
      expect(create).toHaveBeenCalledTimes(1);
    });
  });
});
