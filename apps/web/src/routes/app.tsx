import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { NavBar } from '@/components/nav-bar'

export const Route = createFileRoute('/app')({
  component: AppRoute,
})

function AppRoute() {
  return (
    <main className="relative min-h-svh overflow-x-hidden bg-background text-foreground">
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8 md:px-10 md:pt-10">
        <NavBar />
        <div className="flex w-full flex-col items-center justify-center pt-32 text-center">
          <h1 className="mb-4 font-heading text-4xl font-semibold tracking-tight md:text-5xl">Coming Soon</h1>
          <p className="mb-8 max-w-md text-muted-foreground">
            The ClarionFi isolated money markets are currently undergoing rigorous security testing directly on Bitcoin's L2. 
          </p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
