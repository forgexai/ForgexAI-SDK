const { ForgexSDK } = require("../dist/index.js");

class DexScreenerExample {
  constructor() {
    this.sdk = new ForgexSDK();
  }

  // ================== TOKEN PAIR ANALYTICS ==================
  async demonstrateTokenPairAnalytics() {
    console.log("\n📊 DEXSCREENER TOKEN PAIR ANALYTICS");
    console.log("=".repeat(50));

    try {
      // Popular Solana tokens to analyze
      const tokens = {
        SOL: "So11111111111111111111111111111111111111112",
        USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      };

      // Analyze SOL pairs
      console.log("\n🔍 SOL Trading Pairs:");
      const solPairs = await this.sdk.dexscreener.getTokenPairs(
        "solana",
        tokens.SOL
      );
      if (solPairs?.pairs?.length > 0) {
        solPairs.pairs.slice(0, 5).forEach((pair, index) => {
          console.log(
            `${index + 1}. ${pair.baseToken.symbol}/${pair.quoteToken.symbol}`
          );
          console.log(`   DEX: ${pair.dexId}`);
          console.log(`   Price: $${pair.priceUsd || "N/A"}`);
          console.log(
            `   24h Volume: $${
              pair.volume?.h24
                ? (pair.volume.h24 / 1e6).toFixed(2) + "M"
                : "N/A"
            }`
          );
          console.log(
            `   24h Change: ${
              pair.priceChange?.h24
                ? pair.priceChange.h24.toFixed(2) + "%"
                : "N/A"
            }`
          );
          console.log(
            `   Liquidity: $${
              pair.liquidity?.usd
                ? (pair.liquidity.usd / 1e6).toFixed(2) + "M"
                : "N/A"
            }`
          );
          console.log("");
        });
      }

      // Multi-token analysis
      console.log("\n� Multi-Token Price Analysis:");
      for (const [symbol, address] of Object.entries(tokens)) {
        const pairs = await this.sdk.dexscreener.getTokenPairs(
          "solana",
          address
        );
        if (pairs?.pairs?.length > 0) {
          const mainPair = pairs.pairs[0];
          console.log(
            `${symbol}: $${mainPair.priceUsd || "N/A"} (${
              mainPair.priceChange?.h24
                ? mainPair.priceChange.h24.toFixed(2)
                : "N/A"
            }%)`
          );
        }
      }
    } catch (error) {
      console.error("Token pair analytics error:", error.message);
    }
  }

  // ================== DEX ANALYTICS ==================
  async demonstrateDexAnalytics() {
    console.log("\n🏛️ DEX ANALYTICS");
    console.log("=".repeat(50));

    try {
      // Analyze different DEXs on Solana
      const solanaTokens = [
        "So11111111111111111111111111111111111111112", // SOL
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", // RAY
      ];

      const dexAnalytics = {};

      console.log("\n🔄 DEX Comparison for Popular Tokens:");
      for (const tokenAddress of solanaTokens) {
        const pairs = await this.sdk.dexscreener.getTokenPairs(
          "solana",
          tokenAddress
        );
        if (pairs?.pairs?.length > 0) {
          pairs.pairs.slice(0, 3).forEach((pair) => {
            const dexId = pair.dexId;
            if (!dexAnalytics[dexId]) {
              dexAnalytics[dexId] = {
                totalVolume: 0,
                totalLiquidity: 0,
                pairCount: 0,
                avgPriceChange: 0,
              };
            }

            dexAnalytics[dexId].totalVolume += pair.volume?.h24 || 0;
            dexAnalytics[dexId].totalLiquidity += pair.liquidity?.usd || 0;
            dexAnalytics[dexId].pairCount += 1;
            dexAnalytics[dexId].avgPriceChange += pair.priceChange?.h24 || 0;
          });
        }
      }

      // Display DEX analytics
      console.log("\nDEX Performance Summary:");
      Object.entries(dexAnalytics).forEach(([dexId, analytics], index) => {
        const avgChange = analytics.avgPriceChange / analytics.pairCount;
        console.log(`${index + 1}. ${dexId.toUpperCase()}`);
        console.log(
          `   Total Volume: $${(analytics.totalVolume / 1e6).toFixed(2)}M`
        );
        console.log(
          `   Total Liquidity: $${(analytics.totalLiquidity / 1e6).toFixed(2)}M`
        );
        console.log(`   Tracked Pairs: ${analytics.pairCount}`);
        console.log(`   Avg Price Change: ${avgChange.toFixed(2)}%`);
        console.log("");
      });
    } catch (error) {
      console.error("DEX analytics error:", error.message);
    }
  }

