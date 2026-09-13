import { useEffect, useState } from 'react';
import { getAddress } from 'viem';

import { useEvmWallet } from '@/hooks/use-evm-wallet';
import { fetchWalletTransfers, type WalletTransfer } from '@/lib/alchemy-transfers';

export type WalletActivity = {
  error: Error | null;
  isLoading: boolean;
  transfers: WalletTransfer[];
};

export function useWalletActivity(): WalletActivity {
  const { address, error: walletError, isLoading: walletLoading } = useEvmWallet();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transfers, setTransfers] = useState<WalletTransfer[]>([]);

  useEffect(() => {
    if (walletLoading) {
      setIsLoading(true);
      return;
    }

    if (!address) {
      setTransfers([]);
      setError(walletError);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTransfers(rawAddress: string) {
      setIsLoading(true);
      setError(null);

      try {
        const nextTransfers = await fetchWalletTransfers(getAddress(rawAddress));
        if (!cancelled) {
          setTransfers(nextTransfers);
        }
      } catch (caught) {
        if (!cancelled) {
          setTransfers([]);
          setError(caught instanceof Error ? caught : new Error('Could not load activity.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTransfers(address);

    return () => {
      cancelled = true;
    };
  }, [address, walletError, walletLoading]);

  return {
    error,
    isLoading,
    transfers,
  };
}
