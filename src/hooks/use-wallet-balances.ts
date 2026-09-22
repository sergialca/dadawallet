import { useCallback, useEffect, useState } from 'react';

import { getStockByMint, isCatalogSolanaMint } from '@/constants/stocks';
import { SolanaStablecoins, isSolanaCashMint } from '@/constants/tokens';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { formatAmount } from '@/lib/format-amount';
import {
  getSolanaBalanceLamports,
  getSplTokenAccounts,
  LamportsPerSol,
  type SplTokenAccountBalance,
} from '@/lib/solana-rpc';

export type WalletAsset = {
  amountLabel: string;
  icon: 'sol' | 'usdc' | 'eurc' | 'token';
  id: string;
  logoUrl?: string;
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

function isAllowedWalletMint(mint: string) {
  return isSolanaCashMint(mint) || isCatalogSolanaMint(mint);
}

function tokenToAsset(token: SplTokenAccountBalance): WalletAsset | null {
  const amount = formatTokenAmount(token.raw, token.decimals);
  const stablecoin = SolanaStablecoins.find((item) => item.mint === token.mint);

  if (stablecoin) {
    const usdValue = stablecoin.symbol === 'USDC' ? Number(amount) : null;
    return {
      id: stablecoin.id,
      icon: stablecoin.icon,
      name: stablecoin.name,
      symbol: stablecoin.symbol,
      amountLabel: `${formatAmount(amount, 2)} ${stablecoin.symbol}`,
      usdValue,
      usdLabel: usdValue == null ? '—' : formatUsd(usdValue),
    };
  }

  const stock = getStockByMint(token.mint);
  if (!stock || !isCatalogSolanaMint(token.mint)) {
    return null;
  }

  return {
    id: stock.id,
    icon: 'token',
    logoUrl: stock.logoUrl,
    name: stock.name,
    symbol: stock.ticker,
    amountLabel: `${formatAmount(amount, 4)} ${stock.tokenSymbol}`,
    usdValue: null,
    usdLabel: '—',
  };
}

async function fetchWalletAssets(walletAddress: string) {
  const [lamports, tokenAccounts, solUsd] = await Promise.all([
    getSolanaBalanceLamports(walletAddress),
    getSplTokenAccounts(walletAddress),
    fetchSolUsdPrice().catch(() => null),
  ]);

  const solAmount = formatTokenAmount(BigInt(lamports), 9);
  const solUsdValue = solUsd == null ? null : (lamports / LamportsPerSol) * solUsd;

  const cashAssets = SolanaStablecoins.map((stablecoin) => {
    const held = tokenAccounts.find((token) => token.mint === stablecoin.mint);
    return tokenToAsset({
      decimals: held?.decimals ?? stablecoin.decimals,
      mint: stablecoin.mint,
      raw: held?.raw ?? 0n,
    });
  }).filter((asset): asset is WalletAsset => asset != null);

  const stockAssets = tokenAccounts
    .filter((token) => isAllowedWalletMint(token.mint) && !isSolanaCashMint(token.mint) && token.raw > 0n)
    .map(tokenToAsset)
    .filter((asset): asset is WalletAsset => asset != null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const assets: WalletAsset[] = [
    {
      id: 'sol',
      icon: 'sol',
      name: 'SOL',
      symbol: 'SOL',
      amountLabel: `${formatAmount(solAmount, 6)} SOL`,
      usdValue: solUsdValue,
      usdLabel: solUsdValue == null ? '—' : formatUsd(solUsdValue),
    },
    ...cashAssets,
    ...stockAssets,
  ];

  const knownUsd = assets.reduce((sum, asset) => sum + (asset.usdValue ?? 0), 0);

  return {
    assets,
    solAmountLabel: `${formatAmount(solAmount, 6)} SOL`,
    totalUsd: solUsdValue == null ? null : knownUsd,
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
