import { createFileRoute } from '@tanstack/react-router'
import { AssetTable } from '@/components/asset-table'
import { ASSETS_LIST } from '@/config/assets'

export const Route = createFileRoute('/app/deposit/')({
  component: DepositRoute,
})

function DepositRoute() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">Deposit Markets</h2>
        <p className="text-muted-foreground">Supply assets into isolated money markets to begin earning yield.</p>
      </div>

      <AssetTable assets={ASSETS_LIST} mode="deposit" />
    </div>
  )
}
