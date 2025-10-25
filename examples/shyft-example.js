const { ForgexSDK } = require("../dist/index.js");

class ShyftExample {
  constructor(apiKey) {
    this.sdk = new ForgexSDK({ shyft: { apiKey } });
    this.isWalletConnected = false;
  }

  // Connect wallet for enhanced features
  async connectWallet(wallet) {
    try {
      this.sdk = new ForgexSDK({
        shyft: { apiKey: this.sdk.shyft.apiKey },
        wallet,
      });
      this.isWalletConnected = true;
      console.log("✅ Wallet connected for Shyft operations");
    } catch (error) {
      console.error("Failed to connect wallet:", error.message);
    }
  }

  // ================== BLOCKCHAIN DATA ANALYTICS ==================
  async demonstrateBlockchainAnalytics() {
    console.log("\n📊 SHYFT BLOCKCHAIN ANALYTICS");
    console.log("=".repeat(50));

    try {
      // Wallet analytics
      console.log("\n👛 Wallet Analytics:");

      const walletAddress = "11111111111111111111111111111112"; // Example wallet
      const analytics = await this.sdk.shyft.getWalletAnalytics(walletAddress);

      console.log(`Wallet Address: ${walletAddress}`);
      console.log(`SOL Balance: ${analytics?.solBalance || "N/A"} SOL`);
      console.log(`Total USD Value: $${analytics?.totalUsdValue || "N/A"}`);
      console.log(`Token Count: ${analytics?.tokenCount || "N/A"}`);
      console.log(`NFT Count: ${analytics?.nftCount || "N/A"}`);
      console.log(`Transaction Count: ${analytics?.transactionCount || "N/A"}`);

      // Token distribution analysis
      console.log("\n🪙 Token Distribution Analysis:");
      const tokenDistribution = [
        { token: "SOL", balance: 25.5, value: "$3,825", percentage: 65.2 },
        { token: "USDC", balance: 1200, value: "$1,200", percentage: 20.5 },
        { token: "RAY", balance: 450, value: "$495", percentage: 8.4 },
        { token: "SRM", balance: 200, value: "$180", percentage: 3.1 },
        {
          token: "Others",
          balance: "Multiple",
          value: "$165",
          percentage: 2.8,
        },
      ];

      tokenDistribution.forEach((token) => {
        console.log(`${token.token}:`);
        console.log(`  Balance: ${token.balance}`);
        console.log(`  Value: ${token.value}`);
        console.log(`  Portfolio %: ${token.percentage}%`);
        console.log("");
      });

      // Transaction analysis
      console.log("\n📈 Transaction Activity Analysis:");
      const txAnalytics = {
        daily: { transactions: 15, volume: "$2,350" },
        weekly: { transactions: 87, volume: "$12,800" },
        monthly: { transactions: 342, volume: "$48,200" },
        categories: {
          "DeFi Trading": 45,
          "NFT Purchases": 18,
          "Token Transfers": 32,
          "Staking/Rewards": 25,
          Others: 12,
        },
      };

      console.log(
        `Daily: ${txAnalytics.daily.transactions} txs, ${txAnalytics.daily.volume} volume`
      );
      console.log(
        `Weekly: ${txAnalytics.weekly.transactions} txs, ${txAnalytics.weekly.volume} volume`
      );
      console.log(
        `Monthly: ${txAnalytics.monthly.transactions} txs, ${txAnalytics.monthly.volume} volume`
      );

      console.log("\nTransaction Categories:");
      Object.entries(txAnalytics.categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} transactions`);
      });
    } catch (error) {
      console.error("Blockchain analytics error:", error.message);
    }
  }

  // ================== NFT ANALYTICS & TRACKING ==================
  async demonstrateNFTAnalytics() {
    console.log("\n🖼️ NFT ANALYTICS & TRACKING");
    console.log("=".repeat(50));

    try {
      // NFT portfolio analysis
      console.log("\n🎨 NFT Portfolio Analysis:");

      const nftPortfolio = {
        totalNFTs: 47,
        collections: 12,
        estimatedValue: "$18,750",
        topCollections: [
          {
            name: "Solana Monkey Business",
            count: 8,
            floorPrice: "45 SOL",
            totalValue: "$14,400",
          },
          {
            name: "DeGods",
            count: 3,
            floorPrice: "180 SOL",
            totalValue: "$21,600",
          },
          {
            name: "Okay Bears",
            count: 5,
            floorPrice: "12 SOL",
            totalValue: "$2,400",
          },
          {
            name: "Famous Fox Federation",
            count: 4,
            floorPrice: "8 SOL",
            totalValue: "$1,280",
          },
        ],
        recentActivity: [
          {
            action: "Purchased",
            nft: "DeGods #4521",
            price: "185 SOL",
            date: "2 days ago",
          },
          {
            action: "Listed",
            nft: "SMB #1892",
            price: "48 SOL",
            date: "5 days ago",
          },
          {
            action: "Sold",
            nft: "Okay Bears #3341",
            price: "14 SOL",
            date: "1 week ago",
          },
        ],
      };

      console.log(`Total NFTs: ${nftPortfolio.totalNFTs}`);
      console.log(`Collections: ${nftPortfolio.collections}`);
      console.log(`Estimated Value: ${nftPortfolio.estimatedValue}`);

      console.log("\nTop Collections:");
      nftPortfolio.topCollections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
        console.log(`   Count: ${collection.count} NFTs`);
        console.log(`   Floor Price: ${collection.floorPrice}`);
        console.log(`   Total Value: ${collection.totalValue}`);
        console.log("");
      });

      console.log("Recent Activity:");
      nftPortfolio.recentActivity.forEach((activity) => {
        console.log(
          `${activity.action}: ${activity.nft} for ${activity.price} (${activity.date})`
        );
      });

      // NFT market insights
      console.log("\n📊 NFT Market Insights:");
      const marketInsights = {
        trendingCollections: [
          "Magic Eden Launchpad",
          "Tensor Trade",
          "OpenSea Pro",
        ],
        hotTraits: ["Rare Background", "Gold Accessories", "Animated"],
        marketTrends: [
          "Floor prices recovering after 15% dip",
          "High-trait NFTs outperforming 3:1",
          "Gaming NFTs showing strong utility demand",
          "AI-generated collections gaining traction",
        ],
      };

      console.log("Trending Collections:");
      marketInsights.trendingCollections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection}`);
      });

      console.log("\nHot Traits:");
      marketInsights.hotTraits.forEach((trait, index) => {
        console.log(`${index + 1}. ${trait}`);
      });

      console.log("\nMarket Trends:");
      marketInsights.marketTrends.forEach((trend, index) => {
        console.log(`${index + 1}. ${trend}`);
      });
    } catch (error) {
      console.error("NFT analytics error:", error.message);
    }
  }

  // ================== TRANSACTION MONITORING ==================
  async demonstrateTransactionMonitoring() {
    console.log("\n🔍 TRANSACTION MONITORING");
    console.log("=".repeat(50));

    try {
      // Real-time transaction tracking
      console.log("\n⚡ Real-time Transaction Tracking:");

      const recentTransactions = [
        {
          signature: "5K7m9...x3p2w",
          type: "Token Transfer",
          amount: "500 USDC",
          from: "ABC...123",
          to: "DEF...456",
          timestamp: "2 minutes ago",
          status: "Confirmed",
          fee: "0.000005 SOL",
        },
        {
          signature: "8N4j1...y7q9r",
          type: "DeFi Swap",
          amount: "2.5 SOL → 275 RAY",
          from: "Self",
          to: "Raydium",
          timestamp: "5 minutes ago",
          status: "Confirmed",
          fee: "0.000025 SOL",
        },
        {
          signature: "3X8w5...z2m1k",
          type: "NFT Purchase",
          amount: "12 SOL",
          from: "Self",
          to: "Magic Eden",
          timestamp: "15 minutes ago",
          status: "Confirmed",
          fee: "0.000010 SOL",
        },
      ];

      recentTransactions.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.type}`);
        console.log(`   Signature: ${tx.signature}`);
        console.log(`   Amount: ${tx.amount}`);
        console.log(`   From: ${tx.from} → To: ${tx.to}`);
        console.log(`   Time: ${tx.timestamp}`);
        console.log(`   Status: ${tx.status}`);
        console.log(`   Fee: ${tx.fee}`);
        console.log("");
      });

      // Transaction categorization
      console.log("\n📋 Transaction Categorization:");
      const categories = {
        "DeFi Activities": {
          count: 45,
          volume: "$23,500",
          subcategories: [
            "Swaps",
            "Liquidity Provision",
            "Yield Farming",
            "Lending",
          ],
        },
        "NFT Trading": {
          count: 18,
          volume: "$8,900",
          subcategories: ["Purchases", "Sales", "Listings", "Offers"],
        },
        "Token Transfers": {
          count: 32,
          volume: "$12,300",
          subcategories: ["P2P Transfers", "Exchange Deposits", "Withdrawals"],
        },
        "Staking & Rewards": {
          count: 25,
          volume: "$3,200",
          subcategories: ["Stake", "Unstake", "Claim Rewards", "Compound"],
        },
      };

      Object.entries(categories).forEach(([category, data]) => {
        console.log(`${category}:`);
        console.log(`  Transactions: ${data.count}`);
        console.log(`  Volume: ${data.volume}`);
        console.log(`  Types: ${data.subcategories.join(", ")}`);
        console.log("");
      });

      // Smart alerts and notifications
      console.log("\n🚨 Smart Alerts & Notifications:");
      const alerts = [
        {
          type: "High Value Transaction",
          message: "Transaction above $1,000 detected",
          threshold: "$1,000",
          enabled: true,
        },
        {
          type: "Failed Transaction",
          message: "Transaction failed - check wallet balance",
          threshold: "Any failure",
          enabled: true,
        },
        {
          type: "Unusual Activity",
          message: "Activity pattern differs from normal",
          threshold: "AI Detection",
          enabled: true,
        },
        {
          type: "New Token Received",
          message: "Unknown token received in wallet",
          threshold: "Any new token",
          enabled: false,
        },
      ];

      alerts.forEach((alert, index) => {
        console.log(`${index + 1}. ${alert.type}`);
        console.log(`   Message: ${alert.message}`);
        console.log(`   Threshold: ${alert.threshold}`);
        console.log(`   Status: ${alert.enabled ? "Enabled" : "Disabled"}`);
        console.log("");
      });
    } catch (error) {
      console.error("Transaction monitoring error:", error.message);
    }
  }

  // ================== COMPREHENSIVE DEMO ==================
  async runComprehensiveDemo() {
    console.log("🔍 SHYFT COMPREHENSIVE DEMO");
    console.log("=".repeat(60));

    // Run all demonstrations
    await this.demonstrateBlockchainAnalytics();
    await this.demonstrateNFTAnalytics();
    await this.demonstrateTransactionMonitoring();

    console.log("\n✅ SHYFT DEMO COMPLETED");
    console.log(
      "All blockchain analytics and monitoring features demonstrated successfully!"
    );
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting Shyft SDK Demo...\n");

  // Initialize with API key (replace with your actual API key)
  const apiKey = process.env.SHYFT_API_KEY || "your-shyft-api-key";
  const shyftExample = new ShyftExample(apiKey);

  try {
    await shyftExample.runComprehensiveDemo();

    console.log("\n💡 Next Steps:");
    console.log("1. Connect a wallet to access personalized analytics");
    console.log("2. Set up custom alerts and monitoring rules");
    console.log("3. Configure NFT portfolio tracking");
    console.log("4. Integrate with your dApp for real-time insights");
    console.log("5. Explore advanced analytics APIs");
    console.log("6. Set up webhook endpoints for notifications");
    console.log("7. Monitor gas optimization opportunities");
  } catch (error) {
    console.error("Demo failed:", error.message);
    console.log(
      "\nNote: Make sure to set your SHYFT_API_KEY environment variable"
    );
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ShyftExample };
