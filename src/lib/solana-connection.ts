import { Connection } from '@solana/web3.js';

import { getSolanaRpcUrl } from '@/lib/solana-rpc';

let connection: Connection | null = null;
let connectionUrl: string | null = null;

export function getSolanaConnection() {
  const url = getSolanaRpcUrl();
  if (!connection || connectionUrl !== url) {
    connection = new Connection(url, 'confirmed');
    connectionUrl = url;
  }

  return connection;
}
