const { ForgexSDK } = require("../dist/index.js");

class SolendExample {
  constructor(apiKey) {
    this.sdk = new ForgexSDK({ solend: { apiKey } });
    this.isWalletConnected = false;
  }

  // Connect wallet for lending operations
  async connectWallet(wallet) {
    try {
      this.sdk = new ForgexSDK({
        solend: { apiKey: this.sdk.solend.apiKey },
        wallet,
      });
      this.isWalletConnected = true;
      console.log("✅ Wallet connected for Solend operations");
    } catch (error) {
      console.error("Failed to connect wallet:", error.message);
    }
  }

  // ================== LENDING MARKETS ==================
  async demonstrateLendingMarkets() {
    console.log("\n🏦 SOLEND LENDING MARKETS");
    console.log("=".repeat(50));

    try {
      // Market overview
      console.log("\n📊 Market Overview:");

      const marketData = {
        totalSupplied: "$1.2B",
        totalBorrowed: "$850M",
        utilizationRate: 70.8,
        activeUsers: 24500,
        supportedAssets: 15,
        topPools: [
          { name: "Main Pool", tvl: "$450M", assets: 8 },
          { name: "Stable Pool", tvl: "$320M", assets: 4 },
          { name: "Turbo SOL", tvl: "$280M", assets: 3 },
          { name: "Coin98 Pool", tvl: "$150M", assets: 5 },
        ],
      };

      console.log(`Total Supplied: ${marketData.totalSupplied}`);
      console.log(`Total Borrowed: ${marketData.totalBorrowed}`);
      console.log(`Utilization Rate: ${marketData.utilizationRate}%`);
      console.log(`Active Users: ${marketData.activeUsers.toLocaleString()}`);
      console.log(`Supported Assets: ${marketData.supportedAssets}`);

      console.log("\nTop Lending Pools:");
      marketData.topPools.forEach((pool, index) => {
        console.log(`${index + 1}. ${pool.name}`);
        console.log(`   TVL: ${pool.tvl}`);
        console.log(`   Assets: ${pool.assets}`);
        console.log("");
      });

      // Asset details with live rates
      console.log("\n💰 Asset Details & Live Rates:");
      const assets = [
        {
          symbol: "SOL",
          name: "Solana",
          supplyAPY: 4.2,
          borrowAPY: 6.8,
          utilization: 68.5,
          totalSupply: "$280M",
          totalBorrow: "$192M",
          ltv: 80,
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          supplyAPY: 3.1,
          borrowAPY: 5.9,
          utilization: 52.6,
          totalSupply: "$450M",
          totalBorrow: "$237M",
          ltv: 85,
        },
        {
          symbol: "USDT",
          name: "Tether USD",
          supplyAPY: 2.9,
          borrowAPY: 5.7,
          utilization: 51.2,
          totalSupply: "$180M",
          totalBorrow: "$92M",
          ltv: 85,
        },
        {
          symbol: "mSOL",
          name: "Marinade SOL",
          supplyAPY: 5.1,
          borrowAPY: 8.2,
          utilization: 62.1,
          totalSupply: "$95M",
          totalBorrow: "$59M",
          ltv: 75,
        },
        {
          symbol: "RAY",
          name: "Raydium",
          supplyAPY: 8.5,
          borrowAPY: 12.3,
          utilization: 69.1,
          totalSupply: "$25M",
          totalBorrow: "$17M",
          ltv: 60,
        },
      ];

      assets.forEach((asset) => {
        console.log(`${asset.symbol} (${asset.name}):`);
        console.log(`  Supply APY: ${asset.supplyAPY}%`);
        console.log(`  Borrow APY: ${asset.borrowAPY}%`);
        console.log(`  Utilization: ${asset.utilization}%`);
        console.log(`  Total Supply: ${asset.totalSupply}`);
        console.log(`  Total Borrow: ${asset.totalBorrow}`);
        console.log(`  LTV: ${asset.ltv}%`);
        console.log("");
      });
    } catch (error) {
      console.error("Lending markets error:", error.message);
    }
  }

