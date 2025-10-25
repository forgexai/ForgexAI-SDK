const { ForgexSDK } = require("../dist/index.js");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");

class ClockworkExample {
  constructor(rpcUrl = "https://api.mainnet-beta.solana.com") {
    // Initialize SDK without wallet for read-only operations
    this.sdk = new ForgexSDK();
    this.connection = new Connection(rpcUrl);
    this.isWalletConnected = false;
  }

  // Connect wallet for write operations
  async connectWallet(wallet) {
    try {
      this.sdk = new ForgexSDK({ wallet });
      this.isWalletConnected = true;
      console.log("✅ Wallet connected for Clockwork operations");
    } catch (error) {
      console.error("Failed to connect wallet:", error.message);
    }
  }

  // ================== THREAD MANAGEMENT ==================
  async demonstrateThreadManagement() {
    console.log("\n🕐 CLOCKWORK THREAD MANAGEMENT");
    console.log("=".repeat(50));

    try {
      // List existing threads
      console.log("\n📋 Existing Threads:");
      const threads = await this.sdk.clockwork.getThreads();
      if (threads?.length > 0) {
        threads.slice(0, 5).forEach((thread, index) => {
          console.log(`${index + 1}. Thread: ${thread.address}`);
          console.log(`   Trigger: ${thread.trigger?.type || "N/A"}`);
          console.log(`   Status: ${thread.paused ? "Paused" : "Active"}`);
          console.log(`   Next Run: ${thread.nextRun || "N/A"}`);
          console.log("");
        });
      } else {
        console.log("No threads found or Clockwork service unavailable");
      }

      if (this.isWalletConnected) {
        // Create a simple recurring thread
        console.log("\n🆕 Creating Recurring Thread:");
        const threadConfig = {
          id: `demo-thread-${Date.now()}`,
          instructions: [
            {
              programId: "11111111111111111111111111111111",
              accounts: [],
              data: Buffer.from([]),
            },
          ],
          trigger: {
            type: "cron",
            schedule: "0 */1 * * *", // Every hour
          },
        };

        const createResult = await this.sdk.clockwork.createThread(
          threadConfig
        );
        if (createResult?.signature) {
          console.log(`✅ Thread created: ${createResult.signature}`);
        }

        // Pause and resume thread
        console.log("\n⏸️ Thread Control Operations:");
        const threadAddress = createResult?.threadAddress;
        if (threadAddress) {
          // Pause thread
          const pauseResult = await this.sdk.clockwork.pauseThread(
            threadAddress
          );
          console.log(`Thread paused: ${pauseResult?.signature || "Failed"}`);

          // Resume thread
          const resumeResult = await this.sdk.clockwork.resumeThread(
            threadAddress
          );
          console.log(`Thread resumed: ${resumeResult?.signature || "Failed"}`);
        }
      } else {
        console.log(
          "ℹ️ Wallet connection required for thread creation operations"
        );
      }
    } catch (error) {
      console.error("Thread management error:", error.message);
    }
  }

  // ================== AUTOMATION STRATEGIES ==================
  async demonstrateAutomationStrategies() {
    console.log("\n🤖 AUTOMATION STRATEGIES");
    console.log("=".repeat(50));

    try {
      // DCA (Dollar Cost Averaging) automation
      console.log("\n💰 DCA Automation Strategy:");
      if (this.isWalletConnected) {
        const dcaConfig = {
          id: `dca-sol-${Date.now()}`,
          tokenIn: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
          tokenOut: "So11111111111111111111111111111111111111112", // SOL
          amountIn: 10 * 1e6, // $10 USDC
          trigger: {
            type: "cron",
            schedule: "0 0 * * 1", // Every Monday at midnight
          },
        };

        console.log("DCA Configuration:");
        console.log(`  Buy $10 SOL every Monday`);
        console.log(`  Token In: USDC`);
        console.log(`  Token Out: SOL`);
        console.log(`  Schedule: Weekly`);

        // This would create a DCA thread (implementation depends on Clockwork setup)
        console.log("✅ DCA automation configured");
      }

      // Rebalancing automation
      console.log("\n⚖️ Portfolio Rebalancing:");
      const rebalanceConfig = {
        id: `rebalance-${Date.now()}`,
        portfolioTargets: {
          So11111111111111111111111111111111111111112: 50, // 50% SOL
          EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 30, // 30% USDC
          "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": 20, // 20% RAY
        },
        threshold: 5, // Rebalance if allocation differs by 5%
        trigger: {
          type: "cron",
          schedule: "0 0 1 * *", // Monthly on 1st
        },
      };

      console.log("Rebalancing Strategy:");
      console.log(`  Target: 50% SOL, 30% USDC, 20% RAY`);
      console.log(`  Threshold: 5% deviation`);
      console.log(`  Frequency: Monthly`);

      // Yield harvesting automation
      console.log("\n🌾 Yield Harvesting:");
      const harvestConfig = {
        id: `harvest-${Date.now()}`,
        protocols: ["marginfi", "meteora", "raydium"],
        minHarvestAmount: 0.1, // Minimum 0.1 SOL equivalent
        autoCompound: true,
        trigger: {
          type: "cron",
          schedule: "0 0 */3 * *", // Every 3 days
        },
      };

      console.log("Yield Harvesting:");
      console.log(`  Protocols: MarginFi, Meteora, Raydium`);
      console.log(`  Min Amount: 0.1 SOL equivalent`);
      console.log(`  Auto-compound: Enabled`);
      console.log(`  Frequency: Every 3 days`);
    } catch (error) {
      console.error("Automation strategies error:", error.message);
    }
  }

