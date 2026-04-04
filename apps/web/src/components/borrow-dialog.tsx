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

export function BorrowDialog({ asset }: { asset: SupportedAsset }) {
  const [amount, setAmount] = useState("")
  const [isTxPending, setIsTxPending] = useState(false)
  const { poolState } = usePoolState()

  const isActiveAsset = poolState?.assetContract?.includes(asset.id) || (asset.id === 'stx' && poolState?.assetContract === null);
  const borrowApy = isActiveAsset && poolState ? `${poolState.borrowApy.toFixed(2)}%` : "0.00%";
  const healthFactor = isActiveAsset && poolState ? "Safe" : "--";

  const handleBorrow = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    
    setIsTxPending(true)
    
    setTimeout(() => {
      setIsTxPending(false)
      toast.success(`Successfully borrowed ${amount} ${asset.symbol}`)
      setAmount("")
    }, 2000)
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
              <span>Available to Borrow: 0.00 {asset.symbol}</span>
              <button 
                type="button"
                className="text-primary hover:underline font-medium cursor-pointer"
                onClick={() => setAmount("0")}
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
