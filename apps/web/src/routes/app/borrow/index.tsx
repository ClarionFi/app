import { createFileRoute } from '@tanstack/react-router'
import { AssetTable } from '@/components/asset-table'
import { ASSETS_LIST } from '@/config/assets'

export const Route = createFileRoute('/app/borrow/')({
  component: BorrowRoute,
})

function BorrowRoute() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">Borrow Markets</h2>
        <p className="text-muted-foreground">Borrow against your supplied collateral using a fixed-rate model.</p>
      </div>

      <AssetTable assets={ASSETS_LIST} mode="borrow" />
    </div>
  )
}
