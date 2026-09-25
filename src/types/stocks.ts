export interface SettlementToken {
  symbol: string;
  address: string;
  decimals: number;
}

export type StockKind = 'stock' | 'pre-IPO stock';

export interface StockAsset {
  id: string;
  ticker: string;
  name: string;
  tokenSymbol: string;
  contractAddress: string;
  decimals: number;
  category: string;
  description: string;
  logoUrl: string;
  isAvailable: boolean;
  kind: StockKind;
}

export interface StockCatalog {
  network: string;
  chainId: string;
  provider: string;
  settlementToken: SettlementToken;
  stocks: StockAsset[];
}