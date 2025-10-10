/**
 * Elusiv Privacy Integration Example
 *
 * This example demonstrates how to use Elusiv for privacy-preserving transactions
 * through the ForgeX Solana SDK.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");

async function elusivExample() {
  try {
    console.log("🔒 Elusiv Privacy Integration Example");
    console.log("====================================\n");

    // Initialize the SDK
    const sdk = ForgeXSolanaSDK.mainnet();

    // Example wallet (replace with your actual wallet)
    const exampleWallet = new PublicKey("11111111111111111111111111111112");

    console.log("🕵️ Privacy-Preserving Transactions with Elusiv");
    console.log(`Wallet: ${exampleWallet.toBase58()}\n`);

    // Check balance info
    console.log("📊 Checking Elusiv Balance Information:");
    try {
      const balanceInfo = await sdk.elusiv.getBalanceInfo(
        exampleWallet.toBase58()
      );
      console.log("✅ Balance info retrieved:");
      console.log(`  Private Balance: ${balanceInfo.privateBalance} lamports`);
      console.log(`  Public Balance: ${balanceInfo.publicBalance} lamports`);
      console.log(`  Total Balance: ${balanceInfo.totalBalance} lamports`);
    } catch (error) {
      console.log("⚠️  Balance info retrieval failed:", error.message);
    }
    console.log();

    // Example: Top up private balance
    console.log("💰 Example: Top Up Private Balance");
    console.log("==================================");
    try {
      const topUpParams = {
        amount: 1000000, // 1 SOL in lamports
        tokenMint: "So11111111111111111111111111111111111111112", // SOL mint
      };

      console.log("Building top-up transaction...");
      console.log(`Amount: ${topUpParams.amount / 1e9} SOL`);

      // In a real application, you would execute this:
      // const result = await sdk.elusiv.topUp(topUpParams);
      console.log("✅ Top-up transaction would be built here");
    } catch (error) {
      console.log("⚠️  Top-up build failed:", error.message);
    }
    console.log();

    // Example: Private transfer
    console.log("🤫 Example: Private Transfer");
    console.log("============================");
    try {
      const transferParams = {
        amount: 500000, // 0.5 SOL in lamports
        tokenMint: "So11111111111111111111111111111111111111112", // SOL mint
        recipient: new PublicKey("22222222222222222222222222222222"), // Example recipient
        memo: "Private payment for services",
      };

      console.log("Building private transfer...");
      console.log(`Amount: ${transferParams.amount / 1e9} SOL`);
      console.log(`Recipient: ${transferParams.recipient.toBase58()}`);
      console.log(`Memo: "${transferParams.memo}"`);

      // In a real application, you would execute this:
      // const result = await sdk.elusiv.createPrivateTransfer(transferParams);
      console.log("✅ Private transfer transaction would be built here");
    } catch (error) {
      console.log("⚠️  Private transfer build failed:", error.message);
    }
    console.log();

    // Example: Withdraw from private balance
    console.log("🏦 Example: Withdraw from Private Balance");
    console.log("========================================");
    try {
      const withdrawParams = {
        amount: 250000, // 0.25 SOL in lamports
        tokenMint: "So11111111111111111111111111111111111111112", // SOL mint
      };

      console.log("Building withdrawal transaction...");
      console.log(`Amount: ${withdrawParams.amount / 1e9} SOL`);

      // In a real application, you would execute this:
      // const result = await sdk.elusiv.withdraw(withdrawParams);
      console.log("✅ Withdrawal transaction would be built here");
    } catch (error) {
      console.log("⚠️  Withdrawal build failed:", error.message);
    }
    console.log();

    console.log("🎯 Elusiv Privacy Example Complete!");
    console.log("===================================");
    console.log("\nKey Privacy Features:");
    console.log("• 🔒 Private balances hidden from public view");
    console.log("• 🤫 Anonymous transfers between users");
    console.log("• 🛡️ Zero-knowledge proof technology");
    console.log("• 💰 Support for multiple SPL tokens");
    console.log("• 🔄 Seamless integration with existing wallets");
  } catch (error) {
    console.error("❌ Error in Elusiv example:", error);
  }
}

// Privacy best practices
async function elusivBestPractices() {
  console.log("\n🛡️ Elusiv Privacy Best Practices");
  console.log("=================================\n");

  console.log("🔐 Privacy Considerations:");
  console.log("• Always verify recipient addresses before transfers");
  console.log("• Use meaningful but non-identifying memos");
  console.log("• Consider transaction timing to avoid pattern analysis");
  console.log("• Mix transaction amounts to improve privacy");
  console.log();

  console.log("💡 Usage Tips:");
  console.log("• Top up private balance in larger amounts to reduce fees");
  console.log("• Keep some SOL in public balance for transaction fees");
  console.log("• Use Elusiv for sensitive transactions only");
  console.log("• Regular transactions can still use standard Solana transfers");
  console.log();

  console.log("⚠️ Important Notes:");
  console.log("• Private transactions still have network fees");
  console.log("• Zero-knowledge proofs take additional computation time");
  console.log("• Not all exchanges support private transactions");
  console.log("• Always comply with local regulations");
  console.log();

  console.log("🔧 Technical Details:");
  console.log("• Elusiv uses zk-SNARKs for privacy");
  console.log("• Supports multiple token types (SOL, USDC, etc.)");
  console.log("• Private state is maintained off-chain");
  console.log("• Proofs are verified on-chain for security");
}

// Real-world integration example
async function elusivIntegrationExample() {
  console.log("\n🌐 Real-World Integration Example");
  console.log("==================================\n");

  console.log("Example: Private Payroll System");
  console.log("-------------------------------");
  console.log(`
// Company paying employees privately
const payEmployees = async (employees) => {
  const sdk = ForgeXSolanaSDK.mainnet();
  
  for (const employee of employees) {
    try {
      // Create private transfer for each employee
      const result = await sdk.elusiv.createPrivateTransfer({
        amount: employee.salary * 1e9, // Convert to lamports
        tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        recipient: employee.wallet,
        memo: \`Salary payment \${new Date().toISOString().slice(0, 7)}\`
      });
      
      console.log(\`✅ Paid \${employee.name}: \${employee.salary} USDC\`);
    } catch (error) {
      console.error(\`❌ Failed to pay \${employee.name}:\`, error);
    }
  }
};
  `);

  console.log("Example: Anonymous Donations");
  console.log("---------------------------");
  console.log(`
// Anonymous donation platform
const makeDonation = async (charityWallet, amount) => {
  const sdk = ForgeXSolanaSDK.mainnet();
  
  const result = await sdk.elusiv.createPrivateTransfer({
    amount: amount * 1e9,
    tokenMint: "So11111111111111111111111111111111111111112", // SOL
    recipient: charityWallet,
    memo: "Anonymous donation for good cause"
  });
  
  return result;
};
  `);

  console.log("Example: Private Commerce");
  console.log("------------------------");
  console.log(`
// E-commerce with private payments
const processPrivatePayment = async (orderDetails) => {
  const sdk = ForgeXSolanaSDK.mainnet();
  
  // Customer pays merchant privately
  const payment = await sdk.elusiv.createPrivateTransfer({
    amount: orderDetails.totalPrice * 1e6, // USDC has 6 decimals
    tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    recipient: orderDetails.merchantWallet,
    memo: \`Order #\${orderDetails.orderId}\`
  });
  
  return payment;
};
  `);
}

// Run the examples
async function main() {
  await elusivExample();
  await elusivBestPractices();
  await elusivIntegrationExample();
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  elusivExample,
  elusivBestPractices,
  elusivIntegrationExample,
};
