import { getSolanaBalanceLamports, getSolanaRpcUrl, getSplTokenAccounts, getSplTokenBalance } from '@/lib/solana-rpc';

describe('getSolanaRpcUrl', () => {
  const originalRpc = process.env.EXPO_PUBLIC_SOLANA_RPC_URL;

  afterEach(() => {
    if (originalRpc == null) {
      delete process.env.EXPO_PUBLIC_SOLANA_RPC_URL;
    } else {
      process.env.EXPO_PUBLIC_SOLANA_RPC_URL = originalRpc;
    }
  });

  test('prefers an explicit Solana RPC URL', () => {
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL = 'https://example-solana-rpc.test';

    expect(getSolanaRpcUrl()).toBe('https://example-solana-rpc.test');
  });

  test('uses public Solana Devnet by default', () => {
    delete process.env.EXPO_PUBLIC_SOLANA_RPC_URL;

    expect(getSolanaRpcUrl()).toBe('https://api.devnet.solana.com');
  });
});

describe('Solana JSON-RPC helpers', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SOLANA_RPC_URL;
  });

  test('reads SOL lamports from getBalance', async () => {
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL = 'https://example-solana-rpc.test';
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ result: { value: 1_500_000_000 } }),
    })) as unknown as typeof fetch;

    await expect(getSolanaBalanceLamports('SoLAddress111111111111111111111111111111111')).resolves.toBe(
      1_500_000_000,
    );
  });

  test('sums SPL token accounts for a mint', async () => {
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL = 'https://example-solana-rpc.test';
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        result: {
          value: [
            {
              account: {
                data: { parsed: { info: { tokenAmount: { amount: '1000000', decimals: 6 } } } },
              },
            },
            {
              account: {
                data: { parsed: { info: { tokenAmount: { amount: '2500000', decimals: 6 } } } },
              },
            },
          ],
        },
      }),
    })) as unknown as typeof fetch;

    await expect(
      getSplTokenBalance('SoLAddress111111111111111111111111111111111', 'UsdcMint'),
    ).resolves.toEqual({
      decimals: 6,
      raw: 3_500_000n,
    });
  });

  test('lists SPL and Token-2022 accounts by mint', async () => {
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL = 'https://example-solana-rpc.test';
    global.fetch = jest.fn(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as {
        params: [string, { programId?: string }];
      };
      const programId = body.params[1]?.programId;
      const mint = programId?.startsWith('Tokenz')
        ? 'TKLSidmLVt3cqGaaodG8tyRzoANfQwoh67AccjmubeZ'
        : 'UsdcMint';

      return {
        ok: true,
        json: async () => ({
          result: {
            value: [
              {
                account: {
                  data: {
                    parsed: {
                      info: { mint, tokenAmount: { amount: '1500000', decimals: 6 } },
                    },
                  },
                },
              },
            ],
          },
        }),
      };
    }) as unknown as typeof fetch;

    await expect(getSplTokenAccounts('SoLAddress111111111111111111111111111111111')).resolves.toEqual([
      { decimals: 6, mint: 'UsdcMint', raw: 1_500_000n },
      { decimals: 6, mint: 'TKLSidmLVt3cqGaaodG8tyRzoANfQwoh67AccjmubeZ', raw: 1_500_000n },
    ]);
  });
});
