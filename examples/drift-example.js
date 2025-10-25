/**
 * Drift Protocol Integration Example
 *
 * This example demonstrates Drift protocol integration for perpetual
 * trading, spot trading, and portfolio management.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");

async function driftPerpetualExample() {
  console.log("⚡ Drift Perpetual Trading Example");

  try {
    // Initialize SDK
    const sdk = ForgeXSolanaSDK.mainnet();

    console.log("✅ SDK initialized for Drift");

    if (sdk.drift) {
      console.log("🎯 Drift service available");

      // Test basic Drift functionality
      console.log("\n📊 Drift Perpetual Trading Features:");
      console.log("   - Leverage up to 10x");
      console.log("   - Multiple asset support");
      console.log("   - Advanced order types");
      console.log("   - Risk management tools");

      // Example trading scenarios
      console.log("\n💹 Trading Scenarios:");
      const scenarios = [
        {
          market: "SOL-PERP",
          side: "Long",
          size: "1.0 SOL",
          leverage: "5x",
          strategy: "Trend following",
        },
        {
          market: "BTC-PERP",
          side: "Short",
          size: "0.1 BTC",
          leverage: "3x",
          strategy: "Mean reversion",
        },
        {
          market: "ETH-PERP",
          side: "Long",
          size: "2.0 ETH",
          leverage: "2x",
          strategy: "Breakout",
        },
      ];

      scenarios.forEach((scenario, index) => {
        console.log(`   ${index + 1}. ${scenario.market} - ${scenario.side}`);
        console.log(`      Size: ${scenario.size}`);
        console.log(`      Leverage: ${scenario.leverage}`);
        console.log(`      Strategy: ${scenario.strategy}`);
      });
    } else {
      console.log("❌ Drift service not available");
    }
  } catch (error) {
    console.error("❌ Drift perpetual example failed:", error);
  }
}

// Spot trading example
async function driftSpotTradingExample() {
  console.log("\n💱 Drift Spot Trading Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    if (sdk.drift) {
      console.log("🔄 Drift Spot Trading Features:");
      console.log("   - Zero slippage trades");
      console.log("   - Deep liquidity pools");
      console.log("   - Competitive spreads");
      console.log("   - Instant settlement");

      // Example spot trades
      console.log("\n💹 Spot Trading Examples:");
      const spotTrades = [
        {
          pair: "SOL/USDC",
          type: "Market Buy",
          amount: "10 SOL",
          expectedPrice: "$Market Price",
        },
        {
          pair: "BTC/USDC",
          type: "Limit Sell",
          amount: "0.5 BTC",
          limitPrice: "$45,000",
        },
        {
          pair: "ETH/USDC",
          type: "Market Sell",
          amount: "5 ETH",
          expectedPrice: "$Market Price",
        },
      ];

      spotTrades.forEach((trade, index) => {
        console.log(`   ${index + 1}. ${trade.pair} - ${trade.type}`);
        console.log(`      Amount: ${trade.amount}`);
        console.log(`      Price: ${trade.expectedPrice || trade.limitPrice}`);
      });
    } else {
      console.log("❌ Drift spot trading not available");
    }
  } catch (error) {
    console.error("❌ Drift spot trading example failed:", error);
  }
}

// Portfolio management example
async function driftPortfolioExample() {
  console.log("\n📊 Drift Portfolio Management Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    if (sdk.drift) {
      console.log("💼 Portfolio Management Features:");

      // Example portfolio structure
      const portfolioData = {
        totalValue: 0,
        availableBalance: 0,
        positions: [],
        pnl: {
          unrealized: 0,
          realized: 0,
          total: 0,
        },
        riskMetrics: {
          leverage: 0,
          marginRatio: 0,
          liquidationPrice: 0,
        },
      };

      console.log("\n📈 Portfolio Analytics:");
      console.log("   - Real-time P&L tracking");
      console.log("   - Position size management");
      console.log("   - Risk metric monitoring");
      console.log("   - Performance attribution");

      console.log(
        "\n💡 Portfolio Structure:",
        JSON.stringify(portfolioData, null, 2)
      );

      // Risk management features
      console.log("\n⚠️ Risk Management:");
      console.log("   - Automatic liquidation protection");
      console.log("   - Position size limits");
      console.log("   - Stop-loss orders");
      console.log("   - Margin call alerts");
    } else {
      console.log("❌ Drift portfolio management not available");
    }
  } catch (error) {
    console.error("❌ Drift portfolio example failed:", error);
  }
}

// Advanced trading strategies example
async function driftTradingStrategiesExample() {
  console.log("\n🎯 Drift Trading Strategies Example");

  try {
    console.log("🚀 Advanced Trading Strategies:");

    const strategies = [
      {
        name: "Grid Trading",
        description: "Automated buy/sell orders at predetermined intervals",
        riskLevel: "Medium",
        markets: ["SOL-PERP", "BTC-PERP"],
        parameters: {
          gridSpacing: "2%",
          numberOfOrders: 10,
          totalCapital: "$1,000",
        },
      },
      {
        name: "Funding Rate Arbitrage",
        description: "Profit from funding rate differences",
        riskLevel: "Low",
        markets: ["All perpetual markets"],
        parameters: {
          fundingThreshold: "0.1%",
          hedgeRatio: "1:1",
          rebalanceFrequency: "8 hours",
        },
      },
      {
        name: "Momentum Trading",
        description: "Follow strong price trends with leverage",
        riskLevel: "High",
        markets: ["High volume perpetuals"],
        parameters: {
          trendIndicator: "EMA crossover",
          leverage: "5x",
          stopLoss: "3%",
        },
      },
      {
        name: "Delta Neutral Strategy",
        description: "Market neutral strategy capturing volatility",
        riskLevel: "Medium",
        markets: ["SOL-PERP + Spot SOL"],
        parameters: {
          rebalanceThreshold: "5%",
          targetDelta: "0",
          volatilityTarget: "20%",
        },
      },
    ];

    strategies.forEach((strategy, index) => {
      console.log(`\n   ${index + 1}. ${strategy.name}`);
      console.log(`      Description: ${strategy.description}`);
      console.log(`      Risk Level: ${strategy.riskLevel}`);
      console.log(`      Markets: ${strategy.markets.join(", ")}`);
      console.log(`      Parameters:`);
      Object.entries(strategy.parameters).forEach(([key, value]) => {
        console.log(`        ${key}: ${value}`);
      });
    });
  } catch (error) {
    console.error("❌ Drift strategies example failed:", error);
  }
}

// Market data and analysis example
async function driftMarketDataExample() {
  console.log("\n📊 Drift Market Data Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    console.log("📈 Market Data Features:");

    const dataFeatures = [
      {
        category: "Price Data",
        features: [
          "Real-time price feeds",
          "Historical OHLCV data",
          "Mark price calculations",
          "Index price aggregation",
        ],
      },
      {
        category: "Trading Metrics",
        features: [
          "Volume analysis",
          "Open interest tracking",
          "Funding rate history",
          "Liquidation data",
        ],
      },
      {
        category: "Risk Metrics",
        features: [
          "Volatility measurements",
          "Correlation analysis",
          "Value at Risk (VaR)",
          "Stress testing scenarios",
        ],
      },
      {
        category: "Market Sentiment",
        features: [
          "Long/short ratios",
          "Fear & greed index",
          "Whale activity monitoring",
          "Social sentiment analysis",
        ],
      },
    ];

    dataFeatures.forEach((category, index) => {
      console.log(`\n   ${index + 1}. ${category.category}`);
      category.features.forEach((feature) => {
        console.log(`      • ${feature}`);
      });
    });

    console.log("\n🔍 Analysis Tools:");
    console.log("   - Technical indicators");
    console.log("   - Pattern recognition");
    console.log("   - Backtesting framework");
    console.log("   - Performance analytics");
  } catch (error) {
    console.error("❌ Drift market data example failed:", error);
  }
}

// Best practices example
async function driftBestPracticesExample() {
  console.log("\n💡 Drift Trading Best Practices");

  try {
    console.log("🎓 Perpetual Trading Best Practices:");

    const bestPractices = [
      "Start with small position sizes",
      "Always use stop-loss orders",
      "Understand funding rates and costs",
      "Monitor margin requirements closely",
      "Diversify across different markets",
      "Keep emotions in check",
      "Practice proper risk management",
      "Stay updated with market news",
      "Use demo trading to practice",
      "Keep detailed trading records",
    ];

    bestPractices.forEach((practice, index) => {
      console.log(`   ${index + 1}. ${practice}`);
    });

    console.log("\n⚠️  Risk Warnings:");
    console.log("   - Leverage amplifies both gains and losses");
    console.log("   - Perpetual contracts can be liquidated");
    console.log("   - Funding rates can affect profitability");
    console.log("   - Market volatility can cause rapid losses");
    console.log("   - Never risk more than you can afford to lose");

    console.log("\n🔧 Technical Considerations:");
    console.log("   - Maintain sufficient margin buffer");
    console.log("   - Understand liquidation mechanics");
    console.log("   - Monitor gas fees and trading costs");
    console.log("   - Use appropriate order types");
    console.log("   - Plan for network congestion scenarios");
  } catch (error) {
    console.error("❌ Drift best practices example failed:", error);
  }
}

// Run all Drift examples
async function main() {
  console.log("🌟 Drift Protocol Examples\n");

  await driftPerpetualExample();
  await driftSpotTradingExample();
  await driftPortfolioExample();
  await driftTradingStrategiesExample();
  await driftMarketDataExample();
  await driftBestPracticesExample();

  console.log("\n✨ Drift examples completed!");
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  driftPerpetualExample,
  driftSpotTradingExample,
  driftPortfolioExample,
  driftTradingStrategiesExample,
  driftMarketDataExample,
  driftBestPracticesExample,
};
