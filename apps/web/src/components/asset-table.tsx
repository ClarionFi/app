import type { SupportedAsset } from "@/config/assets"
import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { ArrowRightIcon } from "lucide-react"
import { usePoolState } from "@/hooks/use-pool-state"


type AssetTableProps = {
  assets: SupportedAsset[]
  mode: "deposit" | "borrow"
}

export function AssetTable({ assets, mode }: AssetTableProps) {
  const { poolState, isLoading } = usePoolState();
  const baseRoute = mode === "deposit" ? "/app/deposit" : "/app/borrow";

  const getStats = (assetId: string) => {
    const isActiveAsset = poolState?.assetContract?.includes(assetId) || (assetId === 'stx' && poolState?.assetContract === null); 
    
    if (isActiveAsset && poolState && !isLoading) {
      const decimals = assets.find(a => a.id === assetId)?.decimals || 6;
      const formatAmount = (amt: number) => (amt / (10 ** decimals)).toLocaleString(undefined, { maximumFractionDigits: 2 });
      
      const apyRaw = mode === "deposit" ? poolState.supplyApy : poolState.borrowApy;
      
      return { 
        apy: `${apyRaw.toFixed(2)}%`, 
        deposits: formatAmount(poolState.totalAssets), 
        liquidity: formatAmount(poolState.totalLiquidAssets), 
        usd: "--" 
      };
    }

    return { apy: "0.00%", deposits: "0.00", usd: "$0.00", liquidity: "0.00" };
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground/80">
              <th className="px-6 py-4 font-medium uppercase text-xs">Asset</th>
              <th className="px-6 py-4 font-medium uppercase text-xs">APY</th>
              <th className="px-6 py-4 font-medium uppercase text-xs">Total {mode === "deposit" ? "Deposited" : "Borrowed"}</th>
              <th className="px-6 py-4 font-medium uppercase text-xs">Liquidity</th>
              <th className="px-6 py-4 font-medium uppercase text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {assets.map((asset) => {
              const stats = getStats(asset.id);
              
              return (
                <tr key={asset.id} className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={asset.icon} 
                        alt={asset.symbol} 
                        className="h-10 w-10 shrink-0 rounded-full object-contain bg-muted"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{asset.name}</span>
                        <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{stats.apy}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium">{stats.deposits} {asset.symbol}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium">{stats.liquidity} {asset.symbol}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`${baseRoute}/$asset`} params={{ asset: asset.id }}>
                      <Button variant="outline" size="sm" className="gap-1">
                        {mode === "deposit" ? "Supply" : "Borrow"}
                        <ArrowRightIcon className="h-3 w-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
