import { useEffect, useRef, useState } from 'react';
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';

export function useSolanaWallet() {
  const { user, isReady } = usePrivy();
  const { wallets, create } = useEmbeddedSolanaWallet();
  const [error, setError] = useState<Error | null>(null);
  const createAttemptedForUser = useRef<string | null>(null);

  const wallet = wallets?.[0] ?? null;
  const address = wallet?.address ?? null;
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!isReady || !userId || address) {
      return;
    }

    if (createAttemptedForUser.current === userId) {
      return;
    }

    createAttemptedForUser.current = userId;
    setError(null);

    void create().catch((caught: unknown) => {
      setError(caught instanceof Error ? caught : new Error('Could not create a Solana wallet.'));
    });
  }, [address, create, isReady, userId]);

  return {
    address,
    error: address ? null : error,
    isLoading: !isReady || (!!userId && !address && !error),
    wallet,
  };
}
