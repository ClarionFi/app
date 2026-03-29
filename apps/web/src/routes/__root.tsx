import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "@workspace/ui/globals.css?url";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "ClarionFi | Bitcoin-Native Lending on Stacks",
			},
			{
				name: "description",
				content:
					"ClarionFi is a non-custodial lending protocol on Stacks for sBTC, STX, and USDC with isolated markets and fixed-rate design.",
			},
			{
				name: "talentapp:project_verification",
				content:
					"7cab342d5dbf7affef355dd38812c39f5c280b75d61225d43eb55a0aeb630de2e3a3654afecdfd87abf760f135e9099198509dee69710d70d1daab59c82770c0",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml",
			},
			{
				rel: "apple-touch-icon",
				href: "/favicon.svg",
			},
			{
				rel: "mask-icon",
				href: "/favicon.svg",
				color: "#f97316",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider defaultTheme="light" storageKey="clarionfi-theme">
					{children}
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}
