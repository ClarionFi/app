import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
} from "@stacks/transactions";
import { CONTRACTS, network } from "../src/config/contracts";
import { generateWallet } from "@stacks/wallet-sdk";

// Grab your private key from environment or replace it here
let senderKey = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";

if (senderKey === "YOUR_PRIVATE_KEY_HERE") {
  console.error("❌ Error: Missing PRIVATE_KEY. Please provide a valid mnemonic or hex-encoded Stacks private key in apps/web/.env.");
  process.exit(1);
}

async function updateOracle() {
  if (senderKey.includes(" ")) {
    console.log("Mnemonic detected, deriving private key...");
    const wallet = await generateWallet({ secretKey: senderKey, password: "" });
    senderKey = wallet.accounts[0].stxPrivateKey;
  }

  const [contractAddress, contractName] = CONTRACTS.clarionOracle.split(".");
  // Let's set a mock price of $2.50 per STX (using 6 decimals precision like the contract expects)
  // 1 STX = $2.50 -> 2,500,000 microUSD
  const mockStxPrice = 2500000; 

  console.log(`=== Updating STX Price in Oracle ===`);
  console.log(`Contract: ${contractAddress}.${contractName}`);
  
  try {
    const txOptions = {
      contractAddress,
      contractName,
      functionName: "set-stx-price",
      functionArgs: [uintCV(mockStxPrice)],
      senderKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow, 
    };

    const tx = await makeContractCall(txOptions);
    const txResponse = await broadcastTransaction({ transaction: tx });
    
    console.log("\n✅ Oracle Update Broadcasted Successfully!");
    console.log(`TxID: ${txResponse.txid}`);
    console.log(`Track it: https://explorer.hiro.so/txid/${txResponse.txid}?chain=mainnet`);
    console.log(`\nNote: Once this confirms, your withdrawal will succeed!`);
    
  } catch (err) {
    console.error("\n❌ Oracle update failed:", err);
  }
}

updateOracle()
  .then(() => console.log("\nScript execution completed."))
  .catch((err) => console.error(err));
