import { createFileRoute, Outlet } from '@tanstack/react-router'
import { NavBar } from '@/components/nav-bar'

export const Route = createFileRoute('/app')({
  component: AppRoute,
})

function AppRoute() {
  return (
    <main className="relative min-h-svh overflow-x-hidden bg-background text-foreground">
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8 md:px-10 md:pt-10">
        <NavBar />
        <div className="mt-8">
            <Outlet />
        </div>
      </div>
    </main>
  )
}
