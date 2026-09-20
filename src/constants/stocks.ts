import type { StockCatalog } from '@/types/stocks';

export const stockCatalog: StockCatalog = {
  network: 'ethereum-mainnet',
  chainId: 1,
  provider: 'Ondo Global Markets',
  settlementToken: {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
  },
  stocks: [
    {
      id: 'aapl-ondo',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      tokenSymbol: 'AAPLon',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      category: 'Consumer Electronics',
      description:
        'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
      logoUrl: 'https://assets.parqet.com/logos/symbol/AAPL?format=png',
      isAvailable: true,
      kind: 'stock',
    },
    {
      id: 'msft-ondo',
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      tokenSymbol: 'MSFTon',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      category: 'Enterprise Software & Cloud',
      description:
        'Develops and supports software, services, devices and cloud solutions including Azure, Windows, and Office.',
      logoUrl: 'https://assets.parqet.com/logos/symbol/MSFT?format=png',
      isAvailable: true,
      kind: 'stock',
    },
    {
      id: 'nvda-ondo',
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      tokenSymbol: 'NVDAon',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      category: 'Semiconductors & AI',
      description:
        'Pioneer of GPU computing and leading infrastructure provider for artificial intelligence and accelerated computing.',
      logoUrl: 'https://assets.parqet.com/logos/symbol/NVDA?format=png',
      isAvailable: true,
      kind: 'stock',
    },
    {
      id: 'amzn-ondo',
      ticker: 'AMZN',
      name: 'Amazon.com, Inc.',
      tokenSymbol: 'AMZNon',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      category: 'E-Commerce & Cloud',
      description:
        'Global e-commerce marketplace, cloud computing provider via AWS, digital streaming, and logistics leader.',
      logoUrl: 'https://assets.parqet.com/logos/symbol/AMZN?format=png',
      isAvailable: true,
      kind: 'stock',
    },
    {
      id: 'googl-ondo',
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      tokenSymbol: 'GOOGLon',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      category: 'Internet Services & AI',
      description:
        'Holding company for Google Search, YouTube, Android, Google Cloud, and DeepMind artificial intelligence ventures.',
      logoUrl: 'https://assets.parqet.com/logos/symbol/GOOGL?format=png',
      isAvailable: true,
      kind: 'stock',
    },
    {
      id: 'meta-ondo',
      ticker: 'META',
      name: 'Meta Platforms, Inc.',
      tokenSymbol: 'METAon',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      category: 'Social Media & Metaverse',
      description:
        'Connects billions of people across Facebook, Instagram, WhatsApp, Messenger, and develops next-generation spatial computing.',
      logoUrl: 'https://assets.parqet.com/logos/symbol/META?format=png',
      isAvailable: true,
      kind: 'stock',
    },
    {
      id: 'tsla-ondo',
      ticker: 'TSLA',
      name: 'Tesla, Inc.',
      tokenSymbol: 'TSLAon',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      category: 'Electric Vehicles & Clean Energy',
      description:
        'Designs, manufactures, and sells electric vehicles, energy storage systems, solar panels, and autonomous driving tech.',
      logoUrl: 'https://assets.parqet.com/logos/symbol/TSLA?format=png',
      isAvailable: true,
      kind: 'stock',
    },
    {
      id: 'openai-tessera',
      ticker: 'tOpenAI',
      name: 'OpenAI',
      tokenSymbol: 'tOpenAI',
      contractAddress: 'oPAiAikWTaFj9RYoRFD35ccfwhnMcB3ThgBZRHSkjTZ',
      decimals: 9,
      category: 'Artificial Intelligence',
      description:
        'Tessera T-token for tokenized pre-IPO economic exposure to OpenAI. Not equity and not an Ondo Global Markets stock.',
      logoUrl: 'https://logo.clearbit.com/openai.com',
      isAvailable: true,
      kind: 'pre-IPO stock',
    },
    {
      id: 'kalshi-tessera',
      ticker: 'tKalshi',
      name: 'Kalshi',
      tokenSymbol: 'tKalshi',
      contractAddress: 'TKLSidmLVt3cqGaaodG8tyRzoANfQwoh67AccjmubeZ',
      decimals: 9,
      category: 'Prediction Markets',
      description:
        'Tessera T-token for tokenized pre-IPO economic exposure to Kalshi. Not equity and not an Ondo Global Markets stock.',
      logoUrl: 'https://logo.clearbit.com/kalshi.com',
      isAvailable: true,
      kind: 'pre-IPO stock',
    },
  ],
};

export const listedStocks = stockCatalog.stocks.filter((stock) => stock.isAvailable);

export function getStockById(stockId: string) {
  return listedStocks.find((stock) => stock.id === stockId) ?? null;
}
