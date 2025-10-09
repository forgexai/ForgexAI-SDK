const { ForgeXSolanaSDK } = require("forgexai-sdk");
const web3 = require("@solana/web3.js");

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
  const payerKeypair = web3.Keypair.generate();

  const sdk = new ForgeXSolanaSDK({
    connection,
    wallet: payerKeypair,
    sanctumApiKey: "YOUR_SANCTUM_API_KEY",
  });

  console.log("Connecting to Sanctum...");

  try {
    console.log("Fetching all LSD yields...");
    const lsdYields = await sdk.sanctum.getAllLsdYields();
    console.log(`Found ${lsdYields.length} liquid staking options`);

    const topLsds = lsdYields.sort((a, b) => b.apy - a.apy).slice(0, 3);

    console.log("Top 3 highest yielding LSDs:");
    topLsds.forEach((lsd, index) => {
      console.log(
        `${index + 1}. ${lsd.name}: ${(lsd.apy * 100).toFixed(2)}% APY`
      );
    });

    console.log("\nComparing JitoSOL and mSOL...");
    const comparison = await sdk.sanctum.compareLsds("JitoSOL", "mSOL");
    console.log(`JitoSOL APY: ${(comparison.lsd1.apy * 100).toFixed(2)}%`);
    console.log(`mSOL APY: ${(comparison.lsd2.apy * 100).toFixed(2)}%`);
    console.log(`Difference: ${(comparison.apyDifference * 100).toFixed(2)}%`);

    console.log("\nGetting swap quote from mSOL to JitoSOL...");
    const quoteAmount = 1 * 10 ** 9;
    const swapQuote = await sdk.sanctum.getSwapQuote(
      "mSOL",
      "JitoSOL",
      quoteAmount
    );

    console.log(`Quote details:`);
    console.log(`- Input: ${swapQuote.inAmount / 10 ** 9} mSOL`);
    console.log(`- Output: ${swapQuote.outAmount / 10 ** 9} JitoSOL`);
    console.log(`- Price impact: ${(swapQuote.priceImpact * 100).toFixed(2)}%`);
    console.log(`- Fee: ${swapQuote.fee / 10 ** 9} SOL`);

    /*
    // 4. Execute the swap (commented out to prevent actual transaction)
    console.log("\nExecuting swap...");
    const txSignature = await sdk.sanctum.executeLsdSwap(swapQuote);
    console.log(`Transaction submitted: ${txSignature}`);
    */
  } catch (error) {
    console.error("Error interacting with Sanctum:", error);
  }
}

main();
