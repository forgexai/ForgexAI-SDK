/**
 * Raydium V2 Integration Example
 *
 * This example demonstrates comprehensive Raydium protocol integration
 * including API swaps, SDK swaps, routing, farming, and pool operations.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const BN = require("bn.js");

async function raydiumSwapExample() {
  console.log("🌊 Raydium Integration Example");

  try {
    // Initialize SDK with mainnet
    const sdk = ForgeXSolanaSDK.mainnet({
      helius: process.env.HELIUS_API_KEY,
    });

    console.log("✅ SDK initialized for Raydium");

    // Note: Raydium requires a wallet keypair for initialization
    // In production, use proper wallet management
    const demoKeypair = Keypair.generate();
    console.log(`👤 Demo Wallet: ${demoKeypair.publicKey.toString().slice(0, 8)}...`);

    // Test 1: Get token list
    console.log("\n📋 Getting Raydium Token List...");
    try {
      if (sdk.raydium) {
        await sdk.raydium.initialize();
        const tokenList = await sdk.raydium.getTokenList();
        console.log(`✅ Found ${tokenList.length} tokens on Raydium`);
        
        // Show first few tokens
        tokenList.slice(0, 3).forEach((token) => {
          console.log(`   ${token.symbol}: ${token.name || 'N/A'}`);
        });
      } else {
        console.log("⚠️  Raydium service not initialized (requires wallet)");
      }
    } catch (error) {
      console.log("⚠️  Token list requires mainnet connection:", error.message);
    }

    // Test 2: Get pool information
    console.log("\n🏊 Getting Pool Information...");
    try {
      if (sdk.raydium) {
        const poolList = await sdk.raydium.getPoolList({
          poolType: "all",
          poolSortField: "liquidity",
          sortType: "desc",
          pageSize: 5,
        });
        console.log(`✅ Found ${poolList.data?.length || 0} pools`);
        
        if (poolList.data && poolList.data.length > 0) {
          poolList.data.slice(0, 3).forEach((pool) => {
            console.log(`   Pool: ${pool.mintA?.symbol}/${pool.mintB?.symbol} - TVL: $${pool.tvl?.toLocaleString() || 'N/A'}`);
          });
        }
      }
    } catch (error) {
      console.log("⚠️  Pool info requires mainnet connection:", error.message);
    }

    // Test 3: Compute swap quote (API method)
    console.log("\n💱 Computing Swap Quote...");
    try {
      if (sdk.raydium) {
        const swapQuote = await sdk.raydium.computeSwap({
          inputMint: "So11111111111111111111111111111111111111112", // SOL
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
          amount: 1000000000, // 1 SOL in lamports
          slippageBps: 100, // 1% slippage
          txVersion: "V0",
        });

        console.log("📊 Swap Quote Details:");
        console.log(`   Input: ${(swapQuote.inputAmount / 1e9).toFixed(4)} SOL`);
        console.log(`   Output: ${(swapQuote.outputAmount / 1e6).toFixed(2)} USDC`);
        console.log(`   Price Impact: ${swapQuote.priceImpact?.toFixed(4)}%`);
        console.log(`   Route: ${swapQuote.routePlan?.length || 0} hops`);
      }
    } catch (error) {
      console.log("⚠️  Swap computation requires mainnet connection:", error.message);
    }

  } catch (error) {
    console.error("❌ Raydium example failed:", error);
  }
}

// Advanced Raydium example with farming operations
async function raydiumFarmingExample() {
  console.log("\n🚜 Raydium Farming Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.raydium) {
      console.log("⚠️  Raydium service not available (requires wallet initialization)");
      return;
    }

    // Example farm operations (requires actual wallet and tokens)
    console.log("🌾 Farm Operations Available:");
    console.log("   - stakeFarm(farmId, amount)");
    console.log("   - unstakeFarm(farmId, amount)");
    console.log("   - harvestFarm(farmId)");
    
    // Test: Get farm information
    try {
      const farmInfo = await sdk.raydium.getFarmInfoById("example_farm_id");
      console.log(`✅ Farm info retrieved for ${farmInfo.length} farms`);
    } catch (error) {
      console.log("⚠️  Farm info requires valid farm ID:", error.message);
    }

  } catch (error) {
    console.error("❌ Farming example failed:", error);
  }
}

// Route-based swap example
async function raydiumRouteSwapExample() {
  console.log("\n🛣️  Raydium Route Swap Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.raydium) {
      console.log("⚠️  Raydium service not available (requires wallet initialization)");
      return;
    }

    console.log("🔄 Route Swap Features:");
    console.log("   - Automatic best route finding");
    console.log("   - Multi-hop swaps");
    console.log("   - Optimal price execution");
    console.log("   - Slippage protection");

    // Example route swap parameters
    const routeSwapOptions = {
      inputMint: new PublicKey("So11111111111111111111111111111111111111112"), // SOL
      outputMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC
      inputAmount: new BN(1000000000), // 1 SOL
      slippage: 0.01, // 1%
    };

    console.log("📋 Route Swap Configuration:");
    console.log(`   Input: SOL`);
    console.log(`   Output: USDC`);
    console.log(`   Amount: 1.0 SOL`);
    console.log(`   Slippage: 1%`);

  } catch (error) {
    console.error("❌ Route swap example failed:", error);
  }
}

// Pool operations example
async function raydiumPoolExample() {
  console.log("\n🏊 Raydium Pool Operations Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.raydium) {
      console.log("⚠️  Raydium service not available (requires wallet initialization)");
      return;
    }

    console.log("💧 Pool Operations Available:");
    console.log("   - Add Liquidity");
    console.log("   - Remove Liquidity");
    console.log("   - Get Pool Info");
    console.log("   - Calculate LP Tokens");

    // Example: Get pools by mint addresses
    try {
      const poolsByMints = await sdk.raydium.getPoolByMints(
        "So11111111111111111111111111111111111111112", // SOL
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"  // USDC
      );
      
      console.log("🔍 SOL/USDC Pool Search:");
      if (poolsByMints && poolsByMints.data) {
        console.log(`   Found ${poolsByMints.data.length} pools`);
        poolsByMints.data.forEach((pool, index) => {
          console.log(`   Pool ${index + 1}: ${pool.id} - APR: ${pool.apr || 'N/A'}%`);
        });
      }
    } catch (error) {
      console.log("⚠️  Pool search requires mainnet connection:", error.message);
    }

  } catch (error) {
    console.error("❌ Pool operations example failed:", error);
  }
}

// Priority fees and transaction optimization
async function raydiumOptimizationExample() {
  console.log("\n⚡ Raydium Transaction Optimization Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.raydium) {
      console.log("⚠️  Raydium service not available (requires wallet initialization)");
      return;
    }

    // Test: Get priority fees
    try {
      const priorityFees = await sdk.raydium.getPriorityFees();
      console.log("💰 Priority Fees:");
      console.log(`   Default: ${priorityFees.h} micro-lamports`);
      console.log(`   Medium: ${priorityFees.m} micro-lamports`);
      console.log(`   Low: ${priorityFees.l} micro-lamports`);
    } catch (error) {
      console.log("⚠️  Priority fees require mainnet connection:", error.message);
    }

    console.log("\n🔧 Transaction Optimization Features:");
    console.log("   - Dynamic compute unit limits");
    console.log("   - Priority fee optimization");
    console.log("   - Transaction versioning (V0/Legacy)");
    console.log("   - Automatic retry logic");

  } catch (error) {
    console.error("❌ Optimization example failed:", error);
  }
}

// Utility functions example
async function raydiumUtilitiesExample() {
  console.log("\n🛠️  Raydium Utilities Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    console.log("🔧 Utility Functions:");
    console.log("   - Format amounts with decimals");
    console.log("   - Token account management");
    console.log("   - Connection management");
    console.log("   - Error handling");

    // Example: Format amount
    const amount = new BN("1000000000"); // 1 SOL in lamports
    const formatted = sdk.raydium?.constructor.formatAmount?.(amount, 9) || "1.0";
    console.log(`   Formatted amount: ${formatted} SOL`);

    console.log("\n📊 Available Getters:");
    if (sdk.raydium) {
      console.log("   - getConnection(): Connection instance");
      console.log("   - getOwner(): Keypair instance");
      console.log("   - getRaydium(): Raydium SDK instance");
    }

  } catch (error) {
    console.error("❌ Utilities example failed:", error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log("🚀 Starting Raydium Integration Examples\n");
  
  await raydiumSwapExample();
  await raydiumFarmingExample();
  await raydiumRouteSwapExample();
  await raydiumPoolExample();
  await raydiumOptimizationExample();
  await raydiumUtilitiesExample();
  
  console.log("\n✅ All Raydium examples completed!");
  console.log("\n📝 Notes:");
  console.log("   - Raydium requires wallet initialization for full functionality");
  console.log("   - Some operations require mainnet connection and actual tokens");
  console.log("   - Always test on devnet before mainnet operations");
  console.log("   - Use proper error handling in production code");
}

// Export for use in other modules
module.exports = {
  raydiumSwapExample,
  raydiumFarmingExample,
  raydiumRouteSwapExample,
  raydiumPoolExample,
  raydiumOptimizationExample,
  raydiumUtilitiesExample,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
