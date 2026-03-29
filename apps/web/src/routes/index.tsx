import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	ArrowRight,
	Bitcoin,
	BookOpenCheck,
	Building2,
	Check,
	Clock3,
	DatabaseZap,
	ShieldCheck,
} from "lucide-react";
import { NavBar } from "@/components/nav-bar";

export const Route = createFileRoute("/")({ component: App });

const principles = [
	{
		title: "Bitcoin-Native Liquidity",
		description:
			"Supply and borrow sBTC, STX, and USDC with isolated risk per market instead of one shared contagion pool.",
		icon: Bitcoin,
	},
	{
		title: "Fixed-Rate, Predictable Credit",
		description:
			"Borrowers can lock in clearer repayment expectations while lenders target stable yield behavior.",
		icon: Clock3,
	},
	{
		title: "Trustless Clarity Execution",
		description:
			"Core logic runs in Clarity contracts with transparent rules and non-custodial user control from day one.",
		icon: ShieldCheck,
	},
];

const stats = [
	{ label: "Built On", value: "Stacks" },
	{ label: "Model", value: "Isolated Markets" },
	{ label: "Design", value: "Fixed-Rate First" },
];

const mechanics = [
	"Supply supported collateral assets into isolated markets.",
	"Borrow against collateral using explicit risk limits per market.",
	"Interest and risk parameters update through deterministic on-chain logic.",
	"Liquidations and repayments keep each market solvent without cross-pool spillover.",
];

const references = [
	{
		title: "Compound V2",
		copy: "Pooled lending primitives and utilization-based interest foundations.",
		icon: DatabaseZap,
	},
	{
		title: "Aave V3",
		copy: "Modern risk architecture and modular market execution patterns.",
		icon: Building2,
	},
	{
		title: "Zest + Arkadiko",
		copy: "Production Clarity patterns for Stacks-native deployment realities.",
		icon: BookOpenCheck,
	},
];

function App() {
	return (
		<main className="relative min-h-svh overflow-x-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_20%_10%,var(--color-primary),transparent_60%),radial-gradient(circle_at_80%_0%,var(--color-ring),transparent_50%)] opacity-20 dark:opacity-10" />
				<div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
			</div>

			<div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8 md:px-10 md:pt-10">
				<NavBar />

				<section className="mb-20">
					<Badge variant="outline" className="mb-4 py-1 tracking-wide text-muted-foreground bg-background/70 backdrop-blur border-border/70">
						Non-Custodial Lending on Bitcoin&apos;s Most Active L2
					</Badge>
					<h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-balance md:text-6xl">
						Fixed-rate lending on Stacks.
						<span className="block text-primary">
							Built for Bitcoin-backed assets.
						</span>
					</h1>
					<p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
						ClarionFi is a Stacks-native money market where users supply and
						borrow Bitcoin-backed assets with isolated risk, fixed-rate intent,
						and transparent Clarity contracts.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-3">
						<Button className="group">
							Start Supplying
							<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</Button>
						<Button variant="outline">Read Litepaper</Button>
					</div>
					<div className="mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
						{stats.map((stat) => (
							<div
								className="rounded-xl border border-border/70 bg-card/80 px-4 py-4 backdrop-blur"
								key={stat.label}
							>
								<p className="text-2xl font-semibold tracking-tight">
									{stat.value}
								</p>
								<p className="text-sm text-muted-foreground">{stat.label}</p>
							</div>
						))}
					</div>
				</section>

				<section className="mb-20" id="features">
					<div className="mb-8">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
							Protocol Overview
						</p>
						<h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
							Designed for the lending gap in the Stacks ecosystem.
						</h2>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						{principles.map((feature) => (
							<article
								className="rounded-2xl border border-border/70 bg-card p-6"
								key={feature.title}
							>
								<div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
									<feature.icon className="size-5" />
								</div>
								<h3 className="mb-2 text-lg font-semibold tracking-tight">
									{feature.title}
								</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{feature.description}
								</p>
							</article>
						))}
					</div>
				</section>

				<section
					className="mb-20 rounded-3xl border border-border/70 bg-secondary/35 p-6 md:p-10"
					id="workflow"
				>
					<div className="grid gap-10 md:grid-cols-2">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
								Core Mechanics
							</p>
							<h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
								Simple lending flow, strict market isolation.
							</h2>
							<p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
								ClarionFi keeps v1 focused: supply, borrow, repay, and liquidate
								with deterministic risk rules. Each market stands on its own so
								risk does not automatically leak across the protocol.
							</p>
						</div>
						<div className="space-y-4">
							{mechanics.map((item) => (
								<div className="flex items-start gap-3" key={item}>
									<div className="mt-0.5 rounded-full bg-background p-1">
										<Check className="size-3.5 text-primary" />
									</div>
									<p className="text-sm leading-relaxed text-foreground/90">
										{item}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section
					className="rounded-3xl border border-border/70 bg-card px-6 py-10 md:px-10"
					id="pricing"
				>
					<div className="mb-8 text-center">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
							Architecture Direction
						</p>
						<h2 className="font-heading mx-auto mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
							Battle-tested design patterns, adapted for Stacks.
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
							The protocol direction pulls proven mechanics from Compound and
							Aave, then applies Stacks-native Clarity patterns learned from
							live systems.
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						{references.map((item) => (
							<article
								className="rounded-2xl border border-border/70 bg-background p-5"
								key={item.title}
							>
								<div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
									<item.icon className="size-4.5" />
								</div>
								<h3 className="text-base font-semibold tracking-tight">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{item.copy}
								</p>
							</article>
						))}
					</div>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<Button>Explore Documentation</Button>
						<Button variant="outline">View Contracts</Button>
					</div>
				</section>
			</div>
		</main>
	);
}
