import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";

export function NavBar() {
	const location = useLocation();
	const isAppRoute = location.pathname.startsWith("/app");

	return (
		<header className="mb-14 flex items-center justify-between">
			<Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
				<div className="flex size-8 items-center justify-center text-foreground">
					<Logo className="h-6 w-auto" />
				</div>
				<span className="font-heading text-base font-semibold tracking-tight">
					ClarionFi
				</span>
			</Link>
			
			{!isAppRoute && (
				<nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
					<a className="transition-colors hover:text-foreground" href="#features">
						Overview
					</a>
					<a className="transition-colors hover:text-foreground" href="#workflow">
						Mechanics
					</a>
					<a className="transition-colors hover:text-foreground" href="#pricing">
						Build
					</a>
				</nav>
			)}

			<div className="flex items-center gap-2">
				<ModeToggle />
				{isAppRoute ? (
					<Button size="sm">Connect Wallet</Button>
				) : (
					<Link to="/app">
						<Button size="sm">Launch App</Button>
					</Link>
				)}
			</div>
		</header>
	);
}