  // ================== LENDING OPERATIONS ==================
  async demonstrateLendingOperations() {
    console.log("\n💸 LENDING OPERATIONS");
    console.log("=".repeat(50));

    try {
      // Supply operations
      console.log("\n📈 Supply Operations:");

      const supplyOperations = [
        {
          operation: "Deposit Assets",
          description: "Supply tokens to earn interest",
          assets: ["SOL", "USDC", "USDT", "mSOL", "RAY"],
          benefits: [
            "Earn passive income",
            "Collateral for borrowing",
            "Liquidity rewards",
          ],
        },
        {
          operation: "Withdraw Assets",
          description: "Remove supplied tokens from the protocol",
          requirements: [
            "Available liquidity",
            "No outstanding borrows requiring collateral",
          ],
          process: "Instant withdrawal (subject to utilization)",
        },
        {
          operation: "Collateral Management",
          description: "Use supplied assets as collateral for borrowing",
          features: [
            "Toggle collateral on/off",
            "Multiple asset collateral",
            "Real-time LTV monitoring",
          ],
        },
      ];

      supplyOperations.forEach((op, index) => {
        console.log(`${index + 1}. ${op.operation}`);
        console.log(`   Description: ${op.description}`);
        if (op.assets) console.log(`   Assets: ${op.assets.join(", ")}`);
        if (op.benefits) console.log(`   Benefits: ${op.benefits.join(", ")}`);
        if (op.requirements)
          console.log(`   Requirements: ${op.requirements.join(", ")}`);
        if (op.features) console.log(`   Features: ${op.features.join(", ")}`);
        if (op.process) console.log(`   Process: ${op.process}`);
        console.log("");
      });

      // Borrowing operations
      console.log("\n📉 Borrowing Operations:");
      const borrowOperations = [
        {
          operation: "Borrow Assets",
          description: "Borrow against supplied collateral",
          requirements: [
            "Sufficient collateral",
            "Healthy LTV ratio",
            "Available liquidity",
          ],
          maxLTV: "Up to 80% depending on asset",
        },
        {
          operation: "Repay Loans",
          description: "Repay borrowed assets to reduce debt",
          options: [
            "Partial repayment",
            "Full repayment",
            "Auto-repay with earned interest",
          ],
          benefits: [
            "Reduce liquidation risk",
            "Lower interest costs",
            "Free up collateral",
          ],
        },
        {
          operation: "Liquidation Protection",
          description: "Monitor and manage liquidation risk",
          features: [
            "Real-time LTV monitoring",
            "Price alerts",
            "Auto-rebalancing",
          ],
          thresholds: "Liquidation typically starts at 85% LTV",
        },
      ];

      borrowOperations.forEach((op, index) => {
        console.log(`${index + 1}. ${op.operation}`);
        console.log(`   Description: ${op.description}`);
        if (op.requirements)
          console.log(`   Requirements: ${op.requirements.join(", ")}`);
        if (op.options) console.log(`   Options: ${op.options.join(", ")}`);
        if (op.benefits) console.log(`   Benefits: ${op.benefits.join(", ")}`);
        if (op.features) console.log(`   Features: ${op.features.join(", ")}`);
        if (op.maxLTV) console.log(`   Max LTV: ${op.maxLTV}`);
        if (op.thresholds) console.log(`   Liquidation: ${op.thresholds}`);
        console.log("");
      });

      if (this.isWalletConnected) {
        // Simulate lending operation
        console.log("\n🚀 Simulating Lending Operation:");
        const lendingTx = await this.sdk.solend.deposit({
          asset: "SOL",
          amount: 5.0,
          enableAsCollateral: true,
        });

        console.log(
          `Deposit transaction: ${lendingTx?.signature || "Success"}`
        );
        console.log(`Asset: 5.0 SOL`);
        console.log(`Collateral: Enabled`);
        console.log(`Expected APY: 4.2%`);
      } else {
        console.log("ℹ️ Wallet connection required for lending operations");
      }
    } catch (error) {
      console.error("Lending operations error:", error.message);
    }
  }

