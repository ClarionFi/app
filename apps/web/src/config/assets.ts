

export type SupportedAsset = {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
  contractAddress?: string; // For SIP-010
};

export const SUPPORTED_ASSETS: Record<string, SupportedAsset> = {
  stx: {
    id: "stx",
    symbol: "STX",
    name: "Stacks",
    decimals: 6, // 1 STX = 1,000,000 micro-STX
  },
  sbtc: {
    id: "sbtc",
    symbol: "sBTC",
    name: "sBTC",
    decimals: 8,
  },
  usdc: {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6, // standard bridging decimals on Stacks
  },
};

export const ASSETS_LIST = Object.values(SUPPORTED_ASSETS);
