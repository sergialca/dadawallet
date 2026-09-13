import { fetchWalletTransfers } from '@/lib/alchemy-transfers';

describe('fetchWalletTransfers', () => {
  const address = '0x5c43B1eD97e52d009611D89b74fA829FE4ac56b1';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_ALCHEMY_API_KEY = 'test-alchemy-key';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_ALCHEMY_API_KEY;
  });

  test('merges inbound and outbound Sepolia transfers from Alchemy', async () => {
    const fetchMock = jest.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        params: Array<{ fromAddress?: string; toAddress?: string }>;
      };
      const outgoing = Boolean(body.params[0]?.fromAddress);

      return {
        ok: true,
        json: async () => ({
          result: {
            transfers: outgoing
              ? [
                  {
                    uniqueId: '0xaaa:external',
                    hash: '0xaaa',
                    from: address,
                    to: '0x1111111111111111111111111111111111111111',
                    value: 0.5,
                    asset: 'ETH',
                    category: 'external',
                    blockNum: '0xb0eadc',
                  },
                ]
              : [
                  {
                    uniqueId: '0xbbb:erc20',
                    hash: '0xbbb',
                    from: '0x2222222222222222222222222222222222222222',
                    to: address,
                    value: 12.5,
                    asset: 'USDC',
                    category: 'erc20',
                    blockNum: '0xb96042',
                  },
                  {
                    uniqueId: '0xaaa:external',
                    hash: '0xaaa',
                    from: address,
                    to: '0x1111111111111111111111111111111111111111',
                    value: 0.5,
                    asset: 'ETH',
                    category: 'external',
                    blockNum: '0xb0eadc',
                  },
                ],
          },
        }),
      };
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(fetchWalletTransfers(address)).resolves.toEqual([
      {
        id: '0xbbb:erc20',
        asset: 'USDC',
        value: '12.5',
        from: '0x2222222222222222222222222222222222222222',
        to: address,
        hash: '0xbbb',
      },
      {
        id: '0xaaa:external',
        asset: 'ETH',
        value: '0.5',
        from: address,
        to: '0x1111111111111111111111111111111111111111',
        hash: '0xaaa',
      },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('requires an Alchemy API key', async () => {
    delete process.env.EXPO_PUBLIC_ALCHEMY_API_KEY;

    await expect(fetchWalletTransfers(address)).rejects.toThrow(
      'Set EXPO_PUBLIC_ALCHEMY_API_KEY, then restart Expo.',
    );
  });
});
