import { useEffect, useState } from 'react';

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

export function useWalletBalances(): WalletBalances {
  const { address, error: walletError, isLoading: walletLoading } = useSolanaWallet();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsd, setTotalUsd] = useState<number | null>(null);
  const [solAmountLabel, setSolAmountLabel] = useState('—');

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

    async function loadBalances(walletAddress: string) {
      setIsLoading(true);
      setError(null);

      try {
        const [lamports, usdc, solUsd] = await Promise.all([
          getSolanaBalanceLamports(walletAddress),
          getSplTokenBalance(walletAddress, SolanaUsdcMint).catch(() => ({
            decimals: SolanaUsdcDecimals,
            raw: 0n,
          })),
          fetchSolUsdPrice().catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        const solAmount = formatTokenAmount(BigInt(lamports), 9);
        const usdcAmount = formatTokenAmount(usdc.raw, usdc.decimals);
        const solUsdValue = solUsd == null ? null : (lamports / LamportsPerSol) * solUsd;
        const usdcUsdValue = Number(usdcAmount);

        setAssets([
          {
            id: 'sol',
            icon: 'sol',
            name: 'SOL',
            symbol: 'SOL',
            amountLabel: `${formatAmount(solAmount, 6)} SOL`,
            usdValue: solUsdValue,
            usdLabel: solUsdValue == null ? '—' : formatUsd(solUsdValue),
          },
          {
            id: 'usdc',
            icon: 'usdc',
            name: 'USD Coin',
            symbol: 'USDC',
            amountLabel: `${formatAmount(usdcAmount, 2)} USDC`,
            usdValue: usdcUsdValue,
            usdLabel: formatUsd(usdcUsdValue),
          },
        ]);
        setTotalUsd(solUsdValue == null ? null : solUsdValue + usdcUsdValue);
        setSolAmountLabel(`${formatAmount(solAmount, 6)} SOL`);
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

    void loadBalances(address);

    return () => {
      cancelled = true;
    };
  }, [address, walletError, walletLoading]);

  return {
    assets,
    error,
    isLoading,
    totalUsd,
    totalUsdLabel: totalUsd == null ? solAmountLabel : formatUsd(totalUsd),
  };
}