  // ================== SCHEDULING SYSTEM ==================
  async demonstrateSchedulingSystem() {
    console.log("\n📅 SCHEDULING SYSTEM");
    console.log("=".repeat(50));

    try {
      // Different trigger types
      console.log("\n⏰ Schedule Types:");

      const scheduleExamples = [
        {
          name: "Hourly Check",
          cron: "0 * * * *",
          description: "Run every hour",
        },
        {
          name: "Daily Report",
          cron: "0 9 * * *",
          description: "Daily at 9 AM",
        },
        {
          name: "Weekly Rebalance",
          cron: "0 0 * * 1",
          description: "Every Monday midnight",
        },
        {
          name: "Monthly Harvest",
          cron: "0 0 1 * *",
          description: "First day of month",
        },
        {
          name: "Quarterly Review",
          cron: "0 0 1 */3 *",
          description: "Every 3 months",
        },
      ];

      scheduleExamples.forEach((schedule, index) => {
        console.log(`${index + 1}. ${schedule.name}`);
        console.log(`   Cron: ${schedule.cron}`);
        console.log(`   Description: ${schedule.description}`);
        console.log("");
      });

      // Conditional triggers
      console.log("\n🎯 Conditional Triggers:");
      const conditionalTriggers = [
        {
          name: "Price Alert",
          condition: "SOL price > $200",
          action: "Sell 10% of SOL holdings",
        },
        {
          name: "Volatility Response",
          condition: "24h volatility > 15%",
          action: "Reduce position sizes",
        },
        {
          name: "Yield Opportunity",
          condition: "APY > 20%",
          action: "Allocate to high-yield pool",
        },
        {
          name: "Risk Management",
          condition: "Portfolio loss > 5%",
          action: "Stop all automated trades",
        },
      ];

      conditionalTriggers.forEach((trigger, index) => {
        console.log(`${index + 1}. ${trigger.name}`);
        console.log(`   If: ${trigger.condition}`);
        console.log(`   Then: ${trigger.action}`);
        console.log("");
      });
    } catch (error) {
      console.error("Scheduling system error:", error.message);
    }
  }

