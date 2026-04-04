import { useMutation } from "@tanstack/react-query";
import { request } from "@stacks/connect";
import { toast } from "sonner";
import { STACKS_NETWORK_MODE } from "@/config/contracts";

interface BroadcastArgs {
  method: "stx_transferStx" | "stx_callContract" | "stx_deployContract";
  params: any;
}

export function useBroadcastTx() {
  return useMutation({
    mutationFn: async ({ method, params }: BroadcastArgs) => {
      // Ensure network is correctly passed from config
      const response = await request(method, {
        ...params,
        network: STACKS_NETWORK_MODE,
      });
      return response;
    },
    onMutate: () => {
      toast.loading("Requesting signature...", { id: "tx-broadcast" });
    },
    onSuccess: (data) => {
      const txId = (data as any).txId;
      const explorerUrl = `https://explorer.stacks.co/txid/${txId}?chain=mainnet`;
      
      toast.success("Transaction broadcasted!", {
        id: "tx-broadcast",
        description: "Your transaction is being processed on Stacks.",
        action: {
          label: "View in Explorer",
          onClick: () => window.open(explorerUrl, "_blank"),
        },
      });
    },
    onError: (error: any) => {
      console.error("Broadcast error:", error);
      toast.error("Transaction failed", {
        id: "tx-broadcast",
        description: error.message || "User denied transaction or network error.",
      });
    },
  });
}
