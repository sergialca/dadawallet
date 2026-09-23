import { OndoChainId } from '@/constants/ondo';
import { fetchOndoSoftQuote, fromOndoUint18 } from '@/hooks/use-trade-quote';

describe('fromOndoUint18', () => {
  test('decodes an 18-decimal Ondo quote amount', () => {
    expect(fromOndoUint18('225273151158540753535')).toBeCloseTo(225.27315115854075, 8);
    expect(fromOndoUint18('5000000000000000000')).toBe(5);
  });

  test('accepts a decimal string', () => {
    expect(fromOndoUint18('10.5')).toBe(10.5);
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