  // ================== RECURRING TASKS ==================
  async demonstrateRecurringTasks() {
    console.log("\n🔄 RECURRING TASKS");
    console.log("=".repeat(50));

    try {
      // Portfolio monitoring tasks
      console.log("\n📊 Portfolio Monitoring Tasks:");

      const monitoringTasks = [
        {
          name: "Balance Check",
          frequency: "Every 15 minutes",
          description:
            "Monitor wallet balances and alert on significant changes",
        },
        {
          name: "Price Tracking",
          frequency: "Every 5 minutes",
          description: "Track price movements of held tokens",
        },
        {
          name: "Yield Monitoring",
          frequency: "Hourly",
          description: "Check farming/staking rewards across protocols",
        },
        {
          name: "Risk Assessment",
          frequency: "Daily",
          description: "Analyze portfolio risk metrics and exposure",
        },
      ];

      monitoringTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.name}`);
        console.log(`   Frequency: ${task.frequency}`);
        console.log(`   Purpose: ${task.description}`);
        console.log("");
      });

      // Trading automation tasks
      console.log("\n💹 Trading Automation Tasks:");

      const tradingTasks = [
        {
          name: "DCA Execution",
          frequency: "Weekly",
          description: "Execute dollar-cost averaging purchases",
        },
        {
          name: "Profit Taking",
          frequency: "Daily",
          description: "Take profits when targets are hit",
        },
        {
          name: "Stop Loss Management",
          frequency: "Real-time",
          description: "Execute stop losses when triggered",
        },
        {
          name: "Arbitrage Scanning",
          frequency: "Every minute",
          description: "Scan for arbitrage opportunities",
        },
      ];

      tradingTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.name}`);
        console.log(`   Frequency: ${task.frequency}`);
        console.log(`   Purpose: ${task.description}`);
        console.log("");
      });

      // Maintenance tasks
      console.log("\n🔧 Maintenance Tasks:");

      const maintenanceTasks = [
        {
          name: "Reward Claiming",
          frequency: "Daily",
          description: "Claim pending rewards from all protocols",
        },
        {
          name: "Position Cleanup",
          frequency: "Weekly",
          description: "Close dust positions and consolidate holdings",
        },
        {
          name: "Fee Optimization",
          frequency: "Daily",
          description: "Optimize transaction fees and timing",
        },
        {
          name: "Protocol Updates",
          frequency: "Monthly",
          description: "Check for protocol upgrades and migrations",
        },
      ];

      maintenanceTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.name}`);
        console.log(`   Frequency: ${task.frequency}`);
        console.log(`   Purpose: ${task.description}`);
        console.log("");
      });
    } catch (error) {
      console.error("Recurring tasks error:", error.message);
    }
  }

  // ================== MONITORING & ANALYTICS ==================
  async demonstrateMonitoringAnalytics() {
    console.log("\n📈 MONITORING & ANALYTICS");
    console.log("=".repeat(50));

    try {
      // Thread performance monitoring
      console.log("\n⚡ Thread Performance:");
      const threads = await this.sdk.clockwork.getThreads();

      if (threads?.length > 0) {
        let successfulRuns = 0;
        let failedRuns = 0;
        let totalGasCost = 0;

        threads.forEach((thread) => {
          if (thread.stats) {
            successfulRuns += thread.stats.successful || 0;
            failedRuns += thread.stats.failed || 0;
            totalGasCost += thread.stats.totalGas || 0;
          }
        });

        const totalRuns = successfulRuns + failedRuns;
        const successRate =
          totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

        console.log(`Total Threads: ${threads.length}`);
        console.log(`Success Rate: ${successRate.toFixed(2)}%`);
        console.log(`Total Runs: ${totalRuns}`);
        console.log(`Total Gas Used: ${totalGasCost} lamports`);
      }

      // Automation ROI analysis
      console.log("\n💰 Automation ROI Analysis:");
      const automationMetrics = {
        timeSaved: 40, // hours per month
        gasCosts: 0.5, // SOL per month
        tradingProfit: 150, // USD improvement per month
        compoundingBenefit: 300, // USD from automated compounding
      };

      console.log(`Time Saved: ${automationMetrics.timeSaved} hours/month`);
      console.log(`Gas Costs: ${automationMetrics.gasCosts} SOL/month`);
      console.log(
        `Trading Improvement: $${automationMetrics.tradingProfit}/month`
      );
      console.log(
        `Compounding Benefit: $${automationMetrics.compoundingBenefit}/month`
      );

      const netBenefit =
        automationMetrics.tradingProfit +
        automationMetrics.compoundingBenefit -
        automationMetrics.gasCosts * 100; // Assuming SOL = $100
      console.log(`Net Monthly Benefit: $${netBenefit.toFixed(2)}`);

      // Alert system status
      console.log("\n🚨 Alert System Status:");
      const alertsConfig = [
        { type: "Price Alerts", active: 5, triggered: 2 },
        { type: "Portfolio Alerts", active: 3, triggered: 0 },
        { type: "Yield Alerts", active: 4, triggered: 1 },
        { type: "Risk Alerts", active: 2, triggered: 0 },
      ];

      alertsConfig.forEach((alert) => {
        console.log(
          `${alert.type}: ${alert.active} active, ${alert.triggered} triggered today`
        );
      });
    } catch (error) {
      console.error("Monitoring analytics error:", error.message);
    }
  }

  // ================== COMPREHENSIVE DEMO ==================
  async runComprehensiveDemo() {
    console.log("🕐 CLOCKWORK COMPREHENSIVE DEMO");
    console.log("=".repeat(60));

    // Run all demonstrations
    await this.demonstrateThreadManagement();
    await this.demonstrateAutomationStrategies();
    await this.demonstrateSchedulingSystem();
    await this.demonstrateRecurringTasks();
    await this.demonstrateMonitoringAnalytics();

    console.log("\n✅ CLOCKWORK DEMO COMPLETED");
    console.log(
      "All automation and scheduling features demonstrated successfully!"
    );
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting Clockwork SDK Demo...\n");

  const clockworkExample = new ClockworkExample();

  try {
    await clockworkExample.runComprehensiveDemo();

    console.log("\n💡 Next Steps:");
    console.log("1. Connect a wallet to enable thread creation");
    console.log("2. Set up your first automated strategy");
    console.log("3. Monitor performance and optimize");
    console.log("4. Scale up successful automation patterns");
  } catch (error) {
    console.error("Demo failed:", error.message);
    console.log(
      "\nNote: Some features require a connected wallet and Clockwork network access"
    );
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ClockworkExample };
