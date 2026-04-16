import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { SUPPORTED_ASSETS } from '@/config/assets'
import { Button } from '@workspace/ui/components/button'
import { ArrowLeftIcon, InfoIcon } from 'lucide-react'
import { DepositDialog } from '@/components/deposit-dialog'
import { BorrowDialog } from '@/components/borrow-dialog'
import { usePoolState } from '@/hooks/use-pool-state'

export const Route = createFileRoute('/app/deposit/$asset')({
  component: AssetDepositView,
})

function AssetDepositView() {
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

  const isActiveAsset = poolState?.assetContract?.includes(assetData.id) || assetData.id === 'stx';
  const formatAmount = (amt: number) => (amt / (10 ** assetData.decimals)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatUSD = (amt: number) => `$${(amt / (10 ** assetData.decimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const getAssetTotal = () => {
    if (!isActiveAsset || !poolState) return 0;
    return assetData.id === 'stx' ? poolState.totalStxCollateral : poolState.totalAssets;
  };

  const totalDepositedRaw = getAssetTotal();
  const totalDeposited = formatAmount(totalDepositedRaw);
  const totalDepositedUSD = formatUSD(totalDepositedRaw);

  const totalBorrowed = isActiveAsset && poolState ? formatAmount(poolState.totalDebt) : "0.00";
  const supplyApy = isActiveAsset && poolState ? `${poolState.supplyApy.toFixed(2)}%` : "0.00%";
  const totalBorrowedUSD = isActiveAsset && poolState ? formatUSD(poolState.totalDebt) : "$0.00";

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <Link to="/app" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit -ml-2 p-2 rounded-lg hover:bg-muted/50">
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Back to markets</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 shrink-0 rounded-full bg-background border border-border flex items-center justify-center p-2 shadow-inner">
              <img 
                src={assetData.icon} 
                alt={assetData.symbol} 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
                {assetData.name} <span className="text-muted-foreground text-xl font-normal">{assetData.symbol}</span>
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                Asset on <span className="flex items-center gap-1 font-medium text-foreground"><LogoSmall /> Stacks Mainnet</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-40 mt-4 md:mt-0">
            <DepositDialog asset={assetData} />
            <BorrowDialog asset={assetData} />
          </div>
        </div>
      </div>

      {/* Global Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5 p-5 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            Price <InfoIcon className="h-3.5 w-3.5" />
          </div>
          <span className="text-2xl font-bold text-foreground">$1.00</span>
        </div>
        <div className="flex flex-col gap-1.5 p-5 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            Total deposits <InfoIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">{totalDepositedUSD}</span>
            <span className="text-sm text-muted-foreground font-medium">{totalDeposited} {assetData.symbol}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 p-5 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            Total borrows <InfoIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">{totalBorrowedUSD}</span>
            <span className="text-sm text-muted-foreground font-medium">{totalBorrowed} {assetData.symbol}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 p-5 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            Utilization Rate <InfoIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">0.00%</span>
            <span className="text-sm text-muted-foreground font-medium">Optimal: 80%</span>
          </div>
        </div>
      </div>

      {/* Main Focus Area (Deposit) */}
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Deposit {assetData.symbol}</h2>
          <p className="text-muted-foreground text-sm max-w-2xl">Deposit {assetData.symbol} into the ClarionFi protocol to earn yield and collateralize your position to unlock borrowing power.</p>
        </div>

        <div className="flex flex-col gap-8 rounded-2xl border border-border bg-gradient-to-b from-card/30 to-background p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
            <div className="flex flex-col gap-2 p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                <span>Deposit APY</span>
                <InfoIcon className="h-4 w-4 opacity-70" />
              </div>
              <span className="text-4xl font-bold text-primary">{supplyApy}</span>
            </div>
            <div className="flex flex-col gap-5 md:col-span-2">
                <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">Total deposits <InfoIcon className="h-3.5 w-3.5" /></span>
                    <div className="flex flex-col items-end">
                        <span className="font-semibold text-foreground text-base">{totalDeposited} {assetData.symbol}</span>
                        <span className="text-xs text-muted-foreground">{totalDepositedUSD}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center py-3">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">Deposit capacity <InfoIcon className="h-3.5 w-3.5" /></span>
                    <div className="flex flex-col items-end">
                        <span className="font-semibold text-foreground text-base">Unlimited</span>
                        <span className="text-xs text-muted-foreground">--</span>
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

