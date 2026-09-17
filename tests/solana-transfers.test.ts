import { SolanaUsdcMint } from '@/constants/tokens';
import { fetchWalletTransfers, getSolanaTransfersRpcUrl } from '@/lib/solana-transfers';

describe('getSolanaTransfersRpcUrl', () => {
  const originalRpc = process.env.EXPO_PUBLIC_SOLANA_RPC_URL;

  afterEach(() => {
    if (originalRpc == null) {
      delete process.env.EXPO_PUBLIC_SOLANA_RPC_URL;
    } else {
      process.env.EXPO_PUBLIC_SOLANA_RPC_URL = originalRpc;
    }
  });

  test('uses a native Solana Devnet RPC by default', () => {
    delete process.env.EXPO_PUBLIC_SOLANA_RPC_URL;

    expect(getSolanaTransfersRpcUrl()).toBe('https://api.devnet.solana.com');
  });

  test('prefers an explicit Solana RPC URL', () => {
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL = 'https://example-solana-rpc.test';

    expect(getSolanaTransfersRpcUrl()).toBe('https://example-solana-rpc.test');
  });
});

describe('fetchWalletTransfers', () => {
  const address = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';
  const counterparty = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL = 'https://example-solana-rpc.test';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SOLANA_RPC_URL;
  });

  test('maps SOL and USDC transfers from parsed Solana transactions', async () => {
    const fetchMock = jest.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { method: string; params: unknown[] };

      if (body.method === 'getSignaturesForAddress') {
        return {
          ok: true,
          json: async () => ({
            result: [
              { signature: 'sigUsdc', slot: 20, err: null },
              { signature: 'sigSol', slot: 10, err: null },
            ],
          }),
        };
      }

      if (body.method === 'getTransaction' && body.params[0] === 'sigUsdc') {
        return {
          ok: true,
          json: async () => ({
            result: {
              slot: 20,
              meta: { innerInstructions: [] },
              transaction: {
                message: {
                  instructions: [
                    {
                      program: 'spl-token',
                      parsed: {
                        type: 'transferChecked',
                        info: {
                          authority: counterparty,
                          destination: address,
                          mint: SolanaUsdcMint,
                          source: 'TokenAccount111111111111111111111111111',
                          tokenAmount: { uiAmountString: '12.5' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          result: {
            slot: 10,
            meta: { innerInstructions: [] },
            transaction: {
              message: {
                instructions: [
                  {
                    program: 'system',
                    parsed: {
                      type: 'transfer',
                      info: {
                        source: address,
                        destination: counterparty,
                        lamports: 500_000_000,
                      },
                    },
                  },
                ],
              },
            },
          },
        }),
      };
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(fetchWalletTransfers(address)).resolves.toEqual([
      {
        id: 'sigUsdc:0',
        asset: 'USDC',
        value: '12.5',
        from: counterparty,
        to: address,
        hash: 'sigUsdc',
      },
      {
        id: 'sigSol:0',
        asset: 'SOL',
        value: '0.5',
        from: address,
        to: counterparty,
        hash: 'sigSol',
      },
    ]);

    expect(fetchMock).toHaveBeenCalled();
    for (const [url] of fetchMock.mock.calls) {
      expect(String(url)).toBe('https://example-solana-rpc.test');
    }
  });

  test('calls the public Solana Devnet RPC when no custom URL is set', async () => {
    delete process.env.EXPO_PUBLIC_SOLANA_RPC_URL;

    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({ result: [] }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(fetchWalletTransfers(address)).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.devnet.solana.com');
  });
});
