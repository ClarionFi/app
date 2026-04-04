import { useState, useEffect, useCallback } from "react";
import { getLocalStorage, isConnected, request } from "@stacks/connect";

export type StacksAddress = { address: string };
export type StacksUserData = {
	addresses?: {
		stx?: StacksAddress[];
		btc?: StacksAddress[];
	};
};

export type FullAccount = {
	address: string;
	publicKey: string;
	gaiaHubUrl?: string;
};

export function useUserData() {
	const [connected, setConnected] = useState<boolean>(false);
	const [stxAddress, setStxAddress] = useState<string | null>(null);
	const [btcAddress, setBtcAddress] = useState<string | null>(null);
	const [fullAccount, setFullAccount] = useState<FullAccount | null>(null);
	const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);

	// Synchronize internal state with Stacks connect's cached session
	const syncLocalStorage = useCallback(() => {
		if (isConnected()) {
			setConnected(true);
			const userData = getLocalStorage() as StacksUserData;

			if (userData?.addresses) {
				if (userData.addresses.stx?.[0]?.address) {
					setStxAddress(userData.addresses.stx[0].address);
				}
				if (userData.addresses.btc?.[0]?.address) {
					setBtcAddress(userData.addresses.btc[0].address);
				}
			}
		} else {
			setConnected(false);
			setStxAddress(null);
			setBtcAddress(null);
			setFullAccount(null);
		}
	}, []);

	// Run synchronization upon component mounting
	useEffect(() => {
		syncLocalStorage();
	}, [syncLocalStorage]);

	// Extracurricular call to securely ping the extension for explicit wallet public keys & Gaia routing
	const fetchFullAccountDetails = useCallback(async () => {
		if (!isConnected()) return null;

		setIsLoadingAccounts(true);
		try {
			// Initiates an RPC request pointing to the wallet
			const accountsObj = await request("stx_getAccounts");

			// @ts-ignore - Supressing dynamic RPC structural typescript definitions
			const primaryAccount = accountsObj?.addresses?.[0];
			if (primaryAccount) {
				const accountData = primaryAccount as FullAccount;
				setFullAccount(accountData);
				return accountData;
			}
		} catch (error) {
			console.error("Failed to fetch full account details:", error);
		} finally {
			setIsLoadingAccounts(false);
		}
		return null;
	}, []);

	return {
		connected,
		stxAddress,
		btcAddress,
		fullAccount,
		isLoadingAccounts,
		syncLocalStorage,
		fetchFullAccountDetails,
	};
}
