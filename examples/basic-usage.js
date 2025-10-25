/**
 * Basic Usage Example for ForgeX Solana SDK
 *
 * This example demonstrates the fundamental usage of the ForgeX Solana SDK
 * including Jupiter swaps, connection management, and basic portfolio tracking.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");

async function basicUsageExample() {
  console.log("🚀 ForgeX Solana SDK - Basic Usage Example");

  try {
    // Initialize SDK with mainnet configuration
    const sdk = ForgeXSolanaSDK.mainnet({
      helius: process.env.HELIUS_API_KEY,
      tensor: process.env.TENSOR_API_KEY,
      birdeye: process.env.BIRDEYE_API_KEY,
    });

    console.log("✅ SDK initialized successfully");

    // Test connection
    const slot = await sdk.connection.getSlot();
    console.log("📡 Current slot:", slot);

    // Get Jupiter swap quote
    if (sdk.jupiter) {
      console.log("\n💱 Testing Jupiter Swap Quote...");
      try {
        const quote = await sdk.jupiter.getQuote({
          inputMint: "So11111111111111111111111111111111111111112", // SOL
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
          amount: 1000000000, // 1 SOL in lamports
          slippageBps: 50,
        });

        console.log("✅ Quote received:");
        console.log(`   Input: ${quote.inAmount} lamports`);
        console.log(`   Output: ${quote.outAmount} micro USDC`);
        console.log(`   Price Impact: ${quote.priceImpactPct}%`);
      } catch (error) {
        console.log("❌ Jupiter quote failed:", error.message);
      }
    }

    // Get token prices
    if (sdk.jupiter) {
      console.log("\n💰 Testing Price Fetching...");
      try {
        const prices = await sdk.jupiter.getPrices([
          "So11111111111111111111111111111111111111112", // SOL
        ]);

        console.log("✅ Prices received:");
        Object.entries(prices).forEach(([mint, data]) => {
          console.log(`   ${mint.slice(0, 8)}...: $${data.usdPrice}`);
        });
      } catch (error) {
        console.log("❌ Price fetch failed:", error.message);
      }
    }

    // Test portfolio overview
    console.log("\n📊 Testing Portfolio Overview...");
    try {
      const overview = await sdk.getMarketOverview();
      console.log("✅ Market overview:");
      console.log(`   SOL Price: $${overview.prices.sol}`);
      console.log(`   Network Slot: ${overview.network.slot}`);
    } catch (error) {
      console.log("❌ Portfolio overview failed:", error.message);
    }

    // Health check
    console.log("\n🏥 Running Health Check...");
    try {
      const health = await sdk.healthCheck();
      console.log("✅ Health check results:");
      console.log(`   Overall health: ${(health.overall * 100).toFixed(1)}%`);
      console.log(`   Connection: ${health.connection ? "✅" : "❌"}`);
      console.log(`   Jupiter: ${health.jupiter ? "✅" : "❌"}`);
      console.log(`   Kamino: ${health.kamino ? "✅" : "❌"}`);
      console.log(`   DexScreener: ${health.dexscreener ? "✅" : "❌"}`);
    } catch (error) {
      console.log("❌ Health check failed:", error.message);
    }
  } catch (error) {
    console.error("❌ Example failed:", error);
  }
}

// Enhanced example with wallet integration
async function walletIntegrationExample() {
  console.log("\n🔐 Wallet Integration Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    // Example wallet address (replace with actual wallet)
    const walletAddress = "11111111111111111111111111111112";

    console.log(`📱 Getting portfolio for: ${walletAddress.slice(0, 8)}...`);

    const portfolio = await sdk.getPortfolio(walletAddress);
    console.log("✅ Portfolio data:");
    console.log(`   SOL Balance: ${portfolio.solBalance} SOL`);
    console.log(
      `   Holdings: ${portfolio.holdings ? "Available" : "Not available"}`
    );
    console.log(
      `   Timestamp: ${new Date(portfolio.timestamp).toLocaleString()}`
    );
  } catch (error) {
    console.error("❌ Wallet integration failed:", error);
  }
}

// Run examples
async function main() {
  console.log("🌟 ForgeX Solana SDK Examples\n");

  await basicUsageExample();
  await walletIntegrationExample();

  console.log("\n✨ Examples completed!");
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  basicUsageExample,
  walletIntegrationExample,
};
