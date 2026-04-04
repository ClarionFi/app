export type SupportedAsset = {
	id: string;
	symbol: string;
	name: string;
	decimals: number;
	icon: string;
	contractAddress?: string;
};

export const SUPPORTED_ASSETS: Record<string, SupportedAsset> = {
	stx: {
		id: "stx",
		symbol: "STX",
		name: "Stacks",
		decimals: 6,
		icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/stacks/info/logo.png",
	},
	sbtc: {
		id: "sbtc",
		symbol: "sBTC",
		name: "sBTC",
		decimals: 8,
		icon: "https://raw.githubusercontent.com/stacks-network/sbtc/main/assets/sbtc-logo.png",
		contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
	},
	usdc: {
		id: "usdc",
		symbol: "USDC",
		name: "USD Coin",
		decimals: 6,
		icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
		contractAddress: "SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx",
	},
};

export const ASSETS_LIST = Object.values(SUPPORTED_ASSETS);
