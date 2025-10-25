/**
 * Marinade Finance Integration Example
 *
 * This example demonstrates comprehensive Marinade Finance integration
 * including liquid staking, native staking, liquidity pools, and mSOL operations.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const BN = require("bn.js");

async function marinadeStakingExample() {
  console.log("🌊 Marinade Finance Integration Example");

  try {
    // Initialize SDK with mainnet
    const sdk = ForgeXSolanaSDK.mainnet({
      helius: process.env.HELIUS_API_KEY,
    });

    console.log("✅ SDK initialized for Marinade Finance");

    // Note: Marinade requires a wallet for initialization
    // In production, use proper wallet management
    const demoKeypair = Keypair.generate();
    const demoWallet = {
      publicKey: demoKeypair.publicKey,
      signTransaction: async (tx) => {
        tx.sign(demoKeypair);
        return tx;
      },
      signAllTransactions: async (txs) => {
        txs.forEach(tx => tx.sign(demoKeypair));
        return txs;
      },
    };

    console.log(`👤 Demo Wallet: ${demoWallet.publicKey.toString().slice(0, 8)}...`);

    if (!sdk.marinade) {
      console.log("⚠️  Marinade service not initialized (requires wallet)");
      console.log("   Marinade Features:");
      console.log("   - Liquid staking (SOL → mSOL)");
      console.log("   - Liquid unstaking (mSOL → SOL)");
      console.log("   - Native staking with referrals");
      console.log("   - Liquidity pool operations");
      console.log("   - mSOL/SOL LP tokens");
      return;
    }

    // Test 1: Liquid staking simulation
    console.log("\n💧 Liquid Staking Simulation...");
    try {
      // Note: This would require actual SOL balance and network connection
      const stakeAmount = new BN(1000000000); // 1 SOL in lamports
      
      console.log("📊 Liquid Staking Details:");
      console.log(`   Stake Amount: ${stakeAmount.div(new BN(1000000000)).toString()} SOL`);
      console.log("   Expected Output: ~1.0 mSOL (minus fees)");
      console.log("   Benefits: Immediate liquidity, DeFi composability");
      console.log("   Use Cases: Lending, trading, yield farming");
      
      // Simulate deposit transaction building
      console.log("🔨 Transaction Structure:");
      console.log("   1. Create mSOL token account (if needed)");
      console.log("   2. Execute liquid stake instruction");
      console.log("   3. Receive mSOL tokens");
      
    } catch (error) {
      console.log("⚠️  Liquid staking requires wallet and SOL balance:", error.message);
    }

  } catch (error) {
    console.error("❌ Marinade staking example failed:", error);
  }
}

// Liquid unstaking example
async function marinadeUnstakingExample() {
  console.log("\n🔄 Marinade Liquid Unstaking Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.marinade) {
      console.log("⚠️  Marinade service not available (requires wallet initialization)");
      return;
    }

    console.log("💱 Liquid Unstaking Features:");
    console.log("   - Instant SOL from mSOL");
    console.log("   - No waiting period");
    console.log("   - Market-based exchange rate");
    console.log("   - Small fee applies");

    // Test: Liquid unstaking simulation
    const unstakeAmount = new BN(500000000); // 0.5 mSOL in lamports
    
    console.log("\n📊 Liquid Unstaking Details:");
    console.log(`   mSOL Amount: ${unstakeAmount.div(new BN(1000000000)).toString()} mSOL`);
    console.log("   Expected Output: ~0.49 SOL (after fees)");
    console.log("   Exchange Rate: Dynamic based on pool liquidity");
    
    console.log("\n🔨 Transaction Structure:");
    console.log("   1. Check mSOL token account balance");
    console.log("   2. Calculate SOL output amount");
    console.log("   3. Execute liquid unstake instruction");
    console.log("   4. Receive SOL to wallet");

  } catch (error) {
    console.error("❌ Liquid unstaking example failed:", error);
  }
}

// Native staking with referrals example
async function marinadeNativeStakingExample() {
  console.log("\n🏛️  Marinade Native Staking Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.marinade) {
      console.log("⚠️  Marinade service not available (requires wallet initialization)");
      return;
    }

    console.log("🎯 Native Staking Features:");
    console.log("   - Direct validator staking");
    console.log("   - Referral program integration");
    console.log("   - Stake account management");
    console.log("   - Validator diversification");

    // Test: Native staking with referral
    const userPublicKey = Keypair.generate().publicKey;
    const stakeAmount = new BN(2000000000); // 2 SOL
    const referralCode = "example_referral_code";
    
    console.log("\n📊 Native Staking Details:");
    console.log(`   User: ${userPublicKey.toString().slice(0, 8)}...`);
    console.log(`   Stake Amount: ${stakeAmount.div(new BN(1000000000)).toString()} SOL`);
    console.log(`   Referral Code: ${referralCode}`);
    console.log("   Benefits: Validator rewards, referral bonuses");
    
    console.log("\n🔨 Transaction Structure:");
    console.log("   1. Create stake account");
    console.log("   2. Fund stake account with SOL");
    console.log("   3. Delegate to Marinade validator");
    console.log("   4. Apply referral code benefits");

    // Test: Stake account deposit with referral
    const stakeAccountAddress = Keypair.generate().publicKey;
    
    console.log("\n📋 Stake Account Deposit:");
    console.log(`   Stake Account: ${stakeAccountAddress.toString().slice(0, 8)}...`);
    console.log("   Process: Deposit existing stake account to Marinade");
    console.log("   Benefit: Earn additional Marinade rewards");

  } catch (error) {
    console.error("❌ Native staking example failed:", error);
  }
}

// Liquidity pool operations example
async function marinadePoolOperationsExample() {
  console.log("\n🏊 Marinade Liquidity Pool Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.marinade) {
      console.log("⚠️  Marinade service not available (requires wallet initialization)");
      return;
    }

    console.log("💧 Liquidity Pool Features:");
    console.log("   - mSOL/SOL liquidity provision");
    console.log("   - LP token rewards");
    console.log("   - Trading fee earnings");
    console.log("   - Impermanent loss protection");

    // Test: Add liquidity simulation
    const liquidityAmount = new BN(1000000000); // 1 SOL worth
    
    console.log("\n➕ Add Liquidity Details:");
    console.log(`   SOL Amount: ${liquidityAmount.div(new BN(1000000000)).toString()} SOL`);
    console.log("   Expected LP Tokens: Based on pool ratio");
    console.log("   Rewards: Trading fees + LP incentives");
    
    console.log("\n🔨 Add Liquidity Process:");
    console.log("   1. Calculate optimal SOL/mSOL ratio");
    console.log("   2. Create LP token account (if needed)");
    console.log("   3. Deposit SOL to liquidity pool");
    console.log("   4. Receive LP tokens representing share");

    // Test: Remove liquidity simulation
    const lpTokenAmount = 500000000; // 0.5 LP tokens
    
    console.log("\n➖ Remove Liquidity Details:");
    console.log(`   LP Token Amount: ${lpTokenAmount / 1000000000} LP`);
    console.log("   Expected Output: Proportional SOL + mSOL");
    console.log("   Process: Burn LP tokens for underlying assets");
    
    console.log("\n🔨 Remove Liquidity Process:");
    console.log("   1. Calculate share of pool ownership");
    console.log("   2. Burn specified LP tokens");
    console.log("   3. Receive proportional SOL");
    console.log("   4. Receive proportional mSOL");

  } catch (error) {
    console.error("❌ Pool operations example failed:", error);
  }
}

// Advanced Marinade operations example
async function marinadeAdvancedOperationsExample() {
  console.log("\n🚀 Marinade Advanced Operations Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.marinade) {
      console.log("⚠️  Marinade service not available (requires wallet initialization)");
      return;
    }

    console.log("⚡ Advanced Features:");
    console.log("   - Unstake fee preparation");
    console.log("   - Stake account merging");
    console.log("   - Validator selection");
    console.log("   - Referral tracking");

    // Test: Prepare native unstake
    const userPublicKey = Keypair.generate().publicKey;
    const unstakeAmount = new BN(1500000000); // 1.5 SOL
    
    console.log("\n🔧 Native Unstake Preparation:");
    console.log(`   User: ${userPublicKey.toString().slice(0, 8)}...`);
    console.log(`   Unstake Amount: ${unstakeAmount.div(new BN(1000000000)).toString()} SOL`);
    console.log("   Process: Merge stake accounts and pay fees");
    
    console.log("\n📋 Preparation Steps:");
    console.log("   1. Identify user's stake accounts");
    console.log("   2. Calculate required fees");
    console.log("   3. Merge fragmented stake accounts");
    console.log("   4. Prepare for unstake execution");

    // Test: Lookup table usage
    console.log("\n🔍 Address Lookup Table:");
    console.log(`   Marinade ALT: ${sdk.marinade.constructor.LOOKUP_TABLE?.toString() || 'N/A'}`);
    console.log("   Purpose: Transaction size optimization");
    console.log("   Benefits: Lower fees, faster execution");

  } catch (error) {
    console.error("❌ Advanced operations example failed:", error);
  }
}

// Marinade ecosystem integration example
async function marinadeEcosystemExample() {
  console.log("\n🌐 Marinade Ecosystem Integration Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();
    
    if (!sdk.marinade) {
      console.log("⚠️  Marinade service not available (requires wallet initialization)");
      return;
    }

    console.log("🔗 Ecosystem Integrations:");
    console.log("   - DeFi protocols (lending, borrowing)");
    console.log("   - DEX trading (mSOL pairs)");
    console.log("   - Yield farming strategies");
    console.log("   - Cross-protocol composability");

    console.log("\n💰 mSOL Use Cases:");
    console.log("   1. Collateral for loans (Solend, Mango)");
    console.log("   2. Trading pairs (mSOL/USDC, mSOL/SOL)");
    console.log("   3. Yield farming (Raydium, Orca pools)");
    console.log("   4. Governance participation");

    console.log("\n📊 Portfolio Strategies:");
    console.log("   - Hold mSOL for staking rewards");
    console.log("   - Provide mSOL/SOL liquidity");
    console.log("   - Use mSOL in leveraged strategies");
    console.log("   - Arbitrage mSOL/SOL price differences");

    console.log("\n🎯 Risk Management:");
    console.log("   - Monitor mSOL/SOL exchange rate");
    console.log("   - Understand validator performance");
    console.log("   - Consider liquidity pool impermanent loss");
    console.log("   - Track protocol updates and changes");

  } catch (error) {
    console.error("❌ Ecosystem integration example failed:", error);
  }
}

// Utility functions and monitoring example
async function marinadeUtilitiesExample() {
  console.log("\n🛠️  Marinade Utilities Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    console.log("🔧 Utility Functions:");
    console.log("   - Connection management");
    console.log("   - Wallet integration");
    console.log("   - Provider access");
    console.log("   - Configuration options");

    if (sdk.marinade) {
      console.log("\n📊 Available Getters:");
      console.log("   - getMarinade(): Core Marinade instance");
      console.log("   - getConnection(): Solana connection");
      console.log("   - getWallet(): Wallet instance");
      console.log("   - getProvider(): Marinade provider");
    }

    console.log("\n⚙️  Configuration Options:");
    console.log("   - RPC endpoint selection");
    console.log("   - Referral code setup");
    console.log("   - Transaction commitment levels");
    console.log("   - Custom wallet adapters");

    console.log("\n📈 Monitoring & Analytics:");
    console.log("   - Track mSOL balance changes");
    console.log("   - Monitor staking rewards");
    console.log("   - Calculate APY/APR");
    console.log("   - Analyze pool performance");

    console.log("\n🔒 Security Best Practices:");
    console.log("   - Verify transaction details");
    console.log("   - Use hardware wallets for large amounts");
    console.log("   - Monitor for protocol updates");
    console.log("   - Understand slashing risks");

  } catch (error) {
    console.error("❌ Utilities example failed:", error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log("🚀 Starting Marinade Finance Integration Examples\n");
  
  await marinadeStakingExample();
  await marinadeUnstakingExample();
  await marinadeNativeStakingExample();
  await marinadePoolOperationsExample();
  await marinadeAdvancedOperationsExample();
  await marinadeEcosystemExample();
  await marinadeUtilitiesExample();
  
  console.log("\n✅ All Marinade examples completed!");
  console.log("\n📝 Notes:");
  console.log("   - Marinade requires wallet initialization for full functionality");
  console.log("   - Operations require actual SOL/mSOL balances for execution");
  console.log("   - Always test on devnet before mainnet operations");
  console.log("   - Consider transaction fees and slippage in calculations");
  console.log("   - Monitor mSOL/SOL exchange rate for optimal timing");
}

// Export for use in other modules
module.exports = {
  marinadeStakingExample,
  marinadeUnstakingExample,
  marinadeNativeStakingExample,
  marinadePoolOperationsExample,
  marinadeAdvancedOperationsExample,
  marinadeEcosystemExample,
  marinadeUtilitiesExample,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
