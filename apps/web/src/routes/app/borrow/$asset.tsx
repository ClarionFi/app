import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { SUPPORTED_ASSETS } from '@/config/assets'
import { Button } from '@workspace/ui/components/button'
import { ArrowLeftIcon, InfoIcon } from 'lucide-react'
import { DepositDialog } from '@/components/deposit-dialog'
import { BorrowDialog } from '@/components/borrow-dialog'
import { usePoolState } from '@/hooks/use-pool-state'

export const Route = createFileRoute('/app/borrow/$asset')({
  component: AssetBorrowView,
})

function AssetBorrowView() {
  const { asset } = Route.useParams()
  const router = useRouter()
  const { poolState } = usePoolState()
  
  const assetData = SUPPORTED_ASSETS[asset]

  if (!assetData) {
    return (
      <div className="flex flex-col items-center py-20">
        <h3 className="text-xl font-bold font-heading">Asset not found.</h3>
        <Button className="mt-4" onClick={() => router.history.back()}>Go Back</Button>
      </div>
    )
  }

  const isActiveAsset = poolState?.assetContract?.includes(assetData.id) || (assetData.id === 'stx' && poolState?.assetContract === null);
  const formatAmount = (amt: number) => (amt / (10 ** assetData.decimals)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatUSD = (amt: number) => `$${(amt / (10 ** assetData.decimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const totalDeposited = isActiveAsset && poolState ? formatAmount(poolState.totalAssets) : "0.00";
  const totalBorrowed = isActiveAsset && poolState ? formatAmount(poolState.totalDebt) : "0.00";
  const borrowApy = isActiveAsset && poolState ? `${poolState.borrowApy.toFixed(2)}%` : "0.00%";
  const totalDepositedUSD = isActiveAsset && poolState ? formatUSD(poolState.totalAssets) : "$0.00";
  const totalBorrowedUSD = isActiveAsset && poolState ? formatUSD(poolState.totalDebt) : "$0.00";
  const availableLiquidity = isActiveAsset && poolState ? formatAmount(poolState.totalLiquidAssets) : "0.00";
  const availableLiquidityUSD = isActiveAsset && poolState ? formatUSD(poolState.totalLiquidAssets) : "$0.00";

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto px-4 md:px-0">
      <div className="flex flex-col gap-8">
        <Link to="/app/borrow" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={assetData.icon} 
              alt={assetData.symbol} 
              className="h-14 w-14 shrink-0 rounded-full object-contain bg-muted"
            />
            <div className="flex flex-col">
              <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
                {assetData.name} <span className="text-muted-foreground text-xl font-normal">{assetData.symbol}</span>
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 pt-1">
                Asset on <span className="flex items-center gap-1 font-medium text-foreground"><LogoSmall /> Stacks Mainnet</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DepositDialog asset={assetData} />
            <BorrowDialog asset={assetData} />
          </div>
        </div>

        <div className="flex flex-wrap gap-12 pt-4 border-t border-border/50">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
              Total deposits <InfoIcon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{totalDepositedUSD}</span>
              <span className="text-xs text-muted-foreground font-medium">{totalDeposited} {assetData.symbol}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
              Total borrows <InfoIcon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{totalBorrowedUSD}</span>
              <span className="text-xs text-muted-foreground font-medium">{totalBorrowed} {assetData.symbol}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
              Price <InfoIcon className="h-3.5 w-3.5" />
            </div>
            <span className="text-2xl font-bold">$1.00</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full lg:w-2/3">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-bold">Borrow</h2>
          <p className="text-muted-foreground text-sm">Borrow {assetData.symbol} against your collateral.</p>
        </div>

        <div className="flex flex-col gap-8 rounded-xl border border-border bg-card/30 p-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                Borrow APY <InfoIcon className="h-3.5 w-3.5" />
              </div>
              <span className="text-3xl font-bold text-destructive">{borrowApy}</span>
            </div>
            <div className="flex flex-col gap-4 md:col-span-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">Total borrowed <InfoIcon className="h-3.5 w-3.5" /></span>
                    <div className="flex flex-col items-end">
                        <span className="font-bold">{totalBorrowed} {assetData.symbol}</span>
                        <span className="text-xs text-muted-foreground">{totalBorrowedUSD}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">Available liquidity <InfoIcon className="h-3.5 w-3.5" /></span>
                    <div className="flex flex-col items-end">
                        <span className="font-bold">{availableLiquidity} {assetData.symbol}</span>
                        <span className="text-xs text-muted-foreground">{availableLiquidityUSD}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LogoSmall() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="currentColor"/>
            <path d="M17.5 7.5H6.5V9.5H17.5V7.5ZM17.5 11.5H6.5V13.5H17.5V11.5ZM17.5 15.5H6.5V17.5H17.5V15.5Z" fill="white"/>
        </svg>
    )
}
