import { listedStocks } from '@/constants/stocks';
import { filterStocks, groupStocksByNameLetter } from '@/lib/stock-list';
import type { StockAsset } from '@/types/stocks';

function stock(overrides: Partial<StockAsset> & Pick<StockAsset, 'id' | 'name' | 'ticker'>): StockAsset {
  return {
    tokenSymbol: `${overrides.ticker}on`,
    contractAddress: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    category: 'Test',
    description: 'Test stock',
    logoUrl: 'https://example.com/logo.png',
    isAvailable: true,
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
});

describe('groupStocksByNameLetter', () => {
  test('sorts by company name and groups by first letter', () => {
    const sections = groupStocksByNameLetter(listedStocks);
    expect(sections.map((section) => section.title)).toEqual(['A', 'M', 'N', 'T']);
    expect(sections[0]?.data.map((item) => item.ticker)).toEqual(['GOOGL', 'AMZN', 'AAPL']);
    expect(sections[1]?.data.map((item) => item.ticker)).toEqual(['META', 'MSFT']);
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
