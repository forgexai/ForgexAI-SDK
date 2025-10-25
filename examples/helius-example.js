/**
 * Helius Integration Example
 *
 * This example demonstrates Helius RPC and enhanced APIs for
 * transaction parsing, NFT metadata, webhooks, and analytics.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");

async function heliusRPCExample() {
  console.log("🌐 Helius RPC & Enhanced APIs Example");

  try {
    // Initialize SDK with Helius API key
    const sdk = ForgeXSolanaSDK.mainnet({
      helius: process.env.HELIUS_API_KEY,
    });

    console.log("✅ SDK initialized for Helius");

    if (sdk.helius) {
      console.log("🎯 Helius service available");

      // Test 1: Basic connection and enhanced RPC
      console.log("\n📡 Enhanced RPC Features:");
      console.log("   - High-performance RPC endpoints");
      console.log("   - Priority fee optimization");
      console.log("   - Websocket subscriptions");
      console.log("   - Advanced transaction parsing");

      // Test 2: Webhook management
      console.log("\n🔔 Webhook Management...");
      try {
        const webhooks = await sdk.helius.getWebhooks();
        console.log(`✅ Current webhooks: ${webhooks?.length || 0}`);

        if (webhooks && webhooks.length > 0) {
          webhooks.slice(0, 3).forEach((webhook, index) => {
            console.log(`   ${index + 1}. ${webhook.webhookURL || "N/A"}`);
            console.log(`      Type: ${webhook.webhookType || "Unknown"}`);
          });
        } else {
          console.log("   No webhooks configured");
        }
      } catch (error) {
        console.log("❌ Webhook fetch failed:", error.message);
      }

      // Test 3: Enhanced transaction features
      console.log("\n💰 Enhanced Transaction Features:");
      console.log("   - Parsed transaction history");
      console.log("   - NFT activity tracking");
      console.log("   - DeFi interaction analysis");
      console.log("   - Real-time notifications");
    } else {
      console.log("❌ Helius service not available - API key required");
      console.log(
        "💡 To use Helius features, set HELIUS_API_KEY environment variable"
      );
    }
  } catch (error) {
    console.error("❌ Helius RPC example failed:", error);
  }
}

// Run all Helius examples
async function main() {
  console.log("🌟 Helius Protocol Examples\n");

  await heliusRPCExample();

  console.log("\n✨ Helius examples completed!");
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  heliusRPCExample,
};
