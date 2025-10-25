/**
 * MarginFi Protocol Example
 * Comprehensive guide to lending, borrowing, and managing positions
 *
 * Features covered:
 * - Account creation and management
 * - Lending operations (deposit/withdraw)
 * - Borrowing operations (borrow/repay)
 * - Position monitoring and health checks
 * - Risk management strategies
 * - Liquidation protection
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");

class MarginFiExample {
  constructor() {
    // Initialize SDK with MarginFi support
    this.sdk = ForgeXSolanaSDK.mainnet({
      marginfi: "your-marginfi-api-key", // Optional - some features work without API key
    });

    this.userWallet = null; // Will be set when wallet connects
  }

  // ============================================
  // ACCOUNT MANAGEMENT
  // ============================================

  /**
   * Initialize MarginFi client and create user account
   */
  async initializeAccount() {
    try {
      console.log("🏦 Initializing MarginFi Account...");

      if (!this.sdk.marginfi) {
        throw new Error("MarginFi service not available - check API key");
      }

      // Initialize the MarginFi client
      await this.sdk.marginfi.initialize();
      console.log("✅ MarginFi client initialized");

      // Create or get user account
      const userAccount = await this.sdk.marginfi.createUserAccount();
      console.log("✅ User account created/retrieved:", userAccount);

      return userAccount;
    } catch (error) {
      console.error("❌ Account initialization failed:", error.message);
      throw error;
    }
  }

  /**
   * Get user account information
   */
  async getUserAccountInfo() {
    try {
      console.log("📊 Fetching User Account Information...");

      const accountInfo = await this.sdk.marginfi.getUserAccountInfo();

      console.log("Account Summary:");
      console.log("- Total Deposited:", accountInfo.totalDeposited || 0);
      console.log("- Total Borrowed:", accountInfo.totalBorrowed || 0);
      console.log("- Health Factor:", accountInfo.healthFactor || "N/A");
      console.log("- Account Address:", accountInfo.address || "N/A");

      return accountInfo;
    } catch (error) {
      console.error("❌ Failed to get account info:", error.message);
      throw error;
    }
  }

  // ============================================
  // LENDING OPERATIONS
  // ============================================

  /**
   * Deposit tokens to earn yield
   */
  async depositTokens(tokenSymbol = "USDC", amount = 100) {
    try {
      console.log(`💰 Depositing ${amount} ${tokenSymbol}...`);

      const depositResult = await this.sdk.marginfi.deposit({
        token: tokenSymbol,
        amount: amount,
        userAccount: this.userWallet?.publicKey,
      });

      console.log("✅ Deposit successful!");
      console.log("- Transaction:", depositResult.transaction);
      console.log("- New Balance:", depositResult.newBalance);
      console.log("- Interest Rate:", depositResult.interestRate + "%");

      return depositResult;
    } catch (error) {
      console.error("❌ Deposit failed:", error.message);
      throw error;
    }
  }

  /**
   * Withdraw deposited tokens
   */
  async withdrawTokens(tokenSymbol = "USDC", amount = 50) {
    try {
      console.log(`💸 Withdrawing ${amount} ${tokenSymbol}...`);

      const withdrawResult = await this.sdk.marginfi.withdraw({
        token: tokenSymbol,
        amount: amount,
        userAccount: this.userWallet?.publicKey,
      });

      console.log("✅ Withdrawal successful!");
      console.log("- Transaction:", withdrawResult.transaction);
      console.log("- Remaining Balance:", withdrawResult.remainingBalance);

      return withdrawResult;
    } catch (error) {
      console.error("❌ Withdrawal failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // BORROWING OPERATIONS
  // ============================================

  /**
   * Borrow tokens against collateral
   */
  async borrowTokens(tokenSymbol = "SOL", amount = 1) {
    try {
      console.log(`📈 Borrowing ${amount} ${tokenSymbol}...`);

      // Check borrowing capacity first
      const capacity = await this.getBorrowingCapacity(tokenSymbol);
      if (amount > capacity.available) {
        throw new Error(
          `Insufficient borrowing capacity. Available: ${capacity.available}`
        );
      }

      const borrowResult = await this.sdk.marginfi.borrow({
        token: tokenSymbol,
        amount: amount,
        userAccount: this.userWallet?.publicKey,
      });

      console.log("✅ Borrow successful!");
      console.log("- Transaction:", borrowResult.transaction);
      console.log("- Borrowed Amount:", borrowResult.borrowedAmount);
      console.log("- Interest Rate:", borrowResult.interestRate + "%");
      console.log("- New Health Factor:", borrowResult.newHealthFactor);

      return borrowResult;
    } catch (error) {
      console.error("❌ Borrow failed:", error.message);
      throw error;
    }
  }

  /**
   * Repay borrowed tokens
   */
  async repayTokens(tokenSymbol = "SOL", amount = 0.5) {
    try {
      console.log(`💳 Repaying ${amount} ${tokenSymbol}...`);

      const repayResult = await this.sdk.marginfi.repay({
        token: tokenSymbol,
        amount: amount,
        userAccount: this.userWallet?.publicKey,
      });

      console.log("✅ Repay successful!");
      console.log("- Transaction:", repayResult.transaction);
      console.log("- Remaining Debt:", repayResult.remainingDebt);
      console.log("- Interest Paid:", repayResult.interestPaid);
      console.log("- New Health Factor:", repayResult.newHealthFactor);

      return repayResult;
    } catch (error) {
      console.error("❌ Repay failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // POSITION MONITORING
  // ============================================

  /**
   * Get current positions and health metrics
   */
  async getPositions() {
    try {
      console.log("📊 Fetching Current Positions...");

      const positions = await this.sdk.marginfi.getPositions();

      console.log("Current Positions:");
      positions.forEach((position, index) => {
        console.log(`Position ${index + 1}:`);
        console.log(`- Token: ${position.token}`);
        console.log(`- Type: ${position.type}`); // 'deposit' or 'borrow'
        console.log(`- Amount: ${position.amount}`);
        console.log(`- Value (USD): $${position.valueUsd}`);
        console.log(`- Interest Rate: ${position.interestRate}%`);
        console.log("---");
      });

      return positions;
    } catch (error) {
      console.error("❌ Failed to get positions:", error.message);
      throw error;
    }
  }

  /**
   * Get borrowing capacity for a specific token
   */
  async getBorrowingCapacity(tokenSymbol = "SOL") {
    try {
      console.log(`🔍 Checking borrowing capacity for ${tokenSymbol}...`);

      const capacity = await this.sdk.marginfi.getBorrowingCapacity({
        token: tokenSymbol,
        userAccount: this.userWallet?.publicKey,
      });

      console.log("Borrowing Capacity:");
      console.log(
        `- Available to Borrow: ${capacity.available} ${tokenSymbol}`
      );
      console.log(`- Maximum LTV: ${capacity.maxLtv}%`);
      console.log(`- Current Utilization: ${capacity.utilization}%`);

      return capacity;
    } catch (error) {
      console.error("❌ Failed to get borrowing capacity:", error.message);
      throw error;
    }
  }

  /**
   * Monitor account health and risk metrics
   */
  async monitorAccountHealth() {
    try {
      console.log("🏥 Monitoring Account Health...");

      const health = await this.sdk.marginfi.getAccountHealth();

      console.log("Account Health Metrics:");
      console.log(`- Health Factor: ${health.healthFactor}`);
      console.log(`- Liquidation Risk: ${health.liquidationRisk}`);
      console.log(`- Total Collateral: $${health.totalCollateral}`);
      console.log(`- Total Debt: $${health.totalDebt}`);
      console.log(`- Net Worth: $${health.netWorth}`);

      // Risk warnings
      if (health.healthFactor < 1.5) {
        console.warn(
          "⚠️ WARNING: Low health factor - consider repaying debt or adding collateral"
        );
      }

      if (health.liquidationRisk === "HIGH") {
        console.warn(
          "🚨 ALERT: High liquidation risk - immediate action required!"
        );
      }

      return health;
    } catch (error) {
      console.error("❌ Health monitoring failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // ADVANCED STRATEGIES
  // ============================================

  /**
   * Leverage farming strategy
   */
  async leverageFarming(baseAmount = 1000, leverage = 2) {
    try {
      console.log(`🚀 Starting Leverage Farming (${leverage}x)...`);

      // Step 1: Deposit initial collateral
      await this.depositTokens("USDC", baseAmount);

      // Step 2: Borrow additional funds
      const borrowAmount = baseAmount * (leverage - 1);
      await this.borrowTokens("USDC", borrowAmount);

      // Step 3: Deposit borrowed funds to compound yield
      await this.depositTokens("USDC", borrowAmount);

      console.log("✅ Leverage farming position established!");
      console.log(`- Total Position: $${baseAmount * leverage}`);
      console.log(`- Leverage Ratio: ${leverage}x`);

      // Monitor position
      await this.monitorAccountHealth();

      return {
        totalPosition: baseAmount * leverage,
        leverageRatio: leverage,
        initialDeposit: baseAmount,
        borrowedAmount: borrowAmount,
      };
    } catch (error) {
      console.error("❌ Leverage farming failed:", error.message);
      throw error;
    }
  }

  /**
   * Auto-rebalancing strategy
   */
  async autoRebalance() {
    try {
      console.log("⚖️ Starting Auto-Rebalance...");

      const health = await this.monitorAccountHealth();

      if (health.healthFactor < 2.0) {
        // Health factor too low - repay some debt
        const repayAmount = health.totalDebt * 0.1; // Repay 10%
        await this.repayTokens("SOL", repayAmount);
        console.log(`🔄 Repaid ${repayAmount} to improve health factor`);
      } else if (health.healthFactor > 3.0) {
        // Health factor high - can borrow more
        const borrowCapacity = await this.getBorrowingCapacity("SOL");
        const borrowAmount = borrowCapacity.available * 0.5; // Conservative 50%
        await this.borrowTokens("SOL", borrowAmount);
        console.log(
          `📈 Borrowed ${borrowAmount} to optimize capital efficiency`
        );
      }

      console.log("✅ Auto-rebalancing completed");
    } catch (error) {
      console.error("❌ Auto-rebalancing failed:", error.message);
      throw error;
    }
  }

  // ============================================
  // MARKET ANALYTICS
  // ============================================

  /**
   * Get MarginFi market overview
   */
  async getMarketOverview() {
    try {
      console.log("📈 Fetching MarginFi Market Overview...");

      const marketData = await this.sdk.marginfi.getMarketData();

      console.log("MarginFi Market Overview:");
      console.log(
        `- Total Value Locked: $${marketData.tvl?.toLocaleString() || "N/A"}`
      );
      console.log(
        `- Total Borrowed: $${
          marketData.totalBorrowed?.toLocaleString() || "N/A"
        }`
      );
      console.log(
        `- Average Lending APY: ${marketData.avgLendingApy || "N/A"}%`
      );
      console.log(
        `- Average Borrowing APY: ${marketData.avgBorrowingApy || "N/A"}%`
      );

      console.log("\nTop Lending Pools:");
      marketData.topPools?.forEach((pool) => {
        console.log(
          `- ${pool.token}: ${pool.apy}% APY (${pool.utilization}% utilized)`
        );
      });

      return marketData;
    } catch (error) {
      console.error("❌ Failed to get market overview:", error.message);
      return null;
    }
  }

  // ============================================
  // DEMO RUNNER
  // ============================================

  /**
   * Run comprehensive MarginFi demo
   */
  async runDemo() {
    try {
      console.log("🎬 Starting MarginFi Protocol Demo...\n");

      // 1. Market Overview
      await this.getMarketOverview();
      console.log("\n" + "=".repeat(50) + "\n");

      // 2. Account Setup
      await this.initializeAccount();
      console.log("\n" + "=".repeat(50) + "\n");

      // 3. Basic Lending
      console.log("📍 PHASE 1: Basic Lending Operations");
      await this.depositTokens("USDC", 1000);
      await this.getUserAccountInfo();
      console.log("\n" + "=".repeat(50) + "\n");

      // 4. Borrowing
      console.log("📍 PHASE 2: Borrowing Operations");
      await this.borrowTokens("SOL", 2);
      await this.monitorAccountHealth();
      console.log("\n" + "=".repeat(50) + "\n");

      // 5. Position Management
      console.log("📍 PHASE 3: Position Management");
      await this.getPositions();
      await this.autoRebalance();
      console.log("\n" + "=".repeat(50) + "\n");

      // 6. Advanced Strategy
      console.log("📍 PHASE 4: Advanced Strategy (Demo)");
      // Note: In production, be very careful with leverage
      console.log("⚠️ Leverage farming demo (not executed for safety)");
      console.log(
        "Consider risks: liquidation, impermanent loss, interest rate changes"
      );

      console.log("\n✅ MarginFi demo completed successfully!");
      console.log("\n💡 Next Steps:");
      console.log("- Monitor positions regularly");
      console.log("- Set up alerts for health factor changes");
      console.log("- Consider yield optimization strategies");
      console.log("- Understand liquidation mechanics");
    } catch (error) {
      console.error("❌ Demo failed:", error.message);
    }
  }
}

// Usage example
async function main() {
  const marginfiExample = new MarginFiExample();

  try {
    // Connect wallet first (in browser environment)
    // marginfiExample.userWallet = await connectWallet();

    // Run the comprehensive demo
    await marginfiExample.runDemo();
  } catch (error) {
    console.error("Example failed:", error);
  }
}

// Export for use in other scripts
module.exports = { MarginFiExample, main };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
