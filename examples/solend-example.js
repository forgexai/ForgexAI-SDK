/**
 * Solend Integration Example
 *
 * This example demonstrates how to interact with Solend protocol for lending and borrowing
 * through the ForgeX Solana SDK.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");

async function solendExample() {
  try {
    console.log("🏦 Solend Integration Example");
    console.log("================================\n");

    // Initialize the SDK
    const sdk = ForgeXSolanaSDK.mainnet();

    // Initialize Solend (fetch all pools and reserves)
    console.log("Initializing Solend...");
    await sdk.solend.initialize();
    console.log("✅ Solend initialized successfully\n");

    // Get all available lending pools
    const pools = sdk.solend.getPools();
    console.log("📊 Available Lending Pools:");
    Object.keys(pools).forEach((poolName) => {
      const pool = pools[poolName];
      console.log(`  • ${poolName}: ${pool.reserves.length} reserves`);
    });
    console.log();

    // Get reserves for the main pool
    const reserves = sdk.solend.getReserves("main");
    console.log("💰 Available Reserves in Main Pool:");
    reserves.forEach((reserve) => {
      console.log(`  • ${reserve.symbol}: ${reserve.name}`);
      console.log(`    Supply APY: ${reserve.supplyApy.toFixed(2)}%`);
      console.log(`    Borrow APY: ${reserve.borrowApy.toFixed(2)}%`);
      console.log(`    Utilization: ${reserve.utilization.toFixed(2)}%`);
      console.log(`    Total Supply: $${reserve.totalSupply.toFormat(2)}`);
      console.log(`    Total Borrow: $${reserve.totalBorrow.toFormat(2)}`);
      console.log();
    });

    // Example wallet (replace with your actual wallet)
    const exampleWallet = new PublicKey("11111111111111111111111111111112");

    console.log("👛 Wallet Analysis:");
    console.log(`Wallet: ${exampleWallet.toBase58()}`);

    // Get wallet assets
    const walletAssets = await sdk.solend.getWalletAssets(
      exampleWallet.toBase58()
    );
    console.log(`Found ${walletAssets.length} token accounts\n`);

    // Get markets overview
    const marketsOverview = sdk.solend.getMarketsOverview();
    console.log("📈 Markets Overview:");
    marketsOverview.forEach((market) => {
      console.log(`  • ${market.name}:`);
      console.log(`    Address: ${market.address}`);
      console.log(`    Total Supply: $${market.totalSupply.toFormat(2)}`);
      console.log(`    Total Borrow: $${market.totalBorrow.toFormat(2)}`);
      console.log(`    Reserves: ${market.reserves}`);
      console.log();
    });

    // Example: Build lending transactions (for demonstration)
    console.log("🔨 Building Example Transactions:");
    console.log("================================\n");

    try {
      // Build a deposit transaction for USDC
      console.log("Building USDC deposit transaction...");
      const depositAction = await sdk.solend.buildDepositTransaction(
        100, // 100 USDC
        "USDC",
        exampleWallet
      );
      console.log("✅ Deposit transaction built successfully");

      // You can get the transaction details like this:
      // const transaction = await depositAction.getVersionedTransaction();
      // console.log("Transaction ready for signing and sending");
    } catch (error) {
      console.log("⚠️  Deposit transaction build failed:", error.message);
    }

    try {
      // Build a borrow transaction for SOL
      console.log("Building SOL borrow transaction...");
      const borrowAction = await sdk.solend.buildBorrowTransaction(
        1, // 1 SOL
        "SOL",
        exampleWallet
      );
      console.log("✅ Borrow transaction built successfully");
    } catch (error) {
      console.log("⚠️  Borrow transaction build failed:", error.message);
    }

    try {
      // Build a repay transaction for SOL
      console.log("Building SOL repay transaction...");
      const repayAction = await sdk.solend.buildRepayTransaction(
        0.5, // 0.5 SOL
        "SOL",
        exampleWallet
      );
      console.log("✅ Repay transaction built successfully");
    } catch (error) {
      console.log("⚠️  Repay transaction build failed:", error.message);
    }

    try {
      // Build a withdraw transaction for USDC
      console.log("Building USDC withdraw transaction...");
      const withdrawAction = await sdk.solend.buildWithdrawTransaction(
        50, // 50 USDC
        "USDC",
        exampleWallet
      );
      console.log("✅ Withdraw transaction built successfully");
    } catch (error) {
      console.log("⚠️  Withdraw transaction build failed:", error.message);
    }

    console.log("\n🎯 Example Usage Complete!");
    console.log("================================");
    console.log("To actually execute transactions:");
    console.log("1. Use a real wallet with proper keypair");
    console.log("2. Implement transaction signing logic");
    console.log("3. Call sdk.solend.executeAction(action, sendTransaction)");
    console.log("\nExample execution code:");
    console.log(`
const signature = await sdk.solend.executeAction(
  depositAction,
  async (transaction) => {
    // Sign and send transaction with your wallet
    const signedTx = await wallet.signTransaction(transaction);
    const signature = await connection.sendTransaction(signedTx);
    await connection.confirmTransaction(signature);
    return signature;
  }
);
    `);
  } catch (error) {
    console.error("❌ Error in Solend example:", error);
  }
}

// Enhanced example with real wallet integration
async function solendRealWalletExample() {
  console.log("\n🔐 Real Wallet Integration Example");
  console.log("===================================\n");

  // This example shows how to integrate with a real wallet
  // You would need to implement actual wallet connection logic

  console.log("Steps for real wallet integration:");
  console.log("1. Connect to user's wallet (Phantom, Solflare, etc.)");
  console.log("2. Get wallet's public key");
  console.log("3. Build Solend actions");
  console.log("4. Request user to sign transactions");
  console.log("5. Send transactions to network");
  console.log();

  console.log("Example wallet integration pattern:");
  console.log(`
// With wallet adapter
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, signTransaction } = useWallet();

if (publicKey) {
  const depositAction = await sdk.solend.buildDepositTransaction(
    100,
    'USDC',
    publicKey
  );
  
  const signature = await sdk.solend.executeAction(
    depositAction,
    async (transaction) => {
      const signedTx = await signTransaction(transaction);
      return await connection.sendTransaction(signedTx);
    }
  );
}
  `);
}

// Best practices example
async function solendBestPractices() {
  console.log("\n💡 Solend Best Practices");
  console.log("========================\n");

  console.log("🔍 Before Lending/Borrowing:");
  console.log("• Check market conditions and APY rates");
  console.log("• Verify your collateral ratio");
  console.log("• Understand liquidation risks");
  console.log("• Monitor gas fees and network congestion");
  console.log();

  console.log("⚡ Transaction Tips:");
  console.log("• Always simulate transactions before sending");
  console.log("• Use appropriate slippage tolerance");
  console.log("• Monitor transaction status");
  console.log("• Keep some SOL for transaction fees");
  console.log();

  console.log("🛡️ Security Considerations:");
  console.log("• Never share your private keys");
  console.log("• Use hardware wallets for large amounts");
  console.log("• Verify contract addresses");
  console.log("• Test with small amounts first");
  console.log();

  console.log("📊 Risk Management:");
  console.log("• Diversify across multiple protocols");
  console.log("• Monitor liquidation thresholds");
  console.log("• Set up alerts for significant market movements");
  console.log("• Understand the protocol's tokenomics");
}

// Run the examples
async function main() {
  await solendExample();
  await solendRealWalletExample();
  await solendBestPractices();
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  solendExample,
  solendRealWalletExample,
  solendBestPractices,
};
