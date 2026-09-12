import { Address } from 'viem';

export interface SettlementToken {
  symbol: string;
  address: Address;
  decimals: number;
}

export interface StockAsset {
  id: string;
  ticker: string;
  name: string;
  tokenSymbol: string;
  contractAddress: Address;
  decimals: number;
  category: string;
  description: string;
  logoUrl: string;
  isAvailable: boolean;
}

export interface StockCatalog {
  network: string;
  chainId: number;
  provider: string;
  settlementToken: SettlementToken;
  stocks: StockAsset[];
}