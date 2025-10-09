const { ForgeXSolanaSDK } = require("forgexai-sdk");

async function main() {
  const sdk = ForgeXSolanaSDK.mainnet();

  console.log("Fetching supported chains...");
  const supportedChains = await sdk.mayan.getSupportedChains();
  console.log("Supported chains:", supportedChains);

  console.log("Fetching Solana tokens...");
  const solanaTokens = await sdk.mayan.getSupportedTokens("solana");
  console.log(`Found ${solanaTokens.length} tokens on Solana`);

  const usdcToken = solanaTokens.find((token) => token.symbol === "USDC");

  if (!usdcToken) {
    console.error("USDC token not found on Solana");
    return;
  }

  console.log("Fetching Ethereum tokens...");
  const ethereumTokens = await sdk.mayan.getSupportedTokens("ethereum");
  console.log(`Found ${ethereumTokens.length} tokens on Ethereum`);

  const ethToken = ethereumTokens.find((token) => token.symbol === "ETH");

  if (!ethToken) {
    console.error("ETH token not found on Ethereum");
    return;
  }

  const solanaWalletAddress = "YOUR_SOLANA_WALLET_ADDRESS";
  const ethereumWalletAddress = "YOUR_ETHEREUM_WALLET_ADDRESS";

  console.log("Getting cross-chain swap quote...");
  const quotes = await sdk.mayan.fetchQuote({
    amountIn64: "10000000",
    fromToken: usdcToken.address,
    toToken: ethToken.address,
    fromChain: "solana",
    toChain: "ethereum",
    slippageBps: "auto",
    gasDrop: 0.01,
    referrer: solanaWalletAddress,
  });

  if (quotes.length === 0) {
    console.error("No quotes available for this swap");
    return;
  }

  const bestQuote = quotes[0];
  console.log("Best quote:", {
    fromAmount: bestQuote.amountIn64,
    toAmount: bestQuote.outAmount64,
    slippageBps: bestQuote.slippageBps,
    gasDrop: bestQuote.gasDrop,
    usdValue: bestQuote.usdValue,
  });

  console.log("\nTo execute this swap, you would run:");
  console.log(`
  const signTransaction = async (tx) => {
    return signedTx;
  };
  
  const swapResult = await sdk.mayan.swapFromSolana(
    bestQuote,
    "${solanaWalletAddress}",
    "${ethereumWalletAddress}",
    { evm: "${ethereumWalletAddress}", solana: "${solanaWalletAddress}" },
    signTransaction
  );
  
  console.log("Swap submitted:", swapResult.txHash);
  
  const status = await sdk.mayan.trackSwap(swapResult.txHash);
  console.log("Swap status:", status.clientStatus);
  `);
}

main().catch((err) => {
  console.error("Error:", err);
});
