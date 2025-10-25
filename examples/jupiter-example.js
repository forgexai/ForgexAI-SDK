/**
 * Jupiter Integration Example
 *
 * This example demonstrates comprehensive Jupiter protocol integration
 * including swap quotes, token discovery, price feeds, and transaction building.
 */

const { ForgeXSolanaSDK } = require("../dist/index.js");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");

async function jupiterSwapExample() {
  console.log("🪐 Jupiter Integration Example");

  try {
    // Initialize SDK with mainnet
    const sdk = ForgeXSolanaSDK.mainnet({
      helius: process.env.HELIUS_API_KEY,
    });

    console.log("✅ SDK initialized for Jupiter");

    // Test 1: Get swap quote
    console.log("\n💱 Getting Swap Quote...");
    const quote = await sdk.jupiter.getQuote({
      inputMint: "So11111111111111111111111111111111111111112", // SOL
      outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      amount: 1000000000, // 1 SOL in lamports
      slippageBps: 50, // 0.5% slippage
    });

    console.log("📊 Swap Quote Details:");
    console.log(`   Input: ${(quote.inAmount / 1e9).toFixed(4)} SOL`);
    console.log(`   Output: ${(quote.outAmount / 1e6).toFixed(2)} USDC`);
    console.log(`   Price Impact: ${quote.priceImpactPct}%`);
    console.log(`   Slippage: ${quote.slippageBps / 100}%`);

    // Test 2: Search tokens
    console.log("\n🔍 Searching Tokens...");
    const tokens = await sdk.jupiter.searchTokens("USDC");
    console.log(`✅ Found ${tokens.length} tokens matching 'USDC':`);
    tokens.slice(0, 3).forEach((token) => {
      console.log(
        `   ${token.symbol}: ${token.name} (${token.id.slice(0, 8)}...)`
      );
    });

    // Test 3: Get recent tokens
    console.log("\n🆕 Getting Recent Tokens...");
    const recentTokens = await sdk.jupiter.getRecentTokens();
    console.log(`✅ Found ${recentTokens.length} recent tokens:`);
    recentTokens.slice(0, 5).forEach((token) => {
      console.log(
        `   ${token.symbol}: $${token.usdPrice?.toFixed(4) || "N/A"}`
      );
    });

    // Test 4: Get token prices
    console.log("\n💰 Getting Token Prices...");
    const prices = await sdk.jupiter.getPrices([
      "So11111111111111111111111111111111111111112", // SOL
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
    ]);

    console.log("💵 Price Data:");
    Object.entries(prices).forEach(([mint, data]) => {
      const symbol =
        mint === "So11111111111111111111111111111111111111112"
          ? "SOL"
          : mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
          ? "USDC"
          : "USDT";
      console.log(
        `   ${symbol}: $${data.usdPrice.toFixed(4)} (24h: ${
          data.priceChange24h?.toFixed(2) || "N/A"
        }%)`
      );
    });
  } catch (error) {
    console.error("❌ Jupiter example failed:", error);
  }
}

// Advanced Jupiter example with transaction building
async function jupiterTransactionExample() {
  console.log("\n🔧 Jupiter Transaction Building Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    // Example user wallet (you would use actual wallet here)
    const userWallet = Keypair.generate();

    console.log(
      `👤 User Wallet: ${userWallet.publicKey.toString().slice(0, 8)}...`
    );

    // Get quote first
    const quote = await sdk.jupiter.getQuote({
      inputMint: "So11111111111111111111111111111111111111112", // SOL
      outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      amount: 100000000, // 0.1 SOL
      slippageBps: 100, // 1% slippage
    });

    console.log("✅ Quote obtained for transaction building");

    // Build swap instructions
    const swapInstructions = await sdk.jupiter.getSwapInstructions({
      userPublicKey: userWallet.publicKey.toString(),
      quoteResponse: quote,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
    });

    console.log("🔨 Transaction Instructions:");
    console.log(
      `   Setup Instructions: ${swapInstructions.setupInstructions.length}`
    );
    console.log(
      `   Swap Instruction: ${swapInstructions.swapInstruction ? "✅" : "❌"}`
    );
    console.log(
      `   Cleanup Instructions: ${
        swapInstructions.cleanupInstruction ? "✅" : "❌"
      }`
    );
    console.log(
      `   Compute Budget Instructions: ${swapInstructions.computeBudgetInstructions.length}`
    );

    console.log("⚠️  Note: This is a demo - no actual transaction is sent");
  } catch (error) {
    console.error("❌ Transaction building failed:", error);
  }
}

// Ultra Swap API example (Jupiter's high-performance routing)
async function jupiterUltraSwapExample() {
  console.log("\n⚡ Jupiter Ultra Swap Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    // Ultra swap order
    const ultraOrder = await sdk.jupiter.getUltraOrder({
      inputMint: "So11111111111111111111111111111111111111112",
      outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      amount: "1000000000", // 1 SOL
      slippageBps: 50,
      sender: "11111111111111111111111111111111111111112", // Example address
      isExactIn: true,
    });

    console.log("⚡ Ultra Swap Order:");
    console.log(`   Status: ${ultraOrder.status}`);
    console.log(`   Input Amount: ${ultraOrder.inputAmount}`);
    console.log(`   Output Amount: ${ultraOrder.outputAmount}`);
    console.log(`   Total Time: ${ultraOrder.totalTime}ms`);
  } catch (error) {
    console.error("❌ Ultra swap example failed:", error);
  }
}

// Holdings analysis example
async function jupiterHoldingsExample() {
  console.log("\n💎 Jupiter Holdings Analysis Example");

  try {
    const sdk = ForgeXSolanaSDK.mainnet();

    // Example wallet address
    const walletAddress = "11111111111111111111111111111111111111112";

    const holdings = await sdk.jupiter.getHoldings(walletAddress);

    console.log("💰 Wallet Holdings:");
    console.log(`   SOL Amount: ${holdings.uiAmount} SOL`);
    console.log(
      `   Token Accounts: ${
        Object.keys(holdings.tokens).length
      } different tokens`
    );

    // Show details for first few token holdings
    Object.entries(holdings.tokens)
      .slice(0, 3)
      .forEach(([mint, accounts]) => {
        const totalAmount = accounts.reduce(
          (sum, acc) => sum + acc.uiAmount,
          0
        );
        console.log(
          `   ${mint.slice(0, 8)}...: ${totalAmount} tokens (${
            accounts.length
          } accounts)`
        );
      });
  } catch (error) {
    console.error("❌ Holdings analysis failed:", error);
  }
}

// Run all Jupiter examples
async function main() {
  console.log("🌟 Jupiter Protocol Examples\n");

  await jupiterSwapExample();
  await jupiterTransactionExample();
  await jupiterUltraSwapExample();
  await jupiterHoldingsExample();

  console.log("\n✨ Jupiter examples completed!");
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  jupiterSwapExample,
  jupiterTransactionExample,
  jupiterUltraSwapExample,
  jupiterHoldingsExample,
};
