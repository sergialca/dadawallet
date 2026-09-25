import { useEffect, useState } from 'react';

import {
  DefaultSlippagePercent,
  OndoApiBaseUrl,
  OndoChainId,
  QuoteDuration,
  type OndoAttestation,
  type OndoQuoteSide,
  type OndoSoftQuote,
} from '@/constants/ondo';

type TradeQuote = {
  estimatedShares: number;
  feeUsdc: number;
  midPrice: number | null;
  minShares: number;
  quotePrice: number | null;
  slippagePercent: number;
};

const FALLBACK_SPREAD = 0.001;

function ondoHeaders() {
  const apiKey = process.env.EXPO_PUBLIC_ONDO_API_KEY;
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
  };
}

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? `Ondo request failed (${response.status})`);
  }
  return payload;
}

const OndoQuoteDecimals = 18;

function toNumber(value: string | undefined) {
  if (!value) {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function fromOndoUint18(value: string | undefined) {
  if (!value) {
    return null;
  }

  if (value.includes('.') || value.includes('e') || value.includes('E')) {
    return toNumber(value);
  }

  try {
    const raw = BigInt(value);
    const negative = raw < 0n;
    const absolute = (negative ? -raw : raw).toString().padStart(OndoQuoteDecimals + 1, '0');
    const whole = absolute.slice(0, -OndoQuoteDecimals);
    const fraction = absolute.slice(-OndoQuoteDecimals).replace(/0+$/, '');
    const numeric = Number(`${whole}.${fraction || '0'}`);
    if (!Number.isFinite(numeric)) {
      return null;
    }
    return negative ? -numeric : numeric;
  } catch {
    return null;
  }
}

export async function fetchOndoPrice(symbol: string) {
  try {
    const latest = await fetchJson<{
      primaryMarket?: { price?: string };
      underlyingMarket?: { price?: string };
    }>(`${OndoApiBaseUrl}/assets/${symbol}/prices/latest`, { headers: ondoHeaders() });
    return (
      toNumber(latest.primaryMarket?.price) ?? toNumber(latest.underlyingMarket?.price)
    );
  } catch {
    const quickstart = await fetchJson<{
      primaryMarket?: { price?: string };
      price?: string;
    }>(`${OndoApiBaseUrl}/assets/prices/${symbol}`, { headers: ondoHeaders() });
    return toNumber(quickstart.primaryMarket?.price) ?? toNumber(quickstart.price);
  }
}

export async function fetchOndoSoftQuote(input: {
  notionalValue: string;
  side: OndoQuoteSide;
  symbol: string;
}) {
  return fetchJson<OndoSoftQuote>(`${OndoApiBaseUrl}/attestations/soft`, {
    body: JSON.stringify({
      chainId: OndoChainId,
      duration: QuoteDuration,
      notionalValue: input.notionalValue,
      side: input.side,
      symbol: input.symbol,
    }),
    headers: ondoHeaders(),
    method: 'POST',
  });
}

export async function fetchOndoAttestation(input: {
  notionalValue: string;
  side: OndoQuoteSide;
  symbol: string;
}) {
  return fetchJson<OndoAttestation>(`${OndoApiBaseUrl}/attestations`, {
    body: JSON.stringify({
      chainId: OndoChainId,
      duration: QuoteDuration,
      notionalValue: input.notionalValue,
      side: input.side,
      symbol: input.symbol,
    }),
    headers: ondoHeaders(),
    method: 'POST',
  });
}

async function fetchUnderlyingPrice(ticker: string) {
  const yahoo = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
    { headers: { Accept: 'application/json' } },
  ).then(async (response) => {
    if (!response.ok) {
      throw new Error('Yahoo price request failed');
    }
    return response.json() as Promise<{
      chart?: { result?: { meta?: { regularMarketPrice?: number } }[] };
    }>;
  });
  const yahooPrice = yahoo.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (typeof yahooPrice === 'number' && Number.isFinite(yahooPrice)) {
    return yahooPrice;
  }
  throw new Error('Yahoo price missing');
}

const DexscreenerTokensUrl = 'https://api.dexscreener.com/latest/dex/tokens';

type DexscreenerPair = {
  baseToken?: { address?: string };
  chainId?: string;
  liquidity?: { usd?: number };
  priceUsd?: string;
  quoteToken?: { symbol?: string };
};

export async function fetchDexscreenerPrice(mint: string) {
  const response = await fetch(`${DexscreenerTokensUrl}/${encodeURIComponent(mint)}`);
  if (!response.ok) {
    throw new Error('Dexscreener price request failed');
  }

  const payload = (await response.json()) as { pairs?: DexscreenerPair[] | null };
  const best = (payload.pairs ?? [])
    .filter((pair) => {
      const price = Number(pair.priceUsd);
      return (
        pair.chainId === 'solana' &&
        pair.baseToken?.address === mint &&
        pair.quoteToken?.symbol === 'USDC' &&
        Number.isFinite(price) &&
        price > 0
      );
    })
    .sort((left, right) => (right.liquidity?.usd ?? 0) - (left.liquidity?.usd ?? 0))[0];

  const price = Number(best?.priceUsd);
  return Number.isFinite(price) && price > 0 ? price : null;
}

async function fetchDisplayPrice(symbol: string, ticker: string, mint: string) {
  if (mint) {
    const poolPrice = await fetchDexscreenerPrice(mint).catch(() => null);
    if (poolPrice) {
      return poolPrice;
    }
  }

  if (symbol) {
    const ondoPrice = await fetchOndoPrice(symbol).catch(() => null);
    if (ondoPrice && ondoPrice > 0) {
      return ondoPrice;
    }
  }

  if (!ticker) {
    return null;
  }

  try {
    return await fetchUnderlyingPrice(ticker);
  } catch {
    const finnhub = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=demo`,
    ).then(async (response) => {
      if (!response.ok) {
        return null;
      }
      return response.json() as Promise<{ c?: number }>;
    });
    return typeof finnhub?.c === 'number' && finnhub.c > 0 ? finnhub.c : null;
  }
}

export function useTradeQuote(input: {
  mint?: string;
  notionalUsdc: number;
  side: OndoQuoteSide;
  symbol: string;
  ticker: string;
}) {
  const [quote, setQuote] = useState<TradeQuote>({
    estimatedShares: 0,
    feeUsdc: 0,
    midPrice: null,
    minShares: 0,
    quotePrice: null,
    slippagePercent: DefaultSlippagePercent,
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const mint = input.mint ?? '';
    if (!input.symbol && !input.ticker && !mint) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      try {
        const midPrice = await fetchDisplayPrice(input.symbol, input.ticker, mint);
        if (!cancelled && midPrice) {
          setQuote((current) => ({
            ...current,
            midPrice,
            quotePrice: current.quotePrice ?? midPrice,
          }));
        }
      } catch {
        if (!cancelled) {
          setError(new Error('Could not load the current price.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [input.mint, input.symbol, input.ticker]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        setError(null);

        try {
          const midPrice =
            (await fetchDisplayPrice(input.symbol, input.ticker, input.mint ?? '').catch(() => null)) ??
            null;
          if (cancelled) {
            return;
          }

          if (input.notionalUsdc <= 0) {
            setQuote({
              estimatedShares: 0,
              feeUsdc: 0,
              midPrice,
              minShares: 0,
              quotePrice: midPrice,
              slippagePercent: DefaultSlippagePercent,
            });
            return;
          }

          let quotePrice = midPrice;
          let estimatedShares = 0;
          let quoted = false;

          if (input.symbol) {
            try {
              const softQuote = await fetchOndoSoftQuote({
                notionalValue: input.notionalUsdc.toString(),
                side: input.side,
                symbol: input.symbol,
              });
              const nextPrice = fromOndoUint18(softQuote.price);
              const nextShares = fromOndoUint18(softQuote.tokenAmount);
              if (nextPrice && nextPrice > 0 && nextShares != null) {
                quotePrice = nextPrice;
                estimatedShares = nextShares;
                quoted = true;
              }
            } catch {
              quoted = false;
            }
          }

          if (!quoted && quotePrice && quotePrice > 0) {
            const signedSpread = input.side === 'buy' ? 1 + FALLBACK_SPREAD : 1 - FALLBACK_SPREAD;
            quotePrice *= signedSpread;
            estimatedShares = input.notionalUsdc / quotePrice;
          }

          const feeUsdc =
            midPrice && quotePrice
              ? Math.abs(quotePrice - midPrice) * estimatedShares
              : input.notionalUsdc * FALLBACK_SPREAD;
          const minShares = estimatedShares * (1 - DefaultSlippagePercent / 100);

          if (!cancelled) {
            setQuote({
              estimatedShares,
              feeUsdc,
              midPrice,
              minShares,
              quotePrice,
              slippagePercent: DefaultSlippagePercent,
            });
          }
        } catch (caught) {
          if (!cancelled) {
            setError(caught instanceof Error ? caught : new Error('Could not load a quote.'));
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      })();
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input.mint, input.notionalUsdc, input.side, input.symbol, input.ticker]);

  return { error, isLoading, quote };
}
