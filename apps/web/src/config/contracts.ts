import { StacksMainnet } from "@stacks/network";

export const STACKS_NETWORK_MODE = "mainnet";

export const network = new StacksMainnet();

export const DEPLOYER_ADDRESSES = {
  mainnet: "SP3EA3JG74CT2JNDFARGPRM70J6BJ360X7WM9YHN3",
};

export const currentDeployer = DEPLOYER_ADDRESSES.mainnet;

export const CONTRACTS = {
  clarionPool: `${currentDeployer}.clarion-pool`,
  clarionOracle: `${currentDeployer}.clarion-oracle`,
  mockFT: `${currentDeployer}.mock-ft`,
  sip010Trait: `${currentDeployer}.sip-010-trait`,
};

// We don't distinctly use an "ABI" file for Stacks in the traditional EVM JSON sense, 
// but Clarinet auto-generates TypeScript interfaces for contracts if we run `clarinet generate`.
// For standard arbitrary interactions, we utilize the contract name and functions via @stacks/transactions or @stacks/network.
