import { getSolanaBalanceLamports, getSolanaRpcUrl, getSplTokenBalance } from '@/lib/solana-rpc';

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
});
