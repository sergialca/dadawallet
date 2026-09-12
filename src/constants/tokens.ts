import { sepolia } from 'viem/chains';
import { getAddress, type Address } from 'viem';

export const SepoliaUsdcAddress = getAddress(
  '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
) as Address;

export const WalletChain = sepolia;
