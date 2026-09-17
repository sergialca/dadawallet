const PublicSolanaDevnetRpcUrl = 'https://api.devnet.solana.com';

export const LamportsPerSol = 1_000_000_000;

type SolanaRpcError = {
  message?: string;
};

type SolanaRpcResponse<T> = {
  error?: SolanaRpcError;
  result?: T;
};

type TokenAmount = {
  amount?: string;
  decimals?: number;
};

type ParsedTokenAccount = {
  account: {
    data: {
      parsed?: {
        info?: {
          tokenAmount?: TokenAmount;
        };
      };
    };
  };
};

export function getSolanaRpcUrl() {
  return process.env.EXPO_PUBLIC_SOLANA_RPC_URL?.trim() || PublicSolanaDevnetRpcUrl;
}

export async function solanaRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(getSolanaRpcUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  const payload = (await response.json()) as SolanaRpcResponse<T>;
  if (!response.ok || payload.error || payload.result === undefined) {
    throw new Error(payload.error?.message ?? `Solana RPC ${method} failed (${response.status})`);
  }

  return payload.result;
}

export async function getSolanaBalanceLamports(address: string) {
  const result = await solanaRpc<{ value: number }>('getBalance', [address, { commitment: 'confirmed' }]);
  return result.value;
}

export async function getSplTokenBalance(owner: string, mint: string) {
  const result = await solanaRpc<{ value: ParsedTokenAccount[] }>('getTokenAccountsByOwner', [
    owner,
    { mint },
    { encoding: 'jsonParsed' },
  ]);

  let raw = 0n;
  let decimals = 6;

  for (const account of result.value) {
    const tokenAmount = account.account.data.parsed?.info?.tokenAmount;
    if (!tokenAmount?.amount) {
      continue;
    }

    raw += BigInt(tokenAmount.amount);
    if (typeof tokenAmount.decimals === 'number') {
      decimals = tokenAmount.decimals;
    }
  }

  return { decimals, raw };
}
