import { useCallback, useEffect, useState } from 'react';
import { createPublicClient, erc20Abi, formatUnits, getAddress, http } from 'viem';

import { SepoliaUsdcAddress, WalletChain } from '@/constants/tokens';
import { useEvmWallet } from '@/hooks/use-evm-wallet';

const publicClient = createPublicClient({
  chain: WalletChain,
  transport: http(),
});

export function useUsdcBalance() {
  const { address, error: walletError, isLoading: walletLoading } = useEvmWallet();
  const [balance, setBalance] = useState(0);
  const [rawBalance, setRawBalance] = useState(0n);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!address) {
      setBalance(0);
      setRawBalance(0n);
      setError(walletError);
      setIsLoading(walletLoading);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletAddress = getAddress(address);
      const raw = await publicClient.readContract({
        abi: erc20Abi,
        address: SepoliaUsdcAddress,
        args: [walletAddress],
        functionName: 'balanceOf',
      });
      setRawBalance(raw);
      setBalance(Number(formatUnits(raw, 6)));
    } catch (caught) {
      setBalance(0);
      setRawBalance(0n);
      setError(caught instanceof Error ? caught : new Error('Could not load USDC balance.'));
    } finally {
      setIsLoading(false);
    }
  }, [address, walletError, walletLoading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { balance, error, isLoading, rawBalance, refresh };
}
