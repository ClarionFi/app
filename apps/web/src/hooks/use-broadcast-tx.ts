import { useMutation } from "@tanstack/react-query";
import { openContractCall, openSTXTransfer } from "@stacks/connect";
import { toast } from "sonner";
import { network } from "@/config/contracts";
import type { 
  ContractCallRegularOptions, 
  STXTransferOptions 
} from "@stacks/connect";

type ContractCallArgs = Omit<ContractCallRegularOptions, "network" | "onFinish" | "onCancel">;
type STXTransferArgs = Omit<STXTransferOptions, "network" | "onFinish" | "onCancel">;

export function useBroadcastTx() {
  return useMutation({
    mutationFn: async (args: { type: "contract-call"; params: ContractCallArgs } | { type: "stx-transfer"; params: STXTransferArgs }) => {
      return new Promise((resolve, reject) => {
        const onFinish = (data: any) => resolve(data);
        const onCancel = () => reject(new Error("Transaction cancelled by user"));

        if (args.type === "contract-call") {
          void openContractCall({
            ...args.params,
            network: "mainnet",
            onFinish,
            onCancel,
          });
        } else {
          void openSTXTransfer({
            ...args.params,
            network: "mainnet",
            onFinish,
            onCancel,
          });
        }
      });
    },
    onMutate: () => {
      toast.loading("Requesting signature...", { id: "tx-broadcast" });
    },
    onSuccess: (data: any) => {
      const txId = data.txId;
      const explorerUrl = `https://explorer.hiro.so/txid/${txId}?chain=mainnet`;
      
      toast.success("Transaction broadcasted!", {
        id: "tx-broadcast",
        description: "Your transaction is being processed on Stacks Mainnet.",
        action: {
          label: "View Explorer",
          onClick: () => window.open(explorerUrl, "_blank"),
        },
      });
    },
    onError: (error: any) => {
      console.error("Broadcast error:", error);
      toast.error("Transaction failed", {
        id: "tx-broadcast",
        description: error.message || "Failed to broadcast transaction.",
      });
    },
  });
}
