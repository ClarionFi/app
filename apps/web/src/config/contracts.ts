import { STACKS_MAINNET } from "@stacks/network";

export const STACKS_NETWORK_MODE = "mainnet";

export const network = STACKS_MAINNET;

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
