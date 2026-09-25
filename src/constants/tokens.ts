

export const SolanaNetworkLabel = 'Solana Devnet';
export const SolanaUsdcMint = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
export const SolanaUsdcDecimals = 6;
export const SolanaEurcMint = 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr';
export const SolanaEurcDecimals = 6;

export const SolanaStablecoins = [
  {
    decimals: SolanaUsdcDecimals,
    icon: 'usdc' as const,
    id: 'usdc',
    mint: SolanaUsdcMint,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  {
    decimals: SolanaEurcDecimals,
    icon: 'eurc' as const,
    id: 'eurc',
    mint: SolanaEurcMint,
    name: 'Euro Coin',
    symbol: 'EURC',
  },
] as const;

export function isSolanaCashMint(mint: string) {
  return SolanaStablecoins.some((token) => token.mint === mint);
}
