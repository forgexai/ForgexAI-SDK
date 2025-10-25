const { ForgexSDK } = require("../dist/index.js");

class BirdeyeExample {
  constructor(apiKey) {
    this.sdk = new ForgexSDK({ birdeye: { apiKey } });
  }

  // ================== PRICE ANALYTICS ==================
  async demonstratePriceAnalytics() {
    console.log("\n🔍 BIRDEYE PRICE ANALYTICS");
    console.log("=".repeat(50));

    try {
      // Major tokens to analyze
      const tokens = {
        SOL: "So11111111111111111111111111111111111111112",
        USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
      };

      // Real-time price monitoring
      console.log("\n📊 Real-time Prices:");
      for (const [symbol, address] of Object.entries(tokens)) {
        const price = await this.sdk.birdeye.getTokenPrice(address);
        console.log(`${symbol}: $${price?.value || "N/A"}`);
      }

      // Price history analysis
      console.log("\n📈 Price History Analysis:");
      const solHistory = await this.sdk.birdeye.getPriceHistory(
        tokens.SOL,
        "1D"
      );
      if (solHistory?.data?.length > 0) {
        const prices = solHistory.data.map((p) => p.value);
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const change =
          ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;

        console.log(`SOL 24h High: $${high.toFixed(2)}`);
        console.log(`SOL 24h Low: $${low.toFixed(2)}`);
        console.log(`SOL 24h Change: ${change.toFixed(2)}%`);
      }

      // Multi-timeframe analysis
      console.log("\n🕐 Multi-timeframe Analysis:");
      const timeframes = ["5m", "1h", "4h", "1D"];
      for (const tf of timeframes) {
        const data = await this.sdk.birdeye.getPriceHistory(tokens.SOL, tf);
        if (data?.data?.length > 1) {
          const first = data.data[0].value;
          const last = data.data[data.data.length - 1].value;
          const change = ((last - first) / first) * 100;
          console.log(
            `SOL ${tf}: ${change > 0 ? "+" : ""}${change.toFixed(2)}%`
          );
        }
      }
    } catch (error) {
      console.error("Price analytics error:", error.message);
    }
  }

  // ================== MARKET DATA ==================
  async demonstrateMarketData() {
    console.log("\n📊 MARKET DATA ANALYSIS");
    console.log("=".repeat(50));

    try {
      // Token overview
      console.log("\n🔍 Token Overview:");
      const solInfo = await this.sdk.birdeye.getTokenInfo(
        "So11111111111111111111111111111111111111112"
      );
      if (solInfo) {
        console.log(`Name: ${solInfo.name}`);
        console.log(`Symbol: ${solInfo.symbol}`);
        console.log(`Market Cap: $${(solInfo.mc / 1e6).toFixed(2)}M`);
        console.log(`24h Volume: $${(solInfo.v24hUSD / 1e6).toFixed(2)}M`);
        console.log(`Liquidity: $${(solInfo.liquidity / 1e6).toFixed(2)}M`);
      }

      // Top tokens by market cap
      console.log("\n🏆 Top Tokens by Market Cap:");
      const topTokens = await this.sdk.birdeye.getTokenList({
        sort: "mc",
        order: "desc",
        limit: 10,
      });
      if (topTokens?.data) {
        topTokens.data.slice(0, 5).forEach((token, index) => {
          console.log(
            `${index + 1}. ${token.symbol}: $${(token.mc / 1e6).toFixed(2)}M`
          );
        });
      }

      // Volume leaders
      console.log("\n💰 Volume Leaders (24h):");
      const volumeLeaders = await this.sdk.birdeye.getTokenList({
        sort: "v24hUSD",
        order: "desc",
        limit: 5,
      });
      if (volumeLeaders?.data) {
        volumeLeaders.data.forEach((token, index) => {
          console.log(
            `${index + 1}. ${token.symbol}: $${(token.v24hUSD / 1e6).toFixed(
              2
            )}M`
          );
        });
      }

      // New tokens
      console.log("\n🆕 Recently Listed Tokens:");
      const newTokens = await this.sdk.birdeye.getTokenList({
        sort: "created_time",
        order: "desc",
        limit: 5,
      });
      if (newTokens?.data) {
        newTokens.data.forEach((token, index) => {
          const age = Math.floor(
            (Date.now() - token.created_time * 1000) / (1000 * 60 * 60)
          );
          console.log(`${index + 1}. ${token.symbol}: ${age}h ago`);
        });
      }
    } catch (error) {
      console.error("Market data error:", error.message);
    }
  }

