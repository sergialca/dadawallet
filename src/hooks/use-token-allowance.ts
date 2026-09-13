import { useCallback, useEffect, useState } from 'react';
import { createPublicClient, erc20Abi, getAddress, http, type Address } from 'viem';

import { WalletChain } from '@/constants/tokens';
import { useEvmWallet } from '@/hooks/use-evm-wallet';

const publicClient = createPublicClient({
  chain: WalletChain,
  transport: http(),
});

export function useTokenAllowance(token: Address, spender: Address) {
  const { address } = useEvmWallet();
  const [allowance, setAllowance] = useState(0n);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!address) {
      setAllowance(0n);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const value = await publicClient.readContract({
        abi: erc20Abi,
        address: token,
        args: [getAddress(address), spender],
        functionName: 'allowance',
      });
      setAllowance(value);
    } catch {
      setAllowance(0n);
    } finally {
      setIsLoading(false);
    }
  }, [address, spender, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { allowance, isLoading, refresh };
}
