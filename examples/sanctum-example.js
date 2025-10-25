/**
 * Sanctum Protocol Example
 * Comprehensive guide to liquid staking and LST ecosystem
 *
 * Features covered:
 * - Liquid Staking Token (LST) management
 * - Multi-LST operations and routing
 * - Stake pool analytics and comparison
 * - LST arbitrage opportunities
 * - Yield optimization strategies
 * - Risk assessment across validators
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");

class SanctumExample {
  constructor() {
    // Initialize SDK with Sanctum support
    this.sdk = ForgeXSolanaSDK.mainnet({
      sanctum: "your-sanctum-api-key", // Required for Sanctum API access
    });

    this.userWallet = null; // Will be set when wallet connects
  }

  // ============================================
  // LST DISCOVERY & ANALYTICS
  // ============================================

  /**
   * Get all available Liquid Staking Tokens
   */
  async getAllLSTs() {
    try {
      console.log("🏛️ Fetching All Liquid Staking Tokens...");

      if (!this.sdk.sanctum) {
        throw new Error("Sanctum service not available - check API key");
      }

      const lsts = await this.sdk.sanctum.getAllLSTs();

      console.log(`Found ${lsts.length} Liquid Staking Tokens:`);
      lsts.forEach((lst, index) => {
        console.log(`${index + 1}. ${lst.symbol} (${lst.name})`);
        console.log(`   - Mint: ${lst.mint}`);
        console.log(`   - APY: ${lst.apy || "N/A"}%`);
        console.log(`   - TVL: $${lst.tvl?.toLocaleString() || "N/A"}`);
        console.log(`   - Validator: ${lst.validator || "Multi-validator"}`);
        console.log(`   - Fee: ${lst.fee || "N/A"}%`);
        console.log(`   - Liquidity: ${lst.liquidity ? "High" : "Low"}`);
        console.log("---");
      });

      return lsts;
    } catch (error) {
      console.error("❌ Failed to get LSTs:", error.message);
      throw error;
    }
  }

  /**
   * Get LST performance comparison
   */
  async compareLSTPerformance() {
    try {
      console.log("📊 Comparing LST Performance...");

      const comparison = await this.sdk.sanctum.compareLSTs();

      console.log("LST Performance Comparison:");
      console.log("Top Performers by APY:");
      comparison.byApy.slice(0, 5).forEach((lst, index) => {
        console.log(`${index + 1}. ${lst.symbol}: ${lst.apy}% APY`);
      });

      console.log("\nTop Performers by TVL:");
      comparison.byTvl.slice(0, 5).forEach((lst, index) => {
        console.log(
          `${index + 1}. ${lst.symbol}: $${lst.tvl.toLocaleString()}`
        );
      });

      console.log("\nLowest Fee LSTs:");
      comparison.byFee.slice(0, 5).forEach((lst, index) => {
        console.log(`${index + 1}. ${lst.symbol}: ${lst.fee}% fee`);
      });

      return comparison;
    } catch (error) {
      console.error("❌ LST comparison failed:", error.message);
      throw error;
    }
  }

  /**
   * Get specific LST details and metrics
   */
  async getLSTDetails(lstSymbol = "mSOL") {
    try {
      console.log(`🔍 Getting ${lstSymbol} Details...`);

      const details = await this.sdk.sanctum.getLSTDetails(lstSymbol);

      console.log(`${lstSymbol} Detailed Information:`);
      console.log(`- Current APY: ${details.apy}%`);
      console.log(`- 7-day APY: ${details.apy7d}%`);
      console.log(`- 30-day APY: ${details.apy30d}%`);
      console.log(`- Total Value Locked: $${details.tvl.toLocaleString()}`);
      console.log(
        `- Exchange Rate: 1 ${lstSymbol} = ${details.exchangeRate} SOL`
      );
      console.log(`- Market Cap: $${details.marketCap.toLocaleString()}`);
      console.log(`- Liquidity Score: ${details.liquidityScore}/10`);
      console.log(`- Risk Score: ${details.riskScore}/10`);
      console.log(`- Validator Performance: ${details.validatorPerformance}%`);

      return details;
    } catch (error) {
      console.error(`❌ Failed to get ${lstSymbol} details:`, error.message);
      throw error;
    }
  }

  // ============================================
  // LST OPERATIONS
  // ============================================

  /**
   * Stake SOL to get LST
   */
  async stakeSolToLST(lstSymbol = "mSOL", solAmount = 1) {
    try {
      console.log(`🔄 Staking ${solAmount} SOL for ${lstSymbol}...`);

      const stakeResult = await this.sdk.sanctum.stakeSol({
        targetLst: lstSymbol,
        solAmount: solAmount,
        userWallet: this.userWallet?.publicKey,
        slippage: 0.5, // 0.5% slippage tolerance
      });

      console.log("✅ SOL staking successful!");
      console.log(`- LST Received: ${stakeResult.lstReceived} ${lstSymbol}`);
      console.log(`- Exchange Rate: ${stakeResult.exchangeRate}`);
      console.log(`- Transaction Fee: ${stakeResult.transactionFee} SOL`);
      console.log(`- Expected APY: ${stakeResult.expectedApy}%`);
      console.log(`- Transaction: ${stakeResult.transaction}`);

      return stakeResult;
    } catch (error) {
      console.error("❌ SOL staking failed:", error.message);
      throw error;
    }
  }

  /**
   * Unstake LST to get SOL back
   */
  async unstakeLSTToSol(lstSymbol = "mSOL", lstAmount = 0.95) {
    try {
      console.log(`🔄 Unstaking ${lstAmount} ${lstSymbol} to SOL...`);

      const unstakeResult = await this.sdk.sanctum.unstakeLst({
        sourceLst: lstSymbol,
        lstAmount: lstAmount,
        userWallet: this.userWallet?.publicKey,
        method: "instant", // 'instant' or 'delayed'
      });

      console.log("✅ LST unstaking successful!");
      console.log(`- SOL Received: ${unstakeResult.solReceived} SOL`);
      console.log(`- Exchange Rate: ${unstakeResult.exchangeRate}`);
      console.log(`- Unstaking Method: ${unstakeResult.method}`);
      console.log(`- Fee Paid: ${unstakeResult.feePaid} SOL`);
      console.log(`- Transaction: ${unstakeResult.transaction}`);

      return unstakeResult;
    } catch (error) {
      console.error("❌ LST unstaking failed:", error.message);
      throw error;
    }
  }

  /**
   * Swap between different LSTs
   */
  async swapLSTs(fromLst = "mSOL", toLst = "stSOL", amount = 0.5) {
    try {
      console.log(`🔄 Swapping ${amount} ${fromLst} for ${toLst}...`);

      const swapResult = await this.sdk.sanctum.swapLSTs({
        fromLst,
        toLst,
        amount,
        userWallet: this.userWallet?.publicKey,
        slippage: 0.5,
      });

      console.log("✅ LST swap successful!");
      console.log(`- Received: ${swapResult.receivedAmount} ${toLst}`);
      console.log(
        `- Exchange Rate: 1 ${fromLst} = ${swapResult.exchangeRate} ${toLst}`
      );
      console.log(`- Price Impact: ${swapResult.priceImpact}%`);
      console.log(`- Transaction: ${swapResult.transaction}`);

      return swapResult;
    } catch (error) {
      console.error("❌ LST swap failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // ARBITRAGE & YIELD OPTIMIZATION
  // ============================================

  /**
   * Find LST arbitrage opportunities
   */
  async findArbitrageOpportunities() {
    try {
      console.log("💰 Scanning for LST Arbitrage Opportunities...");

      const opportunities = await this.sdk.sanctum.getArbitrageOpportunities();

      console.log("Arbitrage Opportunities:");
      opportunities.forEach((opp, index) => {
        console.log(`${index + 1}. ${opp.fromLst} → ${opp.toLst}`);
        console.log(`   - Profit: ${opp.profitPercent}%`);
        console.log(`   - Volume: ${opp.maxVolume} SOL`);
        console.log(`   - Route: ${opp.route.join(" → ")}`);
        console.log(`   - Risk Level: ${opp.riskLevel}`);
        console.log(`   - Execution Time: ~${opp.executionTime}s`);
        console.log("---");
      });

      return opportunities;
    } catch (error) {
      console.error("❌ Arbitrage scan failed:", error.message);
      throw error;
    }
  }

  /**
   * Execute arbitrage opportunity
   */
  async executeArbitrage(opportunity) {
    try {
      console.log(
        `⚡ Executing arbitrage: ${opportunity.fromLst} → ${opportunity.toLst}...`
      );

      const result = await this.sdk.sanctum.executeArbitrage({
        ...opportunity,
        userWallet: this.userWallet?.publicKey,
        amount: Math.min(opportunity.maxVolume, 10), // Limit to 10 SOL max
      });

      console.log("✅ Arbitrage executed!");
      console.log(`- Profit: ${result.profit} SOL`);
      console.log(`- Profit %: ${result.profitPercent}%`);
      console.log(`- Gas Cost: ${result.gasCost} SOL`);
      console.log(`- Net Profit: ${result.netProfit} SOL`);
      console.log(`- Transactions: ${result.transactions.length}`);

      return result;
    } catch (error) {
      console.error("❌ Arbitrage execution failed:", error.message);
      throw error;
    }
  }

  /**
   * Optimize LST portfolio for maximum yield
   */
  async optimizeLSTPortfolio(currentHoldings) {
    try {
      console.log("📈 Optimizing LST Portfolio...");

      const optimization = await this.sdk.sanctum.optimizePortfolio({
        currentHoldings,
        objective: "max_yield", // 'max_yield', 'min_risk', 'balanced'
        constraints: {
          maxRiskScore: 7,
          minLiquidity: 5,
          diversificationTarget: 3, // Number of different LSTs
        },
      });

      console.log("Portfolio Optimization Results:");
      console.log(
        `- Expected APY Improvement: +${optimization.apyImprovement}%`
      );
      console.log(`- Risk Score: ${optimization.riskScore}/10`);
      console.log(`- Recommended Allocation:`);

      optimization.recommendedAllocation.forEach((allocation, index) => {
        console.log(
          `  ${index + 1}. ${allocation.lst}: ${allocation.percentage}% (${
            allocation.amount
          } tokens)`
        );
      });

      console.log(`- Rebalancing Actions: ${optimization.actions.length}`);
      optimization.actions.forEach((action, index) => {
        console.log(
          `  ${index + 1}. ${action.type}: ${action.amount} ${action.lst}`
        );
      });

      return optimization;
    } catch (error) {
      console.error("❌ Portfolio optimization failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // VALIDATOR ANALYTICS
  // ============================================

  /**
   * Analyze validator performance for LST selection
   */
  async analyzeValidatorPerformance() {
    try {
      console.log("🔍 Analyzing Validator Performance...");

      const analysis = await this.sdk.sanctum.getValidatorAnalysis();

      console.log("Validator Performance Analysis:");
      console.log("Top Performing Validators:");
      analysis.topValidators.forEach((validator, index) => {
        console.log(`${index + 1}. ${validator.name}`);
        console.log(`   - Performance Score: ${validator.performanceScore}/10`);
        console.log(`   - Uptime: ${validator.uptime}%`);
        console.log(`   - Commission: ${validator.commission}%`);
        console.log(`   - APY: ${validator.apy}%`);
        console.log(`   - Stake: ${validator.stake.toLocaleString()} SOL`);
        console.log("---");
      });

      console.log("\nRisk Factors:");
      console.log(`- Average Commission: ${analysis.avgCommission}%`);
      console.log(`- Validator Concentration: ${analysis.concentration}`);
      console.log(`- Network Health: ${analysis.networkHealth}/10`);

      return analysis;
    } catch (error) {
      console.error("❌ Validator analysis failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // PORTFOLIO TRACKING
  // ============================================

  /**
   * Track LST portfolio performance
   */
  async trackLSTPortfolio() {
    try {
      console.log("📊 Tracking LST Portfolio Performance...");

      const portfolio = await this.sdk.sanctum.getPortfolioMetrics({
        userWallet: this.userWallet?.publicKey,
      });

      console.log("LST Portfolio Summary:");
      console.log(
        `- Total Value: ${
          portfolio.totalValue
        } SOL ($${portfolio.totalValueUsd.toLocaleString()})`
      );
      console.log(`- Total LST Holdings: ${portfolio.totalLstHoldings}`);
      console.log(`- Average APY: ${portfolio.avgApy}%`);
      console.log(
        `- 24h Change: ${portfolio.change24h > 0 ? "+" : ""}${
          portfolio.change24h
        }%`
      );
      console.log(
        `- 7d Change: ${portfolio.change7d > 0 ? "+" : ""}${
          portfolio.change7d
        }%`
      );
      console.log(`- Annualized Yield: ${portfolio.annualizedYield} SOL`);

      console.log("\nHoldings Breakdown:");
      portfolio.holdings.forEach((holding, index) => {
        console.log(`${index + 1}. ${holding.lst}`);
        console.log(`   - Amount: ${holding.amount}`);
        console.log(`   - Value: ${holding.value} SOL`);
        console.log(`   - APY: ${holding.apy}%`);
        console.log(`   - Allocation: ${holding.allocation}%`);
      });

      return portfolio;
    } catch (error) {
      console.error("❌ Portfolio tracking failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // DEMO RUNNER
  // ============================================

  /**
   * Run comprehensive Sanctum demo
   */
  async runDemo() {
    try {
      console.log("🎬 Starting Sanctum Protocol Demo...\n");

      // 1. LST Discovery
      console.log("📍 PHASE 1: LST Discovery & Analytics");
      await this.getAllLSTs();
      console.log("\n" + "=".repeat(50) + "\n");

      await this.compareLSTPerformance();
      console.log("\n" + "=".repeat(50) + "\n");

      // 2. Detailed Analysis
      console.log("📍 PHASE 2: Detailed LST Analysis");
      await this.getLSTDetails("mSOL");
      console.log("\n" + "=".repeat(50) + "\n");

      await this.analyzeValidatorPerformance();
      console.log("\n" + "=".repeat(50) + "\n");

      // 3. Arbitrage Opportunities
      console.log("📍 PHASE 3: Arbitrage & Yield Optimization");
      await this.findArbitrageOpportunities();
      console.log("\n" + "=".repeat(50) + "\n");

      // 4. Portfolio Management
      console.log("📍 PHASE 4: Portfolio Management");
      console.log("⚠️ Portfolio operations require connected wallet");
      console.log("Sample operations would include:");
      console.log("- Staking SOL to get LSTs");
      console.log("- Swapping between different LSTs");
      console.log("- Portfolio optimization");
      console.log("- Performance tracking");

      console.log("\n✅ Sanctum demo completed successfully!");
      console.log("\n💡 Next Steps:");
      console.log("- Connect wallet to perform actual staking operations");
      console.log("- Set up automated arbitrage monitoring");
      console.log("- Implement portfolio rebalancing strategies");
      console.log("- Monitor validator performance regularly");
      console.log("- Consider yield optimization opportunities");
    } catch (error) {
      console.error("❌ Demo failed:", error.message);
    }
  }
}

// Usage example
async function main() {
  const sanctumExample = new SanctumExample();

  try {
    // Connect wallet first (in browser environment)
    // sanctumExample.userWallet = await connectWallet();

    // Run the comprehensive demo
    await sanctumExample.runDemo();
  } catch (error) {
    console.error("Example failed:", error);
  }
}

// Export for use in other scripts
module.exports = { SanctumExample, main };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
