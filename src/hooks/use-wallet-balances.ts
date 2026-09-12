import { useEffect, useState } from 'react';
import { createPublicClient, erc20Abi, formatEther, formatUnits, getAddress, http } from 'viem';

import { SepoliaUsdcAddress, WalletChain } from '@/constants/tokens';
import { useEvmWallet } from '@/hooks/use-evm-wallet';

const publicClient = createPublicClient({
  chain: WalletChain,
  transport: http(),
});

export type WalletAsset = {
  amountLabel: string;
  icon: 'eth' | 'usdc';
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

function formatAmount(value: string, maxFractionDigits: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }

  const [whole, fraction = ''] = numeric.toFixed(maxFractionDigits).split('.');
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const trimmedFraction = fraction.replace(/0+$/, '');

  return trimmedFraction.length > 0 ? `${groupedWhole}.${trimmedFraction}` : groupedWhole;
}

async function fetchEthUsdPrice() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { ethereum?: { usd?: number } };
  return typeof payload.ethereum?.usd === 'number' ? payload.ethereum.usd : null;
}

export function useWalletBalances(): WalletBalances {
  const { address, error: walletError, isLoading: walletLoading } = useEvmWallet();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsd, setTotalUsd] = useState<number | null>(null);
  const [ethAmountLabel, setEthAmountLabel] = useState('—');

  useEffect(() => {
    if (walletLoading) {
      setIsLoading(true);
      return;
    }

    if (!address) {
      setAssets([]);
      setTotalUsd(null);
      setEthAmountLabel('—');
      setError(walletError);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBalances(rawAddress: string) {
      setIsLoading(true);
      setError(null);

      try {
        const walletAddress = getAddress(rawAddress);
        const [ethWei, usdcRaw, ethUsd] = await Promise.all([
          publicClient.getBalance({ address: walletAddress }),
          publicClient
            .readContract({
              abi: erc20Abi,
              address: SepoliaUsdcAddress,
              args: [walletAddress],
              functionName: 'balanceOf',
            })
            .catch(() => 0n),
          fetchEthUsdPrice().catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        const ethAmount = formatEther(ethWei);
        const usdcAmount = formatUnits(usdcRaw, 6);
        const ethUsdValue = ethUsd == null ? null : Number(ethAmount) * ethUsd;
        const usdcUsdValue = Number(usdcAmount);

        setAssets([
          {
            id: 'eth',
            icon: 'eth',
            name: 'ETH - sepolia',
            symbol: 'ETH',
            amountLabel: `${formatAmount(ethAmount, 6)} ETH`,
            usdValue: ethUsdValue,
            usdLabel: ethUsdValue == null ? '—' : formatUsd(ethUsdValue),
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
        setTotalUsd(ethUsdValue == null ? null : ethUsdValue + usdcUsdValue);
        setEthAmountLabel(`${formatAmount(ethAmount, 6)} ETH`);
      } catch (caught) {
        if (!cancelled) {
          setAssets([]);
          setTotalUsd(null);
          setEthAmountLabel('—');
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
    totalUsdLabel: totalUsd == null ? ethAmountLabel : formatUsd(totalUsd),
  };
}
