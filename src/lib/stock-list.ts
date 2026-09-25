import type { StockAsset, StockKind } from '@/types/stocks';

export type StockListFilter = 'all' | 'favorites' | StockKind;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export type StockSection = {
  title: string;
  data: StockAsset[];
};

export function filterStocks(stocks: StockAsset[], query: string): StockAsset[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return stocks;
  }

  return stocks.filter((stock) => {
    return (
      stock.name.toLowerCase().includes(needle) ||
      stock.ticker.toLowerCase().includes(needle) ||
      stock.tokenSymbol.toLowerCase().includes(needle)
    );
  });
}

export function filterStocksByKind(
  stocks: StockAsset[],
  filter: Exclude<StockListFilter, 'favorites'>,
): StockAsset[] {
  if (filter === 'all') {
    return stocks;
  }

  return stocks.filter((stock) => stock.kind === filter);
}

export function filterStocksByTickers(stocks: StockAsset[], tickers: string[]): StockAsset[] {
  const saved = new Set(tickers);
  return stocks.filter((stock) => saved.has(stock.ticker));
}

function sectionTitleForName(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

export function groupStocksByNameLetter(stocks: StockAsset[]): StockSection[] {
  const sorted = [...stocks].sort((a, b) => a.name.localeCompare(b.name));
  const buckets = new Map<string, StockAsset[]>();

  for (const stock of sorted) {
    const title = sectionTitleForName(stock.name);
    const bucket = buckets.get(title) ?? [];
    bucket.push(stock);
    buckets.set(title, bucket);
  }

  const titles = ALPHABET.filter((letter) => buckets.has(letter));
  if (buckets.has('#')) {
    titles.push('#');
  }

  return titles.map((title) => ({
    title,
    data: buckets.get(title) ?? [],
  }));
}
