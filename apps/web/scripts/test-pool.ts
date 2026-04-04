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
// (Make sure not to commit your real private key!)
let senderKey = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";

if (senderKey === "YOUR_PRIVATE_KEY_HERE") {
  console.error("❌ Error: Missing PRIVATE_KEY. Please provide a valid mnemonic or hex-encoded Stacks private key in apps/web/.env.");
  process.exit(1);
}

async function testPool() {
  if (senderKey.includes(" ")) {
    console.log("Mnemonic detected, deriving private key...");
    const wallet = await generateWallet({ secretKey: senderKey, password: "" });
    senderKey = wallet.accounts[0].stxPrivateKey;
  } else if (!/^[0-9a-fA-F]{64}(01)?$/.test(senderKey)) {
    console.error("❌ Error: PRIVATE_KEY is neither a valid mnemonic nor a hex-encoded Stacks private key.");
    process.exit(1);
  }

  const [contractAddress, contractName] = CONTRACTS.clarionPool.split(".");
  const depositAmount = 1000000; // 1 STX (in microSTX)

  console.log("=== Testing Deposit STX Collateral ===");
  try {
    const depositTxOptions = {
      contractAddress,
      contractName,
      functionName: "deposit-collateral",
      functionArgs: [uintCV(depositAmount)],
      senderKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const tx = await makeContractCall(depositTxOptions);
    const txResponse = await broadcastTransaction({ transaction: tx });
    console.log("Deposit Transaction ID:", txResponse.txid);

    // Normally you'd want to wait for confirmation, but here we just show the withdraw construction too
    console.log("Deposit submitted successfully!");
  } catch (err) {
    console.error("Deposit failed:", err);
  }

  console.log("\n=== Testing Withdraw STX Collateral ===");
  try {
    const withdrawAmount = 500000; // 0.5 STX
    const withdrawTxOptions = {
      contractAddress,
      contractName,
      functionName: "withdraw-collateral",
      functionArgs: [uintCV(withdrawAmount)],
      senderKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow, // Can restrict later via proper PostConditions
    };

    const withdrawTx = await makeContractCall(withdrawTxOptions);
    const withdrawResponse = await broadcastTransaction({ transaction: withdrawTx });
    console.log("Withdraw Transaction ID:", withdrawResponse.txid);
  } catch (err) {
    console.error("Withdraw failed:", err);
  }
}

testPool()
  .then(() => console.log("\nTest script finished."))
  .catch((err) => console.error(err));
