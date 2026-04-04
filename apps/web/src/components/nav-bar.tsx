import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { ConnectButton } from "./connect-button";

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
			
			<nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
				{isAppRoute ? (
					<>
						<Link to="/app" className="transition-colors hover:text-foreground active:text-foreground">
							Deposit
						</Link>
						<Link to="/app/borrow" className="transition-colors hover:text-foreground">
							Borrow
						</Link>
						<Link to="/app/insight" className="transition-colors hover:text-foreground">
							Insight
						</Link>
					</>
				) : (
					<>
						<a className="transition-colors hover:text-foreground" href="#features">
							Overview
						</a>
						<a className="transition-colors hover:text-foreground" href="#workflow">
							Mechanics
						</a>
						<a className="transition-colors hover:text-foreground" href="#pricing">
							Build
						</a>
					</>
				)}
			</nav>

			<div className="flex items-center gap-2">
				<ModeToggle />
				{isAppRoute ? (
					<ConnectButton/>
				) : (
					<Link to="/app">
						<Button size="sm">Launch App</Button>
					</Link>
				)}
			</div>
		</header>
	);
}
