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

async function withdrawStx() {
  if (senderKey.includes(" ")) {
    console.log("Mnemonic detected, deriving private key...");
    const wallet = await generateWallet({ secretKey: senderKey, password: "" });
    senderKey = wallet.accounts[0].stxPrivateKey;
  } else if (!/^[0-9a-fA-F]{64}(01)?$/.test(senderKey)) {
    console.error("❌ Error: PRIVATE_KEY is neither a valid mnemonic nor a hex-encoded Stacks private key.");
    process.exit(1);
  }

  const [contractAddress, contractName] = CONTRACTS.clarionPool.split(".");
  // We'll withdraw the 0.1 STX you previously deposited
  const withdrawAmount = 100000; // 0.1 STX (in microSTX, 1 STX = 1,000,000 microSTX)

  console.log(`=== Withdrawing 0.1 STX (${withdrawAmount} microSTX) Collateral ===`);
  console.log(`Network: ${network.client.baseUrl}`);
  console.log(`Contract: ${contractAddress}.${contractName}`);
  
  try {
    const withdrawTxOptions = {
      contractAddress,
      contractName,
      functionName: "withdraw-collateral",
      functionArgs: [uintCV(withdrawAmount)],
      senderKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      // We use Allow so we don't have to perfectly craft the pool's Stacks transfer post condition in this Dev Script
      postConditionMode: PostConditionMode.Allow, 
    };

    const tx = await makeContractCall(withdrawTxOptions);
    const txResponse = await broadcastTransaction({ transaction: tx });
    
    console.log("\n✅ Withdrawal Transaction Broadcasted Successfully!");
    console.log(`TxID: ${txResponse.txid}`);
    console.log(`You can track it here: https://explorer.hiro.so/txid/${txResponse.txid}?chain=mainnet`);
    
  } catch (err) {
    console.error("\n❌ Withdrawal failed:", err);
  }
}

withdrawStx()
  .then(() => console.log("\nScript execution completed."))
  .catch((err) => console.error(err));
