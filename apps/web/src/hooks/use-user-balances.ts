import { useQuery } from "@tanstack/react-query";
import { useUserData } from "./use-user-data";
import { 
  principalCV, 
  serializeCV, 
  hexToCV, 
  cvToValue 
} from "@stacks/transactions";
import { SUPPORTED_ASSETS } from "@/config/assets";

export function useUserBalances() {
  const { stxAddress, connected } = useUserData();

  return useQuery({
    queryKey: ["user-balances", stxAddress],
    enabled: connected && !!stxAddress,
    queryFn: async () => {
      if (!stxAddress) return null;

      const balances: Record<string, string> = {};
      const API_BASE = "https://api.mainnet.hiro.so";

      // 1. Fetch STX Balance (Native) - Using /v2/accounts for higher reliability
      try {
        const response = await fetch(`${API_BASE}/v2/accounts/${stxAddress}`);
        const data = await response.json();
        // The /v2/accounts endpoint returns { balance: "hex_value" }
        // We parse the hex balance or string balance
        const rawBalance = data.balance?.startsWith("0x") ? BigInt(data.balance) : BigInt(data.balance || "0");
        balances["stx"] = (Number(rawBalance) / 10 ** 6).toFixed(2);
      } catch (e) {
        console.error("Failed to fetch STX balance", e);
        balances["stx"] = "0.00";
      }

      // 2. Fetch SIP-010 Balances using Low-Level RPC
      for (const asset of Object.values(SUPPORTED_ASSETS)) {
        if (asset.id === "stx") continue;
        if (!asset.contractAddress) {
          balances[asset.id] = "0.00";
          continue;
        }

        try {
          const [contractAddress, contractName] = asset.contractAddress.split(".");
          
          // Encode Principal Argument as Hex
          const pcCV = principalCV(stxAddress);
          const serialized = serializeCV(pcCV);
          const hexArg = typeof serialized === "string" 
            ? (serialized.startsWith("0x") ? serialized : "0x" + serialized) 
            : "0x" + Buffer.from(serialized).toString("hex");

          const response = await fetch(
            `${API_BASE}/v2/contracts/call-read/${contractAddress}/${contractName}/get-balance`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sender: stxAddress,
                arguments: [hexArg],
              }),
            }
          );
          
          const result = await response.json();
          console.log(`RPC result for ${asset.symbol}:`, result);

          if (result.okay && result.result) {
            const cv = hexToCV(result.result);
            const val = cvToValue(cv, true);
            // Handle (ok u100) or just u100
            const rawValue = val?.value ?? val ?? 0;
            balances[asset.id] = (Number(rawValue) / 10 ** asset.decimals).toFixed(2);
          } else {
            balances[asset.id] = "0.00";
          }
        } catch (e) {
          console.error(`Failed to fetch balance for ${asset.symbol}`, e);
          balances[asset.id] = "0.00";
        }
      }

      return balances;
    },
    refetchInterval: 30_000,
  });
}
