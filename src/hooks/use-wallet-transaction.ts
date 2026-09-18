import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { getSolanaConnection } from '@/lib/solana-connection';

type SolanaTransferInput = {
  lamports: number;
  to: string;
};


export function useWalletTransaction() {
  const { address, wallet } = useSolanaWallet();

  async function sendTransaction(input: SolanaTransferInput) {
    if (!wallet || !address) {
      throw new Error('Wallet is not ready.');
    }

    if (!('lamports' in input)) {
      throw new Error('This wallet is on Solana. Ethereum contract calls are not available.');
    }

    const connection = getSolanaConnection();
    const fromPubkey = new PublicKey(address);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        lamports: input.lamports,
        toPubkey: new PublicKey(input.to),
      }),
    );
    transaction.feePayer = fromPubkey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const provider = await wallet.getProvider();
    const { signature } = await provider.request({
      method: 'signAndSendTransaction',
      params: {
        connection,
        transaction,
      },
    });

    return signature;
  }

  return {
    address,
    sendTransaction,
    wallet,
  };
}
