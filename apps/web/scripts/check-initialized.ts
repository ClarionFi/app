import { fetchCallReadOnlyFunction, cvToJSON } from "@stacks/transactions";
import { CONTRACTS, network } from "../src/config/contracts";

async function main() {
  const [contractAddress, contractName] = CONTRACTS.clarionPool.split(".");
  const result = await fetchCallReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: "get-pool-state",
    functionArgs: [],
    senderAddress: contractAddress,
  });
  console.log(JSON.stringify(cvToJSON(result), null, 2));
}

main();
