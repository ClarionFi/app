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
import { toast } from "sonner"
import { usePoolState } from "@/hooks/use-pool-state"
import { useBroadcastTx } from "@/hooks/use-broadcast-tx"
import { Cl, Pc, PostConditionMode } from "@stacks/transactions"
import { CONTRACTS } from "@/config/contracts"

export function BorrowDialog({ asset }: { asset: SupportedAsset }) {
  const [amount, setAmount] = useState("")
  const { poolState } = usePoolState()
  const { mutate: broadcast, isPending: isTxPending } = useBroadcastTx()

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
    })
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" className="w-full">Borrow {asset.symbol}</Button>} />
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Borrow {asset.name}</DialogTitle>
        </DialogHeader>
        
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
            {isTxPending ? "Confirming in Wallet..." : `Borrow ${asset.symbol}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
