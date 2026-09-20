import { useCallback, useEffect, useState } from 'react';

import { SolanaUsdcDecimals, SolanaUsdcMint } from '@/constants/tokens';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { formatAmount } from '@/lib/format-amount';
import { getSolanaBalanceLamports, getSplTokenBalance, LamportsPerSol } from '@/lib/solana-rpc';

export type WalletAsset = {
  amountLabel: string;
  icon: 'sol' | 'usdc';
  id: string;
  name: string;
  symbol: string;
  usdValue: number | null;
  usdLabel: string;
};

export type WalletBalances = {
  assets: WalletAsset[];
  error: Error | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  totalUsd: number | null;
  totalUsdLabel: string;
};

function formatUsd(value: number) {
  return `$${formatAmount(value.toString(), 2)}`;
}

function formatTokenAmount(raw: bigint, decimals: number) {
  const negative = raw < 0n;
  const absolute = negative ? -raw : raw;
  const padded = absolute.toString().padStart(decimals + 1, '0');
  const whole = padded.slice(0, padded.length - decimals);
  const fraction = padded.slice(padded.length - decimals).replace(/0+$/, '');
  const amount = fraction.length > 0 ? `${whole}.${fraction}` : whole;
  return negative ? `-${amount}` : amount;
}

async function fetchSolUsdPrice() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { solana?: { usd?: number } };
  return typeof payload.solana?.usd === 'number' ? payload.solana.usd : null;
}

async function fetchWalletAssets(walletAddress: string) {
  const [lamports, usdc, solUsd] = await Promise.all([
    getSolanaBalanceLamports(walletAddress),
    getSplTokenBalance(walletAddress, SolanaUsdcMint).catch(() => ({
      decimals: SolanaUsdcDecimals,
      raw: 0n,
    })),
    fetchSolUsdPrice().catch(() => null),
  ]);

  const solAmount = formatTokenAmount(BigInt(lamports), 9);
  const usdcAmount = formatTokenAmount(usdc.raw, usdc.decimals);
  const solUsdValue = solUsd == null ? null : (lamports / LamportsPerSol) * solUsd;
  const usdcUsdValue = Number(usdcAmount);

  return {
    assets: [
      {
        id: 'sol' as const,
        icon: 'sol' as const,
        name: 'SOL',
        symbol: 'SOL',
        amountLabel: `${formatAmount(solAmount, 6)} SOL`,
        usdValue: solUsdValue,
        usdLabel: solUsdValue == null ? '—' : formatUsd(solUsdValue),
      },
      {
        id: 'usdc' as const,
        icon: 'usdc' as const,
        name: 'USD Coin',
        symbol: 'USDC',
        amountLabel: `${formatAmount(usdcAmount, 2)} USDC`,
        usdValue: usdcUsdValue,
        usdLabel: formatUsd(usdcUsdValue),
      },
    ],
    solAmountLabel: `${formatAmount(solAmount, 6)} SOL`,
    totalUsd: solUsdValue == null ? null : solUsdValue + usdcUsdValue,
  };
}

export function useWalletBalances(): WalletBalances {
  const { address, error: walletError, isLoading: walletLoading } = useSolanaWallet();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalUsd, setTotalUsd] = useState<number | null>(null);
  const [solAmountLabel, setSolAmountLabel] = useState('—');

  const applyBalances = useCallback((next: Awaited<ReturnType<typeof fetchWalletAssets>>) => {
    setAssets(next.assets);
    setTotalUsd(next.totalUsd);
    setSolAmountLabel(next.solAmountLabel);
  }, []);

  const refresh = useCallback(async () => {
    if (walletLoading) {
      return;
    }

    if (!address) {
      setAssets([]);
      setTotalUsd(null);
      setSolAmountLabel('—');
      setError(walletError);
      setIsLoading(false);
      return;
    }

    setIsRefreshing(true);
    setError(null);
    try {
      applyBalances(await fetchWalletAssets(address));
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Could not load wallet balances.'));
    } finally {
      setIsRefreshing(false);
    }
  }, [address, applyBalances, walletError, walletLoading]);

  useEffect(() => {
    if (walletLoading) {
      setIsLoading(true);
      return;
    }

    if (!address) {
      setAssets([]);
      setTotalUsd(null);
      setSolAmountLabel('—');
      setError(walletError);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadInitial(walletAddress: string) {
      setIsLoading(true);
      setError(null);
      try {
        const next = await fetchWalletAssets(walletAddress);
        if (!cancelled) {
          applyBalances(next);
        }
      } catch (caught) {
        if (!cancelled) {
          setAssets([]);
          setTotalUsd(null);
          setSolAmountLabel('—');
          setError(caught instanceof Error ? caught : new Error('Could not load wallet balances.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitial(address);

    return () => {
      cancelled = true;
    };
  }, [address, applyBalances, walletError, walletLoading]);

  return {
    assets,
    error,
    isLoading,
    isRefreshing,
    refresh,
    totalUsd,
    totalUsdLabel: totalUsd == null ? solAmountLabel : formatUsd(totalUsd),
  };
}
