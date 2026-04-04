import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  contractPrincipalCV,
} from "@stacks/transactions";
import { CONTRACTS, network } from "../src/config/contracts";
import { generateWallet } from "@stacks/wallet-sdk";

// The private key must belong to the contract owner (deployer) SP3EA3JG74CT2JNDFARGPRM70J6BJ360X7WM9YHN3
let senderKey = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";

if (senderKey === "YOUR_PRIVATE_KEY_HERE") {
  console.error("❌ Error: Missing PRIVATE_KEY. Please provide the deployer's mnemonic or hex key in apps/web/.env.");
  process.exit(1);
}

async function initializePool() {
  if (senderKey.includes(" ")) {
    console.log("Mnemonic detected, deriving private key...");
    const wallet = await generateWallet({ secretKey: senderKey, password: "" });
    senderKey = wallet.accounts[0].stxPrivateKey;
  }

  const [poolAddress, poolName] = CONTRACTS.clarionPool.split(".");
  const [assetAddress, assetName] = CONTRACTS.mockFT.split(".");

  console.log(`=== Initializing Pool ${poolAddress}.${poolName} ===`);
  console.log(`Asset Token: ${assetAddress}.${assetName}`);
  
  try {
    const txOptions = {
      contractAddress: poolAddress,
      contractName: poolName,
      functionName: "initialize",
      // Passing the asset-token trait
      functionArgs: [contractPrincipalCV(assetAddress, assetName)],
      senderKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny, // No tokens are transferred during initialization
    };

    const tx = await makeContractCall(txOptions);
    const txResponse = await broadcastTransaction({ transaction: tx });
    
    console.log("\n✅ Initialization Transaction Broadcasted Successfully!");
    console.log(`TxID: ${txResponse.txid}`);
    console.log(`Track it: https://explorer.hiro.so/txid/${txResponse.txid}?chain=mainnet`);
    console.log("(Wait 10-30m for it to confirm before depositing)");
    
  } catch (err) {
    console.error("\n❌ Initialization failed:", err);
  }
}

initializePool()
  .then(() => console.log("\nScript complete."))
  .catch((err) => console.error(err));
