import { listedStocks } from '@/constants/stocks';
import { filterStocks, filterStocksByKind, groupStocksByNameLetter } from '@/lib/stock-list';
import type { StockAsset } from '@/types/stocks';

function stock(overrides: Partial<StockAsset> & Pick<StockAsset, 'id' | 'name' | 'ticker'>): StockAsset {
  return {
    tokenSymbol: `${overrides.ticker}on`,
    contractAddress: '',
    decimals: 18,
    category: 'Test',
    description: 'Test stock',
    logoUrl: 'https://example.com/logo.png',
    isAvailable: true,
    kind: 'stock',
    ...overrides,
  };
}

describe('filterStocks', () => {
  test('matches name, ticker, and token symbol', () => {
    const apple = listedStocks.find((item) => item.ticker === 'AAPL');
    expect(apple).toBeDefined();
    expect(filterStocks(listedStocks, 'aapl').map((item) => item.ticker)).toEqual(['AAPL']);
    expect(filterStocks(listedStocks, 'alphabet').map((item) => item.ticker)).toEqual(['GOOGL']);
    expect(filterStocks(listedStocks, 'nvdAon').map((item) => item.ticker)).toEqual(['NVDA']);
  });

  test('returns the full list when the query is blank', () => {
    expect(filterStocks(listedStocks, '   ')).toEqual(listedStocks);
  });

  test('marks Tessera names as pre-IPO stock', () => {
    const openai = listedStocks.find((item) => item.id === 'openai-tessera');
    expect(openai?.kind).toBe('pre-IPO stock');
    expect(listedStocks.filter((item) => item.kind === 'stock').every((item) => item.id.endsWith('-ondo'))).toBe(
      true
    );
  });
});

describe('filterStocksByKind', () => {
  test('keeps every asset for all, and splits by kind', () => {
    expect(filterStocksByKind(listedStocks, 'all')).toEqual(listedStocks);
    expect(filterStocksByKind(listedStocks, 'stock').every((item) => item.kind === 'stock')).toBe(true);
    expect(
      filterStocksByKind(listedStocks, 'pre-IPO stock').map((item) => item.ticker)
    ).toEqual(['tOpenAI', 'tKalshi']);
  });
});

describe('groupStocksByNameLetter', () => {
  test('sorts by company name and groups by first letter', () => {
    const sections = groupStocksByNameLetter(listedStocks);
    expect(sections.map((section) => section.title)).toEqual([
      'A',
      'C',
      'I',
      'K',
      'M',
      'N',
      'O',
      'R',
      'S',
      'T',
    ]);
    expect(sections[0]?.data.map((item) => item.ticker)).toEqual(['GOOGL', 'AMZN', 'AAPL', 'AUR']);
    expect(sections[1]?.data.map((item) => item.ticker)).toEqual(['COIN']);
    expect(sections[4]?.data.map((item) => item.ticker)).toEqual(['META', 'MSFT', 'MSTR']);
  });

  test('puts non-letter names under #', () => {
    const sections = groupStocksByNameLetter([
      stock({ id: '1', name: '3M Company', ticker: 'MMM' }),
      stock({ id: '2', name: 'Apple Inc.', ticker: 'AAPL' }),
    ]);
    expect(sections.map((section) => section.title)).toEqual(['A', '#']);
    expect(sections[1]?.data[0]?.ticker).toBe('MMM');
  });
});
