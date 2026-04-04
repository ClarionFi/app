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
import { useUserBalances } from "@/hooks/use-user-balances"
import { Cl } from "@stacks/transactions"
import { CONTRACTS } from "@/config/contracts"

export function DepositDialog({ asset }: { asset: SupportedAsset }) {
  const [amount, setAmount] = useState("")
  const { poolState } = usePoolState()
  const { mutate: broadcast, isPending: isTxPending } = useBroadcastTx()
  const { data: balances } = useUserBalances()

  const isActiveAsset = poolState?.assetContract?.includes(asset.id) || (asset.id === 'stx' && poolState?.assetContract === null);
  const supplyApy = isActiveAsset && poolState ? `${poolState.supplyApy.toFixed(2)}%` : "0.00%";
  const collateralFactor = isActiveAsset && poolState ? `${(poolState.collateralFactorBps / 100).toFixed(0)}%` : "--";
  const userBalance = balances?.[asset.id] || "0.00";

  const handleDeposit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const microAmount = Math.floor(Number(amount) * (10 ** asset.decimals));
    const [poolAddress, poolName] = CONTRACTS.clarionPool.split(".");
    
    // contract trait principal is required for (asset-token <sip-010-trait>)
    const tokenPrincipal = asset.id === 'stx' ? `${poolAddress}.mock-ft` : asset.contractAddress;
    const [tokenAddress, tokenName] = tokenPrincipal!.split(".");

    broadcast({
      type: "contract-call",
      params: {
        contractAddress: poolAddress,
        contractName: poolName,
        functionName: "supply",
        functionArgs: [
          Cl.contractPrincipal(tokenAddress, tokenName),
          Cl.uint(microAmount)
        ]
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button className="w-full">Deposit {asset.symbol}</Button>} />
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Supply {asset.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="deposit-amount" className="text-sm font-medium">
              Amount to Supply
            </label>
            <div className="relative">
              <input
                id="deposit-amount"
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
              <span>Wallet Balance: {userBalance} {asset.symbol}</span>
              <button 
                type="button"
                className="text-primary hover:underline font-medium cursor-pointer"
                onClick={() => setAmount(userBalance)}
                disabled={isTxPending}
              >
                Max
              </button>
            </div>
          </div>
          
          <div className="rounded-lg bg-muted/50 p-4 flex flex-col gap-2 text-sm mt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supply APY</span>
              <span className="font-medium text-green-500">{supplyApy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Collateral Factor</span>
              <span className="font-medium">{collateralFactor}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose render={<Button variant="outline" disabled={isTxPending}>Cancel</Button>} />
          <Button onClick={handleDeposit} disabled={isTxPending}>
            {isTxPending ? "Confirming in Wallet..." : `Supply ${asset.symbol}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
