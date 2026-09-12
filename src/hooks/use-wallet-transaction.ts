import { type Address, type Hex } from 'viem';

import { useEvmWallet } from '@/hooks/use-evm-wallet';

type TransactionInput = {
  chainId?: number;
  data: Hex;
  to: Address;
};

export function useWalletTransaction() {
  const { address, wallet } = useEvmWallet();

  async function sendTransaction({ chainId, data, to }: TransactionInput) {
    if (!wallet || !address) {
      throw new Error('Wallet is not ready.');
    }

    const provider = await wallet.getProvider();
    await provider.request({ method: 'eth_requestAccounts' });

    if (chainId) {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    }

    return (await provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: address,
          to,
          data,
        },
      ],
    })) as Hex;
  }

  return {
    address,
    sendTransaction,
    wallet,
  };
}
