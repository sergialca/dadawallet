import { SolanaUsdcMint } from '@/constants/tokens';
import { formatAmount } from '@/lib/format-amount';
import { LamportsPerSol } from '@/lib/solana-rpc';

const PublicSolanaDevnetRpcUrl = 'https://api.devnet.solana.com';
const SignatureLimit = 20;

type SolanaRpcError = {
  message?: string;
};

type SolanaRpcResponse<T> = {
  error?: SolanaRpcError;
  result?: T;
};

export function getSolanaTransfersRpcUrl() {
  return process.env.EXPO_PUBLIC_SOLANA_RPC_URL?.trim() || PublicSolanaDevnetRpcUrl;
}

async function solanaRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(getSolanaTransfersRpcUrl(), {
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

export type WalletTransfer = {
  asset: string;
  from: string;
  hash: string;
  id: string;
  to: string;
  value: string;
};

type SignatureInfo = {
  err: unknown;
  signature: string;
  slot?: number;
};

type ParsedInstructionInfo = {
  amount?: string;
  authority?: string;
  destination?: string;
  lamports?: number;
  mint?: string;
  source?: string;
  tokenAmount?: {
    uiAmountString?: string;
  };
};

type ParsedInstruction = {
  parsed?: {
    info?: ParsedInstructionInfo;
    type?: string;
  };
  program?: string;
};

type ParsedTransaction = {
  meta?: {
    innerInstructions?: Array<{
      instructions?: ParsedInstruction[];
    }>;
  } | null;
  slot?: number;
  transaction: {
    message: {
      instructions?: ParsedInstruction[];
    };
  };
};

function collectInstructions(transaction: ParsedTransaction) {
  const outer = transaction.transaction.message.instructions ?? [];
  const inner = (transaction.meta?.innerInstructions ?? []).flatMap(
    (group) => group.instructions ?? [],
  );
  return [...outer, ...inner];
}

function mapInstruction(
  instruction: ParsedInstruction,
  signature: string,
  index: number,
): WalletTransfer | null {
  const parsed = instruction.parsed;
  const info = parsed?.info;
  if (!parsed?.type || !info?.source || !info.destination) {
    return null;
  }

  if (instruction.program === 'system' && parsed.type === 'transfer' && info.lamports != null) {
    return {
      id: `${signature}:${index}`,
      asset: 'SOL',
      value: formatAmount(info.lamports / LamportsPerSol, 6),
      from: info.source,
      to: info.destination,
      hash: signature,
    };
  }

  if (
    instruction.program === 'spl-token' &&
    (parsed.type === 'transfer' || parsed.type === 'transferChecked')
  ) {
    const isUsdc = info.mint === SolanaUsdcMint;
    const value =
      info.tokenAmount?.uiAmountString ??
      (info.amount == null ? '—' : formatAmount(Number(info.amount) / 1_000_000, 6));

    return {
      id: `${signature}:${index}`,
      asset: isUsdc ? 'USDC' : 'Token',
      value,
      from: info.authority ?? info.source,
      to: info.destination,
      hash: signature,
    };
  }

  return null;
}

export async function fetchWalletTransfers(address: string): Promise<WalletTransfer[]> {
  const signatures = await solanaRpc<SignatureInfo[]>('getSignaturesForAddress', [
    address,
    { limit: SignatureLimit },
  ]);

  const confirmed = signatures.filter((item) => item.err == null);
  const transactions = await Promise.all(
    confirmed.map(async (item) => {
      const transaction = await solanaRpc<ParsedTransaction | null>('getTransaction', [
        item.signature,
        { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
      ]);
      return { signature: item.signature, slot: item.slot ?? transaction?.slot ?? 0, transaction };
    }),
  );

  const ranked = [...transactions].sort((left, right) => right.slot - left.slot);
  const transfers: WalletTransfer[] = [];
  const seen = new Set<string>();

  for (const item of ranked) {
    if (!item.transaction) {
      continue;
    }

    collectInstructions(item.transaction).forEach((instruction, index) => {
      const mapped = mapInstruction(instruction, item.signature, index);
      if (!mapped || seen.has(mapped.id)) {
        return;
      }

      seen.add(mapped.id);
      transfers.push(mapped);
    });
  }

  return transfers;
}
