import { connect, disconnect } from "@stacks/connect";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@workspace/ui/components/dialog";
import { toast } from "sonner";
import { CopyIcon, LogOutIcon, WalletIcon } from "lucide-react";
import { useUserData } from "@/hooks/use-user-data";

export const ConnectButton = () => {
	const { connected, stxAddress, syncLocalStorage } = useUserData();

	async function handleConnect() {
		if (connected) return;

		try {
			await connect();
			syncLocalStorage();
		} catch (error) {
			console.error("Connection error:", error);
		}
	}

	function handleDisconnect() {
		disconnect();
		syncLocalStorage();
	}

	function handleCopyAddress() {
		if (stxAddress) {
			navigator.clipboard.writeText(stxAddress);
			toast("Address copied to clipboard");
		}
	}

	if (connected) {
		return (
			<Dialog>
				<DialogTrigger
					render={<Button variant="outline" size="sm" />}
				>
					{stxAddress ? `${stxAddress.slice(0, 5)}...${stxAddress.slice(-4)}` : "Connected"}
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Your Wallet</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-4 py-4">
						{/* Wallet Address Status */}
						<div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
							<div className="flex items-center gap-3">
								<div className="rounded-full bg-primary/10 p-2 text-primary">
									<WalletIcon className="h-5 w-5" />
								</div>
								<div className="flex flex-col">
									<span className="text-sm font-medium">Stacks Address</span>
									<span className="font-mono text-xs text-muted-foreground">
										{stxAddress ? `${stxAddress.slice(0, 8)}...${stxAddress.slice(-8)}` : "Loading..."}
									</span>
								</div>
							</div>
							<Button variant="ghost" size="icon-sm" onClick={handleCopyAddress}>
								<CopyIcon className="h-4 w-4" />
							</Button>
						</div>

						{/* Wallet Balances List */}
						<div className="space-y-3">
							<h4 className="text-sm font-medium text-muted-foreground">Balances</h4>
							<div className="flex flex-col gap-2">
								<div className="flex items-center justify-between rounded-md border p-3">
									<span className="font-semibold">STX</span>
									<span className="font-mono">0.00</span>
								</div>
								<div className="flex items-center justify-between rounded-md border p-3">
									<span className="font-semibold">sBTC</span>
									<span className="font-mono">0.00</span>
								</div>
								<div className="flex items-center justify-between rounded-md border p-3">
									<span className="font-semibold">USDC</span>
									<span className="font-mono">0.00</span>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="sm:justify-start">
						{/* Wrapping our custom disconnect logic via base UI render prop logic */}
						<DialogClose
							render={
								<Button type="button" variant="destructive" className="w-full" onClick={handleDisconnect}>
                                    <LogOutIcon className="mr-2 h-4 w-4" /> Disconnect
                                </Button>
							}
						/>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Button size="sm" onClick={handleConnect}>
			Connect Wallet
		</Button>
	);
};
