import { getAddress, type Address, type Hex } from 'viem';

export const OndoApiBaseUrl = 'https://api.gm.ondo.finance/v1';
export const OndoChainId = 'ethereum-1';
export const DefaultSlippagePercent = 0.5;
export const MinimumOrderUsdc = 1;
export const QuoteDuration = 'short';

export const EthereumUsdcAddress = getAddress(
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
) as Address;

export const GmTokenManagerAddress = getAddress(
  '0x2c158bc456e027b2affccadf1bdbd9f5fc4c5c8c',
) as Address;

export const gmTokenManagerAbi = [
  {
    type: 'function',
    name: 'mintWithAttestation',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'quote',
        type: 'tuple',
        components: [
          { name: 'chainId', type: 'uint256' },
          { name: 'attestationId', type: 'uint256' },
          { name: 'userId', type: 'bytes32' },
          { name: 'asset', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'expiration', type: 'uint256' },
          { name: 'side', type: 'uint8' },
          { name: 'additionalData', type: 'bytes32' },
        ],
      },
      { name: 'signature', type: 'bytes' },
      { name: 'depositToken', type: 'address' },
      { name: 'depositTokenAmount', type: 'uint256' },
    ],
    outputs: [{ name: 'receivedGmTokenAmount', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'redeemWithAttestation',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'quote',
        type: 'tuple',
        components: [
          { name: 'chainId', type: 'uint256' },
          { name: 'attestationId', type: 'uint256' },
          { name: 'userId', type: 'bytes32' },
          { name: 'asset', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'expiration', type: 'uint256' },
          { name: 'side', type: 'uint8' },
          { name: 'additionalData', type: 'bytes32' },
        ],
      },
      { name: 'signature', type: 'bytes' },
      { name: 'receiveToken', type: 'address' },
      { name: 'minimumReceiveAmount', type: 'uint256' },
    ],
    outputs: [{ name: 'receivedUSDonAmount', type: 'uint256' }],
  },
] as const;

export type OndoQuoteSide = 'buy' | 'sell';

export type OndoSoftQuote = {
  assetAddress?: string;
  price: string;
  side: string;
  symbol: string;
  ticker?: string;
  tokenAmount: string;
};

export type OndoAttestation = OndoSoftQuote & {
  additionalData: string;
  attestationId: string;
  expiration: number;
  signature: Hex | string;
  userId: string;
  chainId: string;
};