  // ================== TRADING INSIGHTS ==================
  async demonstrateTradingInsights() {
    console.log("\n💡 TRADING INSIGHTS");
    console.log("=".repeat(50));

    try {
      const solAddress = "So11111111111111111111111111111111111111112";

      // OHLCV data for technical analysis
      console.log("\n📊 Technical Analysis Data:");
      const ohlcv = await this.sdk.birdeye.getOHLCV(solAddress, "1h", "1D");
      if (ohlcv?.data?.length > 0) {
        const latest = ohlcv.data[ohlcv.data.length - 1];
        console.log(`Latest OHLCV:`);
        console.log(`  Open: $${latest.o.toFixed(2)}`);
        console.log(`  High: $${latest.h.toFixed(2)}`);
        console.log(`  Low: $${latest.l.toFixed(2)}`);
        console.log(`  Close: $${latest.c.toFixed(2)}`);
        console.log(`  Volume: $${(latest.v / 1e6).toFixed(2)}M`);
      }

      // Trade analysis
      console.log("\n💹 Trade Analysis:");
      const trades = await this.sdk.birdeye.getTrades(solAddress, {
        limit: 10,
      });
      if (trades?.data?.length > 0) {
        let buyVolume = 0;
        let sellVolume = 0;
        let totalTrades = trades.data.length;

        trades.data.forEach((trade) => {
          if (trade.side === "buy") buyVolume += trade.volume;
          else sellVolume += trade.volume;
        });

        const buyPressure = (buyVolume / (buyVolume + sellVolume)) * 100;
        console.log(`Recent ${totalTrades} trades:`);
        console.log(`  Buy Pressure: ${buyPressure.toFixed(2)}%`);
        console.log(`  Buy Volume: $${(buyVolume / 1e6).toFixed(2)}M`);
        console.log(`  Sell Volume: $${(sellVolume / 1e6).toFixed(2)}M`);
      }

      // Whale watching
      console.log("\n🐋 Whale Activity:");
      const largeTrades = await this.sdk.birdeye.getTrades(solAddress, {
        limit: 50,
        type: "large",
      });
      if (largeTrades?.data?.length > 0) {
        const whaleThreshold = 10000; // $10k+
        const whaleTrades = largeTrades.data.filter(
          (t) => t.volumeUSD > whaleThreshold
        );

        if (whaleTrades.length > 0) {
          console.log(`Found ${whaleTrades.length} whale trades (>$10k):`);
          whaleTrades.slice(0, 3).forEach((trade, index) => {
            console.log(
              `  ${index + 1}. ${trade.side.toUpperCase()}: $${(
                trade.volumeUSD / 1000
              ).toFixed(1)}k`
            );
          });
        }
      }
    } catch (error) {
      console.error("Trading insights error:", error.message);
    }
  }

