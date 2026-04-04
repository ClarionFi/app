import { fetchCallReadOnlyFunction, cvToJSON } from "@stacks/transactions";
import { CONTRACTS, network } from "../src/config/contracts";

async function getTotalDeposits() {
  const [contractAddress, contractName] = CONTRACTS.clarionPool.split(".");
  const fullContractId = `${contractAddress}.${contractName}`;

  console.log("Fetching global deposit stats for:", fullContractId);
  console.log("Network:", network.client.baseUrl);

  try {
    // 1. Fetch SIP-010 Total Assets from the smart contract state
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-pool-state",
      functionArgs: [],
      senderAddress: contractAddress, // safe read-only proxy
    });

    const poolState = cvToJSON(result);
    if (poolState && poolState.success) {
      const data = poolState.value.value;
      const totalAssets = Number(data['total-assets'].value);
      console.log(`\n✅ Pool Asset Token Deposits (SIP-010):`);
      console.log(`Amount (in raw decimals): ${totalAssets}`);
    } else {
      console.error("\n❌ Error reading pool state from contract");
    }

    // 2. Fetch STX Collateral Balance from the contract's Stacks account balance
    const accountsApiUrl = `${network.client.baseUrl}/extended/v1/address/${fullContractId}/balances`;
    const stxBalanceRes = await fetch(accountsApiUrl);
    const balances = await stxBalanceRes.json();
    
    if (balances && balances.stx) {
      const stxCollateral = Number(balances.stx.balance) / 1000000;
      console.log(`\n✅ Pool STX Collateral Deposits:`);
      console.log(`Amount: ${stxCollateral} STX`);
    } else {
      console.log("\n❌ Could not fetch STX collateral balance");
    }

  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

getTotalDeposits()
  .then(() => console.log("\nDone."))
  .catch((err) => console.error(err));
