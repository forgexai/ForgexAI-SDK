const {
  getConnection,
  JupiterClient,
  PythClient,
  PYTH_FEEDS,
} = require("forgexai-sdk");

const connection = getConnection("mainnet-beta");
console.log("Connected to Solana cluster:", connection.rpcEndpoint);

async function getJupiterSwapQuote() {
  try {
    const jupiterClient = new JupiterClient(connection);
    const quote = await jupiterClient.getSwapQuote({
      inputMint: "SOL",
      outputMint: "USDC",
      amount: 1.0,
      slippage: 0.5,
    });
    console.log("Jupiter Swap Quote:", quote);
    return quote;
  } catch (error) {
    console.error("Error getting Jupiter swap quote:", error);
  }
}

async function getPythPriceFeed() {
  try {
    const pythClient = new PythClient(connection);
    const solPrice = await pythClient.getPrice(PYTH_FEEDS.SOL);
    console.log("SOL Price from Pyth:", solPrice);
    return solPrice;
  } catch (error) {
    console.error("Error getting Pyth price feed:", error);
  }
}

async function runExamples() {
  console.log("Running ForgeX SDK examples...");
  await getJupiterSwapQuote();
  await getPythPriceFeed();
  console.log("Examples completed");
}

runExamples();
