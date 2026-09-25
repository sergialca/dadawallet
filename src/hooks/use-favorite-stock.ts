import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { getSupabase } from '@/lib/supabase';

export function useFavoriteStock(ticker: string) {
  const { address } = useSolanaWallet();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !address || !ticker) {
      setIsFavorite(false);
      return;
    }

    let cancelled = false;
    void supabase
      .from('favorite_stocks')
      .select('ticker')
      .eq('wallet_address', address)
      .eq('ticker', ticker)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (cancelled) {
          return;
        }
        if (queryError) {
          setError(queryError.message);
          return;
        }
        setIsFavorite(data != null);
      });

    return () => {
      cancelled = true;
    };
  }, [address, ticker]);

  const toggle = useCallback(async () => {
    const supabase = getSupabase();
    if (!ticker || isSaving) {
      return;
    }
    if (!address) {
      setError('Wallet is not ready yet.');
      return;
    }
    if (!supabase) {
      setError('Favorites are unavailable.');
      return;
    }

    const next = !isFavorite;
    setIsSaving(true);
    setError(null);
    setIsFavorite(next);

    const result = next
      ? await supabase.from('favorite_stocks').insert({
          ticker,
          wallet_address: address,
        })
      : await supabase.from('favorite_stocks').delete().eq('wallet_address', address).eq('ticker', ticker);

    if (result.error) {
      setIsFavorite(!next);
      setError(result.error.message);
    }
    setIsSaving(false);
  }, [address, isFavorite, isSaving, ticker]);

  return { error, isFavorite, isSaving, toggle };
}

export function useFavoriteTickers() {
  const { address } = useSolanaWallet();
  const [tickers, setTickers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const supabase = getSupabase();
    if (!supabase || !address) {
      setTickers([]);
      return;
    }

    let cancelled = false;
    void supabase
      .from('favorite_stocks')
      .select('ticker')
      .eq('wallet_address', address)
      .then(({ data, error: queryError }) => {
        if (cancelled) {
          return;
        }
        if (queryError) {
          setError(queryError.message);
          setTickers([]);
          return;
        }
        setError(null);
        setTickers((data ?? []).map((row) => row.ticker));
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  useFocusEffect(load);

  return { error, tickers };
}