  // ================== PORTFOLIO TRACKING ==================
  async demonstratePortfolioTracking() {
    console.log("\n📈 PORTFOLIO TRACKING");
    console.log("=".repeat(50));

    try {
      // Example wallet address (you can replace with actual wallet)
      const walletAddress = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

      // Get wallet token holdings
      console.log("\n💼 Wallet Holdings:");
      const holdings = await this.sdk.birdeye.getWalletTokens(walletAddress);
      if (holdings?.data?.length > 0) {
        let totalValue = 0;

        console.log("Top holdings:");
        holdings.data.slice(0, 5).forEach((holding, index) => {
          const value = holding.valueUSD || 0;
          totalValue += value;
          console.log(
            `  ${index + 1}. ${holding.symbol}: $${value.toFixed(2)}`
          );
        });

        console.log(`Total Portfolio Value: $${totalValue.toFixed(2)}`);
      }

      // Performance tracking
      console.log("\n📊 Performance Metrics:");
      const walletInfo = await this.sdk.birdeye.getWalletInfo(walletAddress);
      if (walletInfo) {
        console.log(`Total Transactions: ${walletInfo.totalTxs || "N/A"}`);
        console.log(
          `Total Volume: $${((walletInfo.totalVolume || 0) / 1e6).toFixed(2)}M`
        );
        console.log(
          `Profit/Loss: ${
            walletInfo.pnl
              ? (walletInfo.pnl > 0 ? "+" : "") +
                walletInfo.pnl.toFixed(2) +
                "%"
              : "N/A"
          }`
        );
      }
    } catch (error) {
      console.error("Portfolio tracking error:", error.message);
    }
  }

  // ================== MARKET ALERTS ==================
  async demonstrateMarketAlerts() {
    console.log("\n🚨 MARKET ALERTS & MONITORING");
    console.log("=".repeat(50));

    try {
      const tokens = [
        {
          symbol: "SOL",
          address: "So11111111111111111111111111111111111111112",
        },
        {
          symbol: "RAY",
          address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        },
        {
          symbol: "JUP",
          address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        },
      ];

      console.log("\n⚡ Price Movement Alerts:");
      for (const token of tokens) {
        const history = await this.sdk.birdeye.getPriceHistory(
          token.address,
          "1h"
        );
        if (history?.data?.length > 1) {
          const current = history.data[history.data.length - 1].value;
          const previous = history.data[history.data.length - 2].value;
          const change = ((current - previous) / previous) * 100;

          if (Math.abs(change) > 2) {
            const direction = change > 0 ? "📈" : "📉";
            console.log(
              `${direction} ${token.symbol}: ${
                change > 0 ? "+" : ""
              }${change.toFixed(2)}% in 1h`
            );
          }
        }
      }

      // Volume spike detection
      console.log("\n💥 Volume Spike Detection:");
      for (const token of tokens) {
        const tokenInfo = await this.sdk.birdeye.getTokenInfo(token.address);
        if (tokenInfo?.v24hUSD) {
          const avgVolume = tokenInfo.v24hUSD / 24; // Hourly average
          const recentTrades = await this.sdk.birdeye.getTrades(token.address, {
            limit: 100,
          });

          if (recentTrades?.data?.length > 0) {
            const recentVolume = recentTrades.data.reduce(
              (sum, trade) => sum + trade.volumeUSD,
              0
            );
            const volumeSpike = recentVolume / avgVolume;

            if (volumeSpike > 2) {
              console.log(
                `🔥 ${token.symbol}: ${volumeSpike.toFixed(1)}x volume spike!`
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Market alerts error:", error.message);
    }
  }

  // ================== COMPREHENSIVE DEMO ==================
  async runComprehensiveDemo() {
    console.log("🐦 BIRDEYE COMPREHENSIVE DEMO");
    console.log("=".repeat(60));

    // Run all demonstrations
    await this.demonstratePriceAnalytics();
    await this.demonstrateMarketData();
    await this.demonstrateTradingInsights();
    await this.demonstratePortfolioTracking();
    await this.demonstrateMarketAlerts();

    console.log("\n✅ BIRDEYE DEMO COMPLETED");
    console.log(
      "All market data and analytics features demonstrated successfully!"
    );
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting Birdeye SDK Demo...\n");

  // Initialize with API key (replace with your actual API key)
  const apiKey = process.env.BIRDEYE_API_KEY || "your-birdeye-api-key";
  const birdeyeExample = new BirdeyeExample(apiKey);

  try {
    await birdeyeExample.runComprehensiveDemo();
  } catch (error) {
    console.error("Demo failed:", error.message);
    console.log(
      "\nNote: Make sure to set your BIRDEYE_API_KEY environment variable"
    );
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { BirdeyeExample };
