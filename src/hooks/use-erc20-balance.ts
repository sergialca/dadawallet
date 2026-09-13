import { useCallback, useEffect, useState } from 'react';
import { createPublicClient, erc20Abi, formatUnits, getAddress, http, zeroAddress, type Address } from 'viem';
import { mainnet } from 'viem/chains';

import { WalletChain } from '@/constants/tokens';
import { useEvmWallet } from '@/hooks/use-evm-wallet';

const sepoliaClient = createPublicClient({
  chain: WalletChain,
  transport: http(),
});

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function useErc20Balance(token: Address | undefined, decimals: number) {
  const { address, isLoading: walletLoading } = useEvmWallet();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!address || !token || token === zeroAddress) {
      setBalance(0);
      setIsLoading(walletLoading);
      return;
    }

    setIsLoading(true);

    try {
      const owner = getAddress(address);
      const tokenAddress = getAddress(token);
      try {
        const raw = await sepoliaClient.readContract({
          abi: erc20Abi,
          address: tokenAddress,
          args: [owner],
          functionName: 'balanceOf',
        });
        setBalance(Number(formatUnits(raw, decimals)));
      } catch {
        const raw = await mainnetClient.readContract({
          abi: erc20Abi,
          address: tokenAddress,
          args: [owner],
          functionName: 'balanceOf',
        });
        setBalance(Number(formatUnits(raw, decimals)));
      }
    } catch {
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [address, decimals, token, walletLoading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { balance, isLoading, refresh };
}
