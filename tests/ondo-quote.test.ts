import { OndoChainId } from '@/constants/ondo';
import { fetchDexscreenerPrice, fetchOndoSoftQuote, fromOndoUint18 } from '@/hooks/use-trade-quote';

describe('fromOndoUint18', () => {
  test('decodes an 18-decimal Ondo quote amount', () => {
    expect(fromOndoUint18('225273151158540753535')).toBeCloseTo(225.27315115854075, 8);
    expect(fromOndoUint18('5000000000000000000')).toBe(5);
  });

  test('accepts a decimal string', () => {
    expect(fromOndoUint18('10.5')).toBe(10.5);
  });
});

describe('fetchDexscreenerPrice', () => {
  const mint = 'oPAiAikWTaFj9RYoRFD35ccfwhnMcB3ThgBZRHSkjTZ';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('uses the deepest Solana USDC pool', async () => {
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        pairs: [
          {
            chainId: 'solana',
            priceUsd: '1116.47',
            liquidity: { usd: 8 },
            baseToken: { address: mint },
            quoteToken: { symbol: 'USDC' },
          },
          {
            chainId: 'solana',
            priceUsd: '1049.07',
            liquidity: { usd: 609494 },
            baseToken: { address: mint },
            quoteToken: { symbol: 'USDC' },
          },
          {
            chainId: 'solana',
            priceUsd: '0.00002',
            liquidity: { usd: 16000 },
            baseToken: { address: 'So11111111111111111111111111111111111111112' },
            quoteToken: { symbol: 'tOpenAI' },
          },
        ],
      }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(fetchDexscreenerPrice(mint)).resolves.toBe(1049.07);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
    );
  });
});

describe('fetchOndoSoftQuote', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('requests the quote on Solana', async () => {
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        price: '225273151158540753535',
        tokenAmount: '5000000000000000000',
      }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchOndoSoftQuote({
      notionalValue: '10',
      side: 'buy',
      symbol: 'AAPLon',
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      chainId: OndoChainId,
      duration: 'short',
      notionalValue: '10',
      side: 'buy',
      symbol: 'AAPLon',
    });
    expect(OndoChainId).toBe('solana-900');
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('https://api.gm.ondo.finance/v1/attestations/soft');
  });
});
