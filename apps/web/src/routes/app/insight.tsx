import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/insight')({
  component: InsightRoute,
})

function InsightRoute() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex flex-col max-w-lg gap-4">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">Market Analytics</h2>
        <p className="text-muted-foreground">
          Insight into general protocol liquidity, historical APYs, and borrowing volume will live here.
        </p>
      </div>
    </div>
  )
}