  // ================== MARKET TRENDS ==================
  async demonstrateMarketTrends() {
    console.log("\n📈 MARKET TRENDS ANALYSIS");
    console.log("=".repeat(50));

    try {
      // Search for trending tokens
      console.log("\n🔥 Trending Analysis:");
      const searchTerms = ["SOL", "meme", "AI", "gaming"];

      for (const term of searchTerms) {
        const results = await this.sdk.dexscreener.searchPairs(term);
        if (results?.pairs?.length > 0) {
          console.log(`\n${term.toUpperCase()} Related Tokens:`);
          results.pairs.slice(0, 3).forEach((pair, index) => {
            const change24h = pair.priceChange?.h24 || 0;
            const trending =
              change24h > 10 ? "🚀" : change24h < -10 ? "📉" : "📊";
            console.log(
              `  ${trending} ${pair.baseToken.symbol}: ${change24h.toFixed(
                2
              )}% (24h)`
            );
          });
        }
      }

      // Volume analysis
      console.log("\n💰 High Volume Pairs:");
      const highVolumePairs = await this.sdk.dexscreener.getTokenPairs(
        "solana",
        "So11111111111111111111111111111111111111112"
      );
      if (highVolumePairs?.pairs?.length > 0) {
        const sortedByVolume = highVolumePairs.pairs
          .filter((pair) => pair.volume?.h24)
          .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
          .slice(0, 5);

        sortedByVolume.forEach((pair, index) => {
          console.log(
            `${index + 1}. ${pair.baseToken.symbol}/${pair.quoteToken.symbol}`
          );
          console.log(`   Volume: $${(pair.volume.h24 / 1e6).toFixed(2)}M`);
          console.log(`   DEX: ${pair.dexId}`);
        });
      }

      // Price change leaders
      console.log("\n🎯 Price Change Leaders:");
      const tokens = [
        "So11111111111111111111111111111111111111112",
        "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      ];
      const allPairs = [];

      for (const token of tokens) {
        const pairs = await this.sdk.dexscreener.getTokenPairs("solana", token);
        if (pairs?.pairs) {
          allPairs.push(...pairs.pairs);
        }
      }

      const gainers = allPairs
        .filter((pair) => pair.priceChange?.h24 && pair.priceChange.h24 > 0)
        .sort((a, b) => (b.priceChange?.h24 || 0) - (a.priceChange?.h24 || 0))
        .slice(0, 3);

      const losers = allPairs
        .filter((pair) => pair.priceChange?.h24 && pair.priceChange.h24 < 0)
        .sort((a, b) => (a.priceChange?.h24 || 0) - (b.priceChange?.h24 || 0))
        .slice(0, 3);

      console.log("\nTop Gainers (24h):");
      gainers.forEach((pair, index) => {
        console.log(
          `${index + 1}. ${
            pair.baseToken.symbol
          }: +${pair.priceChange.h24.toFixed(2)}%`
        );
      });

      console.log("\nTop Losers (24h):");
      losers.forEach((pair, index) => {
        console.log(
          `${index + 1}. ${
            pair.baseToken.symbol
          }: ${pair.priceChange.h24.toFixed(2)}%`
        );
      });
    } catch (error) {
      console.error("Market trends error:", error.message);
    }
  }

  // ================== LIQUIDITY ANALYSIS ==================
  async demonstrateLiquidityAnalysis() {
    console.log("\n💧 LIQUIDITY ANALYSIS");
    console.log("=".repeat(50));

    try {
      // Analyze liquidity across different tokens
      const tokens = {
        SOL: "So11111111111111111111111111111111111111112",
        USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      };

      console.log("\n🌊 Liquidity Distribution:");
      const liquidityData = [];

      for (const [symbol, address] of Object.entries(tokens)) {
        const pairs = await this.sdk.dexscreener.getTokenPairs(
          "solana",
          address
        );
        if (pairs?.pairs?.length > 0) {
          const totalLiquidity = pairs.pairs.reduce(
            (sum, pair) => sum + (pair.liquidity?.usd || 0),
            0
          );
          const pairCount = pairs.pairs.length;
          const avgLiquidity = totalLiquidity / pairCount;

          liquidityData.push({
            symbol,
            totalLiquidity,
            pairCount,
            avgLiquidity,
            topPair: pairs.pairs[0],
          });

          console.log(`${symbol}:`);
          console.log(
            `  Total Liquidity: $${(totalLiquidity / 1e6).toFixed(2)}M`
          );
          console.log(`  Trading Pairs: ${pairCount}`);
          console.log(`  Avg Liquidity: $${(avgLiquidity / 1e6).toFixed(2)}M`);
          console.log(`  Main DEX: ${pairs.pairs[0].dexId}`);
          console.log("");
        }
      }

      // Liquidity concentration analysis
      console.log("\n🎯 Liquidity Concentration:");
      liquidityData.forEach((data) => {
        const topPairLiquidity = data.topPair.liquidity?.usd || 0;
        const concentration = (topPairLiquidity / data.totalLiquidity) * 100;
        console.log(
          `${data.symbol}: ${concentration.toFixed(1)}% in top pair (${
            data.topPair.dexId
          })`
        );
      });

      // DEX liquidity comparison
      console.log("\n🏛️ DEX Liquidity Comparison:");
      const dexLiquidity = {};

      liquidityData.forEach((data) => {
        const pairs = data.topPair;
        const dexId = pairs.dexId;
        if (!dexLiquidity[dexId]) {
          dexLiquidity[dexId] = 0;
        }
        dexLiquidity[dexId] += pairs.liquidity?.usd || 0;
      });

      Object.entries(dexLiquidity)
        .sort(([, a], [, b]) => b - a)
        .forEach(([dexId, liquidity], index) => {
          console.log(
            `${index + 1}. ${dexId}: $${(liquidity / 1e6).toFixed(2)}M`
          );
        });
    } catch (error) {
      console.error("Liquidity analysis error:", error.message);
    }
  }

  // ================== ARBITRAGE OPPORTUNITIES ==================
  async demonstrateArbitrageOpportunities() {
    console.log("\n⚡ ARBITRAGE OPPORTUNITIES");
    console.log("=".repeat(50));

    try {
      // Look for price differences across DEXs
      const targetTokens = [
        "So11111111111111111111111111111111111111112", // SOL
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      ];

      console.log("\n🔍 Cross-DEX Price Analysis:");

      for (const tokenAddress of targetTokens) {
        const pairs = await this.sdk.dexscreener.getTokenPairs(
          "solana",
          tokenAddress
        );
        if (pairs?.pairs?.length > 1) {
          const tokenSymbol = pairs.pairs[0].baseToken.symbol;
          console.log(`\n${tokenSymbol} Price Variations:`);

          // Group by DEX
          const dexPrices = {};
          pairs.pairs.forEach((pair) => {
            if (pair.priceUsd && pair.volume?.h24 > 10000) {
              // Only consider pairs with decent volume
              if (!dexPrices[pair.dexId]) {
                dexPrices[pair.dexId] = [];
              }
              dexPrices[pair.dexId].push({
                price: parseFloat(pair.priceUsd),
                volume: pair.volume.h24,
                liquidity: pair.liquidity?.usd || 0,
              });
            }
          });

          // Calculate average prices per DEX
          const dexAvgPrices = {};
          Object.entries(dexPrices).forEach(([dexId, prices]) => {
            const avgPrice =
              prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
            const totalVolume = prices.reduce((sum, p) => sum + p.volume, 0);
            dexAvgPrices[dexId] = { price: avgPrice, volume: totalVolume };
          });

          // Find arbitrage opportunities
          const dexEntries = Object.entries(dexAvgPrices);
          if (dexEntries.length > 1) {
            dexEntries.sort(([, a], [, b]) => a.price - b.price);
            const lowest = dexEntries[0];
            const highest = dexEntries[dexEntries.length - 1];
            const priceDiff =
              ((highest[1].price - lowest[1].price) / lowest[1].price) * 100;

            console.log(
              `  Lowest: ${lowest[0]} - $${lowest[1].price.toFixed(6)}`
            );
            console.log(
              `  Highest: ${highest[0]} - $${highest[1].price.toFixed(6)}`
            );
            console.log(`  Opportunity: ${priceDiff.toFixed(2)}%`);

            if (priceDiff > 0.5) {
              console.log(
                `  🚨 ARBITRAGE ALERT: ${priceDiff.toFixed(2)}% spread!`
              );
            }
          }
        }
      }

      // Volume-weighted arbitrage analysis
      console.log("\n📊 Volume-Weighted Opportunities:");
      const solPairs = await this.sdk.dexscreener.getTokenPairs(
        "solana",
        "So11111111111111111111111111111111111111112"
      );
      if (solPairs?.pairs?.length > 0) {
        const highVolumePairs = solPairs.pairs
          .filter((pair) => pair.volume?.h24 > 100000 && pair.priceUsd)
          .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
          .slice(0, 5);

        if (highVolumePairs.length > 1) {
          const minPrice = Math.min(
            ...highVolumePairs.map((p) => parseFloat(p.priceUsd))
          );
          const maxPrice = Math.max(
            ...highVolumePairs.map((p) => parseFloat(p.priceUsd))
          );
          const spreadPercentage = ((maxPrice - minPrice) / minPrice) * 100;

          console.log(
            `High-volume pairs spread: ${spreadPercentage.toFixed(3)}%`
          );
          console.log(
            `Min: $${minPrice.toFixed(6)} | Max: $${maxPrice.toFixed(6)}`
          );
        }
      }
    } catch (error) {
      console.error("Arbitrage analysis error:", error.message);
    }
  }

  // ================== COMPREHENSIVE DEMO ==================
  async runComprehensiveDemo() {
    console.log("📊 DEXSCREENER COMPREHENSIVE DEMO");
    console.log("=".repeat(60));

    // Run all demonstrations
    await this.demonstrateTokenPairAnalytics();
    await this.demonstrateDexAnalytics();
    await this.demonstrateMarketTrends();
    await this.demonstrateLiquidityAnalysis();
    await this.demonstrateArbitrageOpportunities();

    console.log("\n✅ DEXSCREENER DEMO COMPLETED");
    console.log(
      "All DEX analytics and market data features demonstrated successfully!"
    );
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting DexScreener SDK Demo...\n");

  const dexscreenerExample = new DexScreenerExample();

  try {
    await dexscreenerExample.runComprehensiveDemo();

    console.log("\n💡 Key Insights:");
    console.log("1. Monitor liquidity distribution across DEXs");
    console.log("2. Track price discrepancies for arbitrage");
    console.log("3. Analyze volume trends for market sentiment");
    console.log("4. Use DEX comparison for optimal trading");
  } catch (error) {
    console.error("Demo failed:", error.message);
    console.log(
      "\nNote: Some features may be rate-limited or require network access"
    );
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DexScreenerExample };