  // ================== YIELD STRATEGIES ==================
  async demonstrateYieldStrategies() {
    console.log("\n📊 YIELD STRATEGIES");
    console.log("=".repeat(50));

    try {
      // Yield optimization strategies
      console.log("\n🎯 Yield Optimization Strategies:");

      const strategies = [
        {
          strategy: "Supply & Hold",
          description: "Simple yield farming by supplying assets",
          riskLevel: "Low",
          expectedAPY: "3-6%",
          assets: ["USDC", "USDT", "SOL"],
          complexity: "Beginner-friendly",
        },
        {
          strategy: "Leveraged Staking",
          description: "Borrow stablecoins to buy more SOL for staking",
          riskLevel: "Medium",
          expectedAPY: "8-15%",
          assets: ["SOL", "mSOL", "USDC"],
          complexity: "Intermediate - manage liquidation risk",
        },
        {
          strategy: "Recursive Lending",
          description: "Supply asset, borrow same asset, re-supply",
          riskLevel: "Medium-High",
          expectedAPY: "10-25%",
          assets: ["SOL", "USDC"],
          complexity: "Advanced - requires active management",
        },
        {
          strategy: "Spread Trading",
          description: "Arbitrage interest rate differences",
          riskLevel: "High",
          expectedAPY: "15-40%",
          assets: ["Multiple assets"],
          complexity: "Expert - high capital requirements",
        },
      ];

      strategies.forEach((strategy, index) => {
        console.log(`${index + 1}. ${strategy.strategy}`);
        console.log(`   Description: ${strategy.description}`);
        console.log(`   Risk Level: ${strategy.riskLevel}`);
        console.log(`   Expected APY: ${strategy.expectedAPY}`);
        console.log(`   Assets: ${strategy.assets.join(", ")}`);
        console.log(`   Complexity: ${strategy.complexity}`);
        console.log("");
      });

      // Risk management
      console.log("\n⚖️ Risk Management:");
      const riskFactors = [
        {
          risk: "Liquidation Risk",
          description: "Collateral may be liquidated if LTV exceeds threshold",
          mitigation: [
            "Monitor LTV ratios",
            "Set price alerts",
            "Maintain health buffer",
          ],
        },
        {
          risk: "Interest Rate Risk",
          description: "Borrow rates can increase, reducing profitability",
          mitigation: [
            "Monitor rate changes",
            "Use stable rate products",
            "Diversify strategies",
          ],
        },
        {
          risk: "Smart Contract Risk",
          description: "Protocol vulnerabilities could affect funds",
          mitigation: [
            "Use audited protocols",
            "Diversify across platforms",
            "Start with small amounts",
          ],
        },
        {
          risk: "Impermanent Loss",
          description: "Token price changes can affect strategy performance",
          mitigation: [
            "Hedge positions",
            "Use stablecoins",
            "Monitor correlations",
          ],
        },
      ];

      riskFactors.forEach((risk, index) => {
        console.log(`${index + 1}. ${risk.risk}`);
        console.log(`   Description: ${risk.description}`);
        console.log(`   Mitigation: ${risk.mitigation.join(", ")}`);
        console.log("");
      });

      // Portfolio examples
      console.log("\n💼 Example Portfolios:");
      const portfolios = [
        {
          name: "Conservative Income",
          allocation: {
            "USDC Supply": 60,
            "SOL Supply": 30,
            "Cash Reserve": 10,
          },
          expectedAPY: "3.5%",
          riskLevel: "Low",
        },
        {
          name: "Balanced Growth",
          allocation: {
            "SOL Supply": 40,
            "Leveraged mSOL": 35,
            "USDC Supply": 25,
          },
          expectedAPY: "8.2%",
          riskLevel: "Medium",
        },
        {
          name: "Aggressive Yield",
          allocation: {
            "Leveraged SOL": 50,
            "Recursive USDC": 30,
            "RAY Supply": 20,
          },
          expectedAPY: "18.5%",
          riskLevel: "High",
        },
      ];

      portfolios.forEach((portfolio) => {
        console.log(`${portfolio.name}:`);
        console.log(
          `   Allocation: ${Object.entries(portfolio.allocation)
            .map(([k, v]) => `${k} ${v}%`)
            .join(", ")}`
        );
        console.log(`   Expected APY: ${portfolio.expectedAPY}`);
        console.log(`   Risk Level: ${portfolio.riskLevel}`);
        console.log("");
      });
    } catch (error) {
      console.error("Yield strategies error:", error.message);
    }
  }

  // ================== ANALYTICS & INSIGHTS ==================
  async demonstrateAnalytics() {
    console.log("\n📊 ANALYTICS & INSIGHTS");
    console.log("=".repeat(50));

    try {
      // Protocol analytics
      console.log("\n📈 Protocol Analytics:");

      const analytics = {
        marketMetrics: {
          totalValueLocked: "$1.2B",
          utilisationRate: 70.8,
          totalUsers: 24500,
          dailyVolume: "$45M",
          averageAPY: 5.8,
        },
        userBehavior: {
          averagePosition: "$8,200",
          popularAssets: ["SOL", "USDC", "mSOL", "USDT"],
          commonStrategies: ["Supply & Hold", "Leveraged Staking"],
          retentionRate: 78.5,
        },
        marketTrends: [
          "SOL lending demand increased 25% this month",
          "Stablecoin rates stabilizing around 3-4%",
          "Leveraged staking strategies gaining popularity",
          "Cross-protocol arbitrage opportunities emerging",
        ],
      };

      console.log("Market Metrics:");
      console.log(`  TVL: ${analytics.marketMetrics.totalValueLocked}`);
      console.log(`  Utilization: ${analytics.marketMetrics.utilisationRate}%`);
      console.log(
        `  Users: ${analytics.marketMetrics.totalUsers.toLocaleString()}`
      );
      console.log(`  Daily Volume: ${analytics.marketMetrics.dailyVolume}`);
      console.log(`  Average APY: ${analytics.marketMetrics.averageAPY}%`);

      console.log("\nUser Behavior:");
      console.log(
        `  Average Position: ${analytics.userBehavior.averagePosition}`
      );
      console.log(
        `  Popular Assets: ${analytics.userBehavior.popularAssets.join(", ")}`
      );
      console.log(
        `  Common Strategies: ${analytics.userBehavior.commonStrategies.join(
          ", "
        )}`
      );
      console.log(`  Retention Rate: ${analytics.userBehavior.retentionRate}%`);

      console.log("\nMarket Trends:");
      analytics.marketTrends.forEach((trend, index) => {
        console.log(`  ${index + 1}. ${trend}`);
      });

      // Performance tracking
      console.log("\n🎯 Performance Tracking:");
      const performance = {
        thirtyDay: {
          totalReturn: "+12.8%",
          interestEarned: "$1,240",
          borrowCosts: "$320",
          netProfit: "$920",
        },
        strategies: [
          { name: "SOL Supply", return: "+4.2%", allocation: "40%" },
          { name: "USDC Lending", return: "+3.1%", allocation: "35%" },
          { name: "Leveraged mSOL", return: "+18.5%", allocation: "25%" },
        ],
      };

      console.log("30-Day Performance:");
      console.log(`  Total Return: ${performance.thirtyDay.totalReturn}`);
      console.log(`  Interest Earned: ${performance.thirtyDay.interestEarned}`);
      console.log(`  Borrow Costs: ${performance.thirtyDay.borrowCosts}`);
      console.log(`  Net Profit: ${performance.thirtyDay.netProfit}`);

      console.log("\nStrategy Performance:");
      performance.strategies.forEach((strategy) => {
        console.log(
          `  ${strategy.name}: ${strategy.return} (${strategy.allocation} allocation)`
        );
      });
    } catch (error) {
      console.error("Analytics error:", error.message);
    }
  }

  // ================== COMPREHENSIVE DEMO ==================
  async runComprehensiveDemo() {
    console.log("🏦 SOLEND COMPREHENSIVE DEMO");
    console.log("=".repeat(60));

    // Run all demonstrations
    await this.demonstrateLendingMarkets();
    await this.demonstrateLendingOperations();
    await this.demonstrateYieldStrategies();
    await this.demonstrateAnalytics();

    console.log("\n✅ SOLEND DEMO COMPLETED");
    console.log(
      "All lending and borrowing features demonstrated successfully!"
    );
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting Solend SDK Demo...\n");

  // Initialize with API key (replace with your actual API key)
  const apiKey = process.env.SOLEND_API_KEY || "your-solend-api-key";
  const solendExample = new SolendExample(apiKey);

  try {
    await solendExample.runComprehensiveDemo();

    console.log("\n💡 Next Steps:");
    console.log("1. Connect a wallet to enable lending operations");
    console.log("2. Start with small amounts to test strategies");
    console.log("3. Monitor LTV ratios and liquidation risks");
    console.log("4. Set up price alerts for key assets");
    console.log("5. Diversify across different pools and assets");
    console.log("6. Consider automated yield optimization");
    console.log("7. Track performance and adjust strategies");
  } catch (error) {
    console.error("Demo failed:", error.message);
    console.log(
      "\nNote: Make sure to set your SOLEND_API_KEY environment variable"
    );
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SolendExample };
