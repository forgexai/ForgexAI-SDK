/**
 * Meteora Finance Protocol Example
 * Comprehensive guide to DLMM, DAMM, and Alpha Vault strategies
 *
 * Features covered:
 * - Dynamic Liquidity Market Maker (DLMM) pools
 * - Dynamic AMM v2 (DAMM) operations
 * - Alpha Vault strategies
 * - Dynamic Vault management
 * - Yield farming optimization
 * - Risk management strategies
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");

class MeteoraExample {
  constructor() {
    // Initialize SDK with Meteora support
    this.sdk = ForgeXSolanaSDK.mainnet({
      meteora: "your-meteora-api-key", // Optional - some features work without API key
    });

    this.userWallet = null; // Will be set when wallet connects
  }

  // ============================================
  // DLMM (Dynamic Liquidity Market Maker)
  // ============================================

  /**
   * Get all available DLMM pools
   */
  async getDLMMPools() {
    try {
      console.log("💫 Fetching DLMM Pools...");

      if (!this.sdk.meteora) {
        throw new Error("Meteora service not available - check API key");
      }

      const pools = await this.sdk.meteora.getDLMMPools();

      console.log(`Found ${pools.length} DLMM pools:`);
      pools.slice(0, 10).forEach((pool, index) => {
        console.log(
          `${index + 1}. ${pool.tokenX.symbol}/${pool.tokenY.symbol}`
        );
        console.log(`   - Pool Address: ${pool.address}`);
        console.log(`   - Fee: ${pool.fee}%`);
        console.log(`   - TVL: $${pool.tvl?.toLocaleString() || "N/A"}`);
        console.log(
          `   - 24h Volume: $${pool.volume24h?.toLocaleString() || "N/A"}`
        );
        console.log(`   - APR: ${pool.apr || "N/A"}%`);
        console.log("---");
      });

      return pools;
    } catch (error) {
      console.error("❌ Failed to get DLMM pools:", error.message);
      throw error;
    }
  }

  /**
   * Create DLMM position with concentrated liquidity
   */
  async createDLMMPosition(
    poolAddress,
    tokenXAmount = 100,
    tokenYAmount = 1000
  ) {
    try {
      console.log("🎯 Creating DLMM Position...");

      const position = await this.sdk.meteora.createDLMMPosition({
        poolAddress,
        tokenXAmount,
        tokenYAmount,
        userWallet: this.userWallet?.publicKey,
        strategy: "concentrated", // concentrated, wide, or custom
        priceRange: {
          lowerPrice: 0.9, // 10% below current price
          upperPrice: 1.1, // 10% above current price
        },
      });

      console.log("✅ DLMM position created!");
      console.log("- Position Address:", position.address);
      console.log("- Token X Deposited:", position.tokenXDeposited);
      console.log("- Token Y Deposited:", position.tokenYDeposited);
      console.log("- Liquidity:", position.liquidity);
      console.log("- Transaction:", position.transaction);

      return position;
    } catch (error) {
      console.error("❌ DLMM position creation failed:", error.message);
      throw error;
    }
  }

  /**
   * Manage DLMM position (add/remove liquidity)
   */
  async manageDLMMPosition(positionAddress, action = "add", amount = 50) {
    try {
      console.log(
        `⚖️ ${action === "add" ? "Adding" : "Removing"} DLMM Liquidity...`
      );

      const result = await this.sdk.meteora.manageDLMMPosition({
        positionAddress,
        action,
        amount,
        userWallet: this.userWallet?.publicKey,
      });

      console.log("✅ DLMM position updated!");
      console.log("- New Liquidity:", result.newLiquidity);
      console.log("- Fees Collected:", result.feesCollected);
      console.log("- Transaction:", result.transaction);

      return result;
    } catch (error) {
      console.error("❌ DLMM position management failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // DYNAMIC AMM V2 (DAMM)
  // ============================================

  /**
   * Get DAMM pools and analytics
   */
  async getDAMMPools() {
    try {
      console.log("🌊 Fetching DAMM v2 Pools...");

      const pools = await this.sdk.meteora.getDAMMPools();

      console.log(`Found ${pools.length} DAMM pools:`);
      pools.slice(0, 5).forEach((pool, index) => {
        console.log(
          `${index + 1}. ${pool.tokenA.symbol}/${pool.tokenB.symbol}`
        );
        console.log(`   - Pool Type: ${pool.poolType}`);
        console.log(`   - Fee: ${pool.fee}%`);
        console.log(`   - TVL: $${pool.tvl?.toLocaleString() || "N/A"}`);
        console.log(`   - APY: ${pool.apy || "N/A"}%`);
        console.log("---");
      });

      return pools;
    } catch (error) {
      console.error("❌ Failed to get DAMM pools:", error.message);
      throw error;
    }
  }

  /**
   * Add liquidity to DAMM pool
   */
  async addDAMMLiquidity(poolAddress, tokenAAmount = 100, tokenBAmount = 1000) {
    try {
      console.log("💰 Adding Liquidity to DAMM Pool...");

      const result = await this.sdk.meteora.addDAMMLiquidity({
        poolAddress,
        tokenAAmount,
        tokenBAmount,
        userWallet: this.userWallet?.publicKey,
        slippage: 0.5, // 0.5% slippage tolerance
      });

      console.log("✅ Liquidity added to DAMM pool!");
      console.log("- LP Tokens Received:", result.lpTokens);
      console.log("- Pool Share:", result.poolShare + "%");
      console.log("- Transaction:", result.transaction);

      return result;
    } catch (error) {
      console.error("❌ DAMM liquidity addition failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // ALPHA VAULT STRATEGIES
  // ============================================

  /**
   * Get available Alpha Vaults
   */
  async getAlphaVaults() {
    try {
      console.log("🏛️ Fetching Alpha Vaults...");

      const vaults = await this.sdk.meteora.getAlphaVaults();

      console.log(`Found ${vaults.length} Alpha Vaults:`);
      vaults.forEach((vault, index) => {
        console.log(`${index + 1}. ${vault.name}`);
        console.log(`   - Strategy: ${vault.strategy}`);
        console.log(`   - Base Token: ${vault.baseToken.symbol}`);
        console.log(`   - Quote Token: ${vault.quoteToken.symbol}`);
        console.log(`   - TVL: $${vault.tvl?.toLocaleString() || "N/A"}`);
        console.log(`   - APY: ${vault.apy || "N/A"}%`);
        console.log(`   - Risk Level: ${vault.riskLevel || "N/A"}`);
        console.log("---");
      });

      return vaults;
    } catch (error) {
      console.error("❌ Failed to get Alpha Vaults:", error.message);
      throw error;
    }
  }

  /**
   * Deposit into Alpha Vault
   */
  async depositToAlphaVault(vaultAddress, amount = 1000) {
    try {
      console.log("🔐 Depositing to Alpha Vault...");

      const deposit = await this.sdk.meteora.depositToAlphaVault({
        vaultAddress,
        amount,
        userWallet: this.userWallet?.publicKey,
      });

      console.log("✅ Alpha Vault deposit successful!");
      console.log("- Vault Shares:", deposit.vaultShares);
      console.log("- Estimated APY:", deposit.estimatedApy + "%");
      console.log("- Strategy Active:", deposit.strategyActive);
      console.log("- Transaction:", deposit.transaction);

      return deposit;
    } catch (error) {
      console.error("❌ Alpha Vault deposit failed:", error.message);
      throw error;
    }
  }

  /**
   * Monitor Alpha Vault performance
   */
  async monitorAlphaVault(vaultAddress) {
    try {
      console.log("📊 Monitoring Alpha Vault Performance...");

      const performance = await this.sdk.meteora.getVaultPerformance(
        vaultAddress
      );

      console.log("Alpha Vault Performance:");
      console.log(`- Current APY: ${performance.currentApy}%`);
      console.log(`- 7-day APY: ${performance.apy7d}%`);
      console.log(`- 30-day APY: ${performance.apy30d}%`);
      console.log(`- Total Returns: ${performance.totalReturns}%`);
      console.log(`- Sharpe Ratio: ${performance.sharpeRatio || "N/A"}`);
      console.log(`- Max Drawdown: ${performance.maxDrawdown}%`);
      console.log(`- Strategy Efficiency: ${performance.strategyEfficiency}%`);

      return performance;
    } catch (error) {
      console.error("❌ Vault monitoring failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // DYNAMIC VAULT MANAGEMENT
  // ============================================

  /**
   * Get Dynamic Vaults
   */
  async getDynamicVaults() {
    try {
      console.log("⚡ Fetching Dynamic Vaults...");

      const vaults = await this.sdk.meteora.getDynamicVaults();

      console.log(`Found ${vaults.length} Dynamic Vaults:`);
      vaults.forEach((vault, index) => {
        console.log(`${index + 1}. ${vault.pair}`);
        console.log(`   - Auto-Compound: ${vault.autoCompound ? "Yes" : "No"}`);
        console.log(`   - Rebalance Frequency: ${vault.rebalanceFrequency}`);
        console.log(
          `   - Current Range: ${vault.currentRange.lower} - ${vault.currentRange.upper}`
        );
        console.log(`   - Performance: ${vault.performance}%`);
        console.log("---");
      });

      return vaults;
    } catch (error) {
      console.error("❌ Failed to get Dynamic Vaults:", error.message);
      throw error;
    }
  }

  /**
   * Create dynamic vault strategy
   */
  async createDynamicVaultStrategy(vaultAddress, strategyParams) {
    try {
      console.log("⚡ Creating Dynamic Vault Strategy...");

      const strategy = await this.sdk.meteora.createDynamicStrategy({
        vaultAddress,
        ...strategyParams,
        userWallet: this.userWallet?.publicKey,
      });

      console.log("✅ Dynamic strategy created!");
      console.log("- Strategy ID:", strategy.id);
      console.log(
        "- Auto-Rebalance:",
        strategy.autoRebalance ? "Enabled" : "Disabled"
      );
      console.log("- Target APY:", strategy.targetApy + "%");

      return strategy;
    } catch (error) {
      console.error("❌ Dynamic strategy creation failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // YIELD FARMING OPTIMIZATION
  // ============================================

  /**
   * Find optimal yield farming opportunities
   */
  async findOptimalYieldOpportunities() {
    try {
      console.log("🎯 Finding Optimal Yield Opportunities...");

      const opportunities = await this.sdk.meteora.getYieldOpportunities({
        minTvl: 100000, // Minimum $100k TVL
        minApy: 10, // Minimum 10% APY
        riskLevel: "medium", // low, medium, high
      });

      console.log("Top Yield Opportunities:");
      opportunities.slice(0, 5).forEach((opp, index) => {
        console.log(`${index + 1}. ${opp.pool.name}`);
        console.log(`   - APY: ${opp.apy}%`);
        console.log(`   - TVL: $${opp.tvl.toLocaleString()}`);
        console.log(`   - Risk Score: ${opp.riskScore}/10`);
        console.log(`   - Liquidity Score: ${opp.liquidityScore}/10`);
        console.log(`   - Strategy: ${opp.strategy}`);
        console.log("---");
      });

      return opportunities;
    } catch (error) {
      console.error("❌ Failed to find yield opportunities:", error.message);
      throw error;
    }
  }

  /**
   * Auto-compound rewards
   */
  async autoCompoundRewards(positionAddress) {
    try {
      console.log("🔄 Auto-Compounding Rewards...");

      const result = await this.sdk.meteora.autoCompound({
        positionAddress,
        userWallet: this.userWallet?.publicKey,
        reinvestThreshold: 0.01, // Minimum 0.01 SOL in rewards before compounding
      });

      console.log("✅ Auto-compound executed!");
      console.log("- Rewards Harvested:", result.rewardsHarvested);
      console.log("- Amount Reinvested:", result.amountReinvested);
      console.log("- New Position Size:", result.newPositionSize);
      console.log("- Gas Cost:", result.gasCost);

      return result;
    } catch (error) {
      console.error("❌ Auto-compound failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // RISK MANAGEMENT
  // ============================================

  /**
   * Monitor position risks across all strategies
   */
  async monitorRisks() {
    try {
      console.log("🛡️ Monitoring Risk Metrics...");

      const riskMetrics = await this.sdk.meteora.getRiskMetrics({
        userWallet: this.userWallet?.publicKey,
      });

      console.log("Risk Assessment:");
      console.log(`- Overall Risk Score: ${riskMetrics.overallRisk}/10`);
      console.log(
        `- Impermanent Loss Risk: ${riskMetrics.impermanentLossRisk}/10`
      );
      console.log(`- Liquidity Risk: ${riskMetrics.liquidityRisk}/10`);
      console.log(`- Concentration Risk: ${riskMetrics.concentrationRisk}/10`);
      console.log(`- Market Risk: ${riskMetrics.marketRisk}/10`);

      // Risk warnings
      if (riskMetrics.overallRisk > 7) {
        console.warn(
          "⚠️ HIGH RISK: Consider reducing position sizes or diversifying"
        );
      }

      if (riskMetrics.impermanentLossRisk > 6) {
        console.warn("⚠️ IL RISK: High impermanent loss risk detected");
      }

      return riskMetrics;
    } catch (error) {
      console.error("❌ Risk monitoring failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // PORTFOLIO ANALYTICS
  // ============================================

  /**
   * Get comprehensive portfolio analytics
   */
  async getPortfolioAnalytics() {
    try {
      console.log("📈 Generating Portfolio Analytics...");

      const analytics = await this.sdk.meteora.getPortfolioAnalytics({
        userWallet: this.userWallet?.publicKey,
      });

      console.log("Portfolio Summary:");
      console.log(`- Total Value: $${analytics.totalValue.toLocaleString()}`);
      console.log(
        `- 24h PnL: ${
          analytics.pnl24h > 0 ? "+" : ""
        }$${analytics.pnl24h.toLocaleString()}`
      );
      console.log(
        `- 7d PnL: ${
          analytics.pnl7d > 0 ? "+" : ""
        }$${analytics.pnl7d.toLocaleString()}`
      );
      console.log(
        `- Total Fees Earned: $${analytics.totalFeesEarned.toLocaleString()}`
      );
      console.log(`- Active Positions: ${analytics.activePositions}`);

      console.log("\nPosition Breakdown:");
      analytics.positions.forEach((position, index) => {
        console.log(`${index + 1}. ${position.pool.name}`);
        console.log(`   - Type: ${position.type}`);
        console.log(`   - Value: $${position.value.toLocaleString()}`);
        console.log(`   - PnL: ${position.pnl > 0 ? "+" : ""}${position.pnl}%`);
        console.log(`   - APY: ${position.currentApy}%`);
      });

      return analytics;
    } catch (error) {
      console.error("❌ Portfolio analytics failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // DEMO RUNNER
  // ============================================

  /**
   * Run comprehensive Meteora demo
   */
  async runDemo() {
    try {
      console.log("🎬 Starting Meteora Protocol Demo...\n");

      // 1. Market Overview
      console.log("📍 PHASE 1: Market Discovery");
      await this.getDLMMPools();
      console.log("\n" + "=".repeat(50) + "\n");

      await this.getDAMMPools();
      console.log("\n" + "=".repeat(50) + "\n");

      // 2. Alpha Vaults
      console.log("📍 PHASE 2: Alpha Vault Strategies");
      await this.getAlphaVaults();
      console.log("\n" + "=".repeat(50) + "\n");

      // 3. Yield Optimization
      console.log("📍 PHASE 3: Yield Optimization");
      await this.findOptimalYieldOpportunities();
      console.log("\n" + "=".repeat(50) + "\n");

      // 4. Dynamic Vaults
      console.log("📍 PHASE 4: Dynamic Vault Management");
      await this.getDynamicVaults();
      console.log("\n" + "=".repeat(50) + "\n");

      // 5. Risk Assessment
      console.log("📍 PHASE 5: Risk Management");
      await this.monitorRisks();
      console.log("\n" + "=".repeat(50) + "\n");

      // 6. Portfolio Analytics
      console.log("📍 PHASE 6: Portfolio Analytics");
      await this.getPortfolioAnalytics();

      console.log("\n✅ Meteora demo completed successfully!");
      console.log("\n💡 Next Steps:");
      console.log("- Analyze yield opportunities based on risk tolerance");
      console.log("- Consider diversifying across different vault strategies");
      console.log("- Set up automated rebalancing for optimal returns");
      console.log("- Monitor impermanent loss regularly");
      console.log("- Implement risk management strategies");
    } catch (error) {
      console.error("❌ Demo failed:", error.message);
    }
  }
}

// Usage example
async function main() {
  const meteoraExample = new MeteoraExample();

  try {
    // Connect wallet first (in browser environment)
    // meteoraExample.userWallet = await connectWallet();

    // Run the comprehensive demo
    await meteoraExample.runDemo();
  } catch (error) {
    console.error("Example failed:", error);
  }
}

// Export for use in other scripts
module.exports = { MeteoraExample, main };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
