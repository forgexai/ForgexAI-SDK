/**
 * Pyth Network Integration Example
 *
 * This example demonstrates comprehensive Pyth Network integration
 * including price feeds, real-time updates, TWAP calculations, and price feed management.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");

async function pythPriceFeedsExample() {
  console.log("🔮 Pyth Network Integration Example");

  try {
    // Initialize SDK with mainnet
    const sdk = ForgeXSolanaSDK.mainnet({
      helius: process.env.HELIUS_API_KEY,
    });

    console.log("✅ SDK initialized for Pyth Network");

    // Note: Pyth requires a wallet for initialization
    // In production, use proper wallet management
    const demoWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    };

    console.log(`👤 Demo Wallet: ${demoWallet.publicKey.toString().slice(0, 8)}...`);

    // Initialize Pyth service with wallet
    if (!sdk.pyth) {
      console.log("⚠️  Pyth service not initialized (requires wallet)");
      console.log("   Available price feed IDs:");
      
      // Show available price feed constants
      const priceFeeds = {
        BTC_USD: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
        ETH_USD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
        SOL_USD: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
        USDC_USD: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
        USDT_USD: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
      };
      
      Object.entries(priceFeeds).forEach(([symbol, feedId]) => {
        console.log(`   ${symbol}: ${feedId}`);
      });
      return;
    }

    // Test 1: Get all available price feeds
    console.log("\n📋 Getting Available Price Feeds...");
    try {
      const allFeeds = await sdk.pyth.getAllPriceFeeds({
        assetType: "crypto",
      });
      console.log(`✅ Found ${allFeeds.length || 0} crypto price feeds`);
      
      if (allFeeds && allFeeds.length > 0) {
        allFeeds.slice(0, 5).forEach((feed) => {
          console.log(`   ${feed.attributes?.base}/${feed.attributes?.quote_currency}: ${feed.id}`);
        });
      }
    } catch (error) {
      console.log("⚠️  Price feeds require network connection:", error.message);
    }

  } catch (error) {
    console.error("❌ Pyth price feeds example failed:", error);
  }
}

// Real-time price updates example
async function pythRealTimePricesExample() {
  console.log("\n📡 Pyth Real-Time Price Updates Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.pyth) {
      console.log("⚠️  Pyth service not available (requires wallet initialization)");
      return;
    }

    // Test: Fetch latest price updates
    console.log("🔄 Fetching Latest Price Updates...");
    try {
      const priceFeedIds = [
        "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", // SOL/USD
        "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD
        "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
      ];

      const priceUpdates = await sdk.pyth.fetchLatestPriceUpdates(priceFeedIds);
      console.log(`✅ Retrieved ${priceUpdates.length} price updates`);
      
      priceUpdates.forEach((update, index) => {
        const symbols = ["SOL/USD", "BTC/USD", "ETH/USD"];
        console.log(`   ${symbols[index]}: Update data length ${update.length} bytes`);
      });
    } catch (error) {
      console.log("⚠️  Price updates require network connection:", error.message);
    }

    // Test: Get price feed account addresses
    console.log("\n🏠 Price Feed Account Addresses:");
    try {
      const solFeedAddress = sdk.pyth.getSponsoredFeedAddress("SOL_USD");
      console.log(`   SOL/USD Feed Address: ${solFeedAddress.toString()}`);
      
      const btcFeedAddress = sdk.pyth.getSponsoredFeedAddress("BTC_USD");
      console.log(`   BTC/USD Feed Address: ${btcFeedAddress.toString()}`);
    } catch (error) {
      console.log("⚠️  Feed addresses require valid configuration:", error.message);
    }

  } catch (error) {
    console.error("❌ Real-time prices example failed:", error);
  }
}

// TWAP (Time-Weighted Average Price) example
async function pythTwapExample() {
  console.log("\n📊 Pyth TWAP Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.pyth) {
      console.log("⚠️  Pyth service not available (requires wallet initialization)");
      return;
    }

    console.log("⏰ TWAP Features:");
    console.log("   - Time-weighted average prices");
    console.log("   - Configurable time windows (1-600 seconds)");
    console.log("   - Reduced price manipulation risk");
    console.log("   - Ideal for DeFi protocols");

    // Test: Fetch TWAP data
    try {
      const priceFeedIds = [
        "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", // SOL/USD
      ];
      
      const windowSeconds = 300; // 5 minutes
      const twapUpdates = await sdk.pyth.fetchLatestTwaps(priceFeedIds, windowSeconds);
      
      console.log(`✅ TWAP Data (${windowSeconds}s window):`);
      console.log(`   SOL/USD TWAP: Update data length ${twapUpdates[0]?.length || 0} bytes`);
      
      // Validate TWAP window
      const isValidWindow = sdk.pyth.constructor.isValidTwapWindow?.(windowSeconds);
      console.log(`   Window validation: ${isValidWindow ? '✅ Valid' : '❌ Invalid'}`);
      
    } catch (error) {
      console.log("⚠️  TWAP data requires network connection:", error.message);
    }

  } catch (error) {
    console.error("❌ TWAP example failed:", error);
  }
}

// Price feed management example
async function pythFeedManagementExample() {
  console.log("\n🔧 Pyth Price Feed Management Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.pyth) {
      console.log("⚠️  Pyth service not available (requires wallet initialization)");
      return;
    }

    console.log("🛠️  Feed Management Operations:");
    console.log("   - Create price feed accounts");
    console.log("   - Update price feeds");
    console.log("   - Close expired accounts");
    console.log("   - Manage account rent");

    // Test: Get price feed account configuration
    const feedConfig = {
      shardId: 0, // Sponsored feeds use shard 0
      priceFeedId: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
    };

    try {
      const feedAddress = sdk.pyth.getPriceFeedAccountAddress(feedConfig);
      console.log(`📍 Feed Account Address: ${feedAddress.toString()}`);
      
      // Multiple feed addresses
      const multipleConfigs = [
        { shardId: 0, priceFeedId: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d" },
        { shardId: 0, priceFeedId: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43" },
      ];
      
      const multipleAddresses = sdk.pyth.getMultiplePriceFeedAddresses(multipleConfigs);
      console.log(`📍 Multiple Addresses: ${multipleAddresses.length} feeds configured`);
      
    } catch (error) {
      console.log("⚠️  Feed management requires valid configuration:", error.message);
    }

    // Test: Find owned VAA accounts
    try {
      const ownedAccounts = await sdk.pyth.findOwnedEncodedVaaAccounts();
      console.log(`🏠 Owned VAA Accounts: ${ownedAccounts.length}`);
    } catch (error) {
      console.log("⚠️  VAA accounts require wallet connection:", error.message);
    }

  } catch (error) {
    console.error("❌ Feed management example failed:", error);
  }
}

// Advanced price operations example
async function pythAdvancedOperationsExample() {
  console.log("\n🚀 Pyth Advanced Operations Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.pyth) {
      console.log("⚠️  Pyth service not available (requires wallet initialization)");
      return;
    }

    console.log("⚡ Advanced Features:");
    console.log("   - Custom instruction building");
    console.log("   - Transaction optimization");
    console.log("   - Batch price updates");
    console.log("   - Error recovery");

    // Test: Search price feeds
    try {
      const searchResults = await sdk.pyth.searchPriceFeeds("SOL");
      console.log(`🔍 Search Results for 'SOL': ${searchResults.length || 0} feeds`);
      
      if (searchResults && searchResults.length > 0) {
        searchResults.slice(0, 3).forEach((feed) => {
          console.log(`   ${feed.attributes?.base}/${feed.attributes?.quote_currency}`);
        });
      }
    } catch (error) {
      console.log("⚠️  Search requires network connection:", error.message);
    }

    // Test: Get price feeds by asset type
    try {
      const cryptoFeeds = await sdk.pyth.getPriceFeedsByAssetType("crypto");
      console.log(`💰 Crypto Feeds: ${cryptoFeeds.length || 0} available`);
      
      const fxFeeds = await sdk.pyth.getPriceFeedsByAssetType("fx");
      console.log(`💱 FX Feeds: ${fxFeeds.length || 0} available`);
    } catch (error) {
      console.log("⚠️  Asset type feeds require network connection:", error.message);
    }

  } catch (error) {
    console.error("❌ Advanced operations example failed:", error);
  }
}

// Utility functions example
async function pythUtilitiesExample() {
  console.log("\n🛠️  Pyth Utilities Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    console.log("🔧 Utility Functions:");
    console.log("   - Price formatting");
    console.log("   - Hex conversion");
    console.log("   - Feed ID management");
    console.log("   - Validation helpers");

    // Example: Hex to bytes conversion
    const hexPriceFeedId = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
    try {
      const bytes = sdk.pyth?.constructor.hexToBytes?.(hexPriceFeedId);
      console.log(`🔢 Hex to Bytes: ${bytes?.length || 0} bytes`);
    } catch (error) {
      console.log("⚠️  Hex conversion requires valid input:", error.message);
    }

    // Example: Price formatting
    const examplePrice = "123456789";
    const exponent = -8;
    try {
      const formattedPrice = sdk.pyth?.constructor.formatPrice?.(examplePrice, exponent);
      console.log(`💰 Formatted Price: $${formattedPrice || 'N/A'}`);
    } catch (error) {
      console.log("⚠️  Price formatting requires valid input:", error.message);
    }

    // Example: Get all price feed IDs
    try {
      const allFeedIds = sdk.pyth?.constructor.getAllPriceFeedIds?.() || [];
      console.log(`📋 Available Feed IDs: ${allFeedIds.length}`);
      
      // Show first few feed IDs
      allFeedIds.slice(0, 3).forEach((feedId, index) => {
        console.log(`   Feed ${index + 1}: ${feedId.slice(0, 20)}...`);
      });
    } catch (error) {
      console.log("⚠️  Feed IDs require valid configuration:", error.message);
    }

    console.log("\n📊 Available Getters:");
    if (sdk.pyth) {
      console.log("   - getConnection(): Connection instance");
      console.log("   - getWallet(): Wallet instance");
      console.log("   - getHermesClient(): Hermes client");
      console.log("   - getPythReceiver(): Pyth receiver");
      console.log("   - getHermesUrl(): Hermes endpoint URL");
    }

  } catch (error) {
    console.error("❌ Utilities example failed:", error);
  }
}

// Streaming price updates example
async function pythStreamingExample() {
  console.log("\n📡 Pyth Streaming Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.pyth) {
      console.log("⚠️  Pyth service not available (requires wallet initialization)");
      return;
    }

    console.log("🌊 Streaming Features:");
    console.log("   - Real-time price streams");
    console.log("   - WebSocket connections");
    console.log("   - Event-driven updates");
    console.log("   - Low-latency data");

    // Note: Streaming requires active connection and proper event handling
    console.log("\n📝 Streaming Setup:");
    console.log("   1. Configure price feed IDs");
    console.log("   2. Set up event listeners");
    console.log("   3. Handle connection management");
    console.log("   4. Process real-time updates");

    const priceFeedIds = [
      "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", // SOL/USD
    ];

    console.log(`🎯 Configured for ${priceFeedIds.length} price feeds`);
    console.log("⚠️  Streaming requires active implementation in production");

  } catch (error) {
    console.error("❌ Streaming example failed:", error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log("🚀 Starting Pyth Network Integration Examples\n");
  
  await pythPriceFeedsExample();
  await pythRealTimePricesExample();
  await pythTwapExample();
  await pythFeedManagementExample();
  await pythAdvancedOperationsExample();
  await pythUtilitiesExample();
  await pythStreamingExample();
  
  console.log("\n✅ All Pyth examples completed!");
  console.log("\n📝 Notes:");
  console.log("   - Pyth requires wallet initialization for full functionality");
  console.log("   - Price feeds require active network connection");
  console.log("   - TWAP windows are limited to 1-600 seconds");
  console.log("   - Use proper error handling for production applications");
  console.log("   - Consider rate limits when fetching multiple feeds");
}

// Export for use in other modules
module.exports = {
  pythPriceFeedsExample,
  pythRealTimePricesExample,
  pythTwapExample,
  pythFeedManagementExample,
  pythAdvancedOperationsExample,
  pythUtilitiesExample,
  pythStreamingExample,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
