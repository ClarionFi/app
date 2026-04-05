import type { SupportedAsset } from "@/config/assets"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { usePoolState } from "@/hooks/use-pool-state"
import { useBroadcastTx } from "@/hooks/use-broadcast-tx"
import { Cl, Pc, PostConditionMode } from "@stacks/transactions"
import { CONTRACTS } from "@/config/contracts"

export function BorrowDialog({ asset }: { asset: SupportedAsset }) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"form" | "confirming" | "success">("form")
  const [txId, setTxId] = useState<string | null>(null)
  const [amount, setAmount] = useState("")

  const { poolState } = usePoolState()
  const { mutate: broadcast, isPending: isTxPending } = useBroadcastTx()

  const resetState = () => {
    setStep("form")
    setAmount("")
    setTxId(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(resetState, 300)
    }
  }

  const isActiveAsset = poolState?.assetContract?.includes(asset.id) || asset.id === 'stx';
  const borrowApy = isActiveAsset && poolState ? (asset.id === 'stx' ? '--' : `${poolState.borrowApy.toFixed(2)}%`) : "0.00%";
  const healthFactor = isActiveAsset && poolState ? "Safe" : "--";
  const availableLiquidity = isActiveAsset && poolState ? (poolState.totalLiquidAssets / (10 ** asset.decimals)).toFixed(2) : "0.00";

  const handleBorrow = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const microAmount = Math.floor(Number(amount) * (10 ** asset.decimals));
    const [poolAddress, poolName] = CONTRACTS.clarionPool.split(".");
    
    const tokenPrincipal = asset.id === 'stx' ? `${poolAddress}.mock-ft` : asset.contractAddress;
    const [tokenAddress, tokenName] = tokenPrincipal!.split(".");

    const postConditions: any[] = [];
    if (asset.id !== 'stx') {
      postConditions.push(
        Pc.principal(`${poolAddress}.${poolName}` as `${string}.${string}`).willSendEq(microAmount).ft(tokenPrincipal as `${string}.${string}`, tokenName)
      );
    }

    setStep("confirming")

    broadcast({
      type: "contract-call",
      params: {
        contractAddress: poolAddress,
        contractName: poolName,
        functionName: "borrow",
        functionArgs: [
          Cl.contractPrincipal(tokenAddress, tokenName),
          Cl.uint(microAmount)
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions,
      }
    }, {
      onSuccess: (data: any) => {
        if (data && data.txId) setTxId(data.txId)
        setStep("success")
      },
      onError: () => {
        setStep("form")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="secondary" className="w-full">Borrow {asset.symbol}</Button>} />
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Borrow {asset.name}</DialogTitle>
        </DialogHeader>
        
        {step === "form" && (
          <>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="borrow-amount" className="text-sm font-medium">
                  Amount to Borrow
                </label>
                <div className="relative">
                  <input
                    id="borrow-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    disabled={isTxPending}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground font-medium text-sm">
                    {asset.symbol}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                  <span>Available to Borrow: {availableLiquidity} {asset.symbol}</span>
                  <button 
                    type="button"
                    className="text-primary hover:underline font-medium cursor-pointer"
                    onClick={() => setAmount(availableLiquidity)}
                    disabled={isTxPending}
                  >
                    Max
                  </button>
                </div>
              </div>
              
              <div className="rounded-lg bg-muted/50 p-4 flex flex-col gap-2 text-sm mt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Borrow APY</span>
                  <span className="font-medium text-destructive">{borrowApy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health Factor</span>
                  <span className="font-medium">{healthFactor}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-end gap-2">
              <DialogClose render={<Button variant="outline" disabled={isTxPending}>Cancel</Button>} />
              <Button onClick={handleBorrow} disabled={isTxPending}>
                Borrow {asset.symbol}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "confirming" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="flex flex-col gap-1 text-center">
              <h3 className="font-medium text-lg">Confirm in Wallet</h3>
              <p className="text-sm text-muted-foreground">Please sign the transaction in your wallet to continue.</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex flex-col gap-1 text-center">
              <h3 className="font-medium text-lg">Transaction Broadcasted</h3>
              <p className="text-sm text-muted-foreground">Your transaction is being mined on Stacks Mainnet.</p>
            </div>
            {txId && (
              <a 
                href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Track in Explorer <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <Button className="w-full mt-4" onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
