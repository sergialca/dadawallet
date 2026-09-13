import { WalletChain } from '@/constants/tokens';
import { formatAmount } from '@/lib/format-amount';

const AlchemySepoliaRpcUrl = 'https://eth-sepolia.g.alchemy.com/v2';
const TransferCategories = ['external', 'erc20'] as const;
const PageSize = '0x32';

export type WalletTransfer = {
  asset: string;
  from: string;
  hash: string;
  id: string;
  to: string;
  value: string;
};

type AlchemyTransfer = {
  asset?: string | null;
  blockNum?: string;
  category?: string;
  from?: string;
  hash?: string;
  to?: string | null;
  uniqueId?: string;
  value?: number | string | null;
};

type AlchemyRpcError = {
  message?: string;
};

type AlchemyTransfersResult = {
  transfers?: AlchemyTransfer[];
};

type AlchemyRpcResponse = {
  error?: AlchemyRpcError;
  result?: AlchemyTransfersResult;
};

function alchemyRpcUrl() {
  const apiKey = process.env.EXPO_PUBLIC_ALCHEMY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Set EXPO_PUBLIC_ALCHEMY_API_KEY, then restart Expo.');
  }

  return `${AlchemySepoliaRpcUrl}/${apiKey}`;
}

function formatTransferValue(value: AlchemyTransfer['value']) {
  if (value == null || value === '') {
    return '—';
  }

  return formatAmount(value, 6);
}

function mapTransfer(transfer: AlchemyTransfer): WalletTransfer | null {
  if (!transfer.hash || !transfer.from) {
    return null;
  }

  return {
    id: transfer.uniqueId ?? `${transfer.hash}:${transfer.category ?? 'transfer'}`,
    asset: transfer.asset?.trim() || 'Unknown',
    value: formatTransferValue(transfer.value),
    from: transfer.from,
    to: transfer.to ?? '—',
    hash: transfer.hash,
  };
}

function sortKey(transfer: AlchemyTransfer) {
  const block = transfer.blockNum ? Number.parseInt(transfer.blockNum, 16) : 0;
  return Number.isFinite(block) ? block : 0;
}

async function fetchDirection(address: string, direction: 'from' | 'to') {
  const response = await fetch(alchemyRpcUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getAssetTransfers',
      params: [
        {
          fromBlock: '0x0',
          toBlock: 'latest',
          ...(direction === 'from' ? { fromAddress: address } : { toAddress: address }),
          category: [...TransferCategories],
          excludeZeroValue: true,
          maxCount: PageSize,
          order: 'desc',
          withMetadata: false,
        },
      ],
    }),
  });

  const payload = (await response.json()) as AlchemyRpcResponse;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? `Alchemy request failed (${response.status})`);
  }

  return payload.result?.transfers ?? [];
}

export async function fetchWalletTransfers(address: string): Promise<WalletTransfer[]> {
  if (WalletChain.id !== 11155111) {
    throw new Error('Activity is only available on Sepolia.');
  }

  const [outgoing, incoming] = await Promise.all([
    fetchDirection(address, 'from'),
    fetchDirection(address, 'to'),
  ]);

  const ranked = [...outgoing, ...incoming].sort((left, right) => sortKey(right) - sortKey(left));
  const seen = new Set<string>();
  const transfers: WalletTransfer[] = [];

  for (const transfer of ranked) {
    const mapped = mapTransfer(transfer);
    if (!mapped || seen.has(mapped.id)) {
      continue;
    }

    seen.add(mapped.id);
    transfers.push(mapped);
  }

  return transfers;
}
