const {
  getConnection,
  JupiterClient,
  KaminoClient,
  MarinadeClient,
  RaydiumClient,
} = require("forgexai-sdk");
const { PublicKey } = require("@solana/web3.js");

const WALLET_ADDRESS = "GZeAvc4zPheRAGxKBqxJdJT8XqQjKC2MiKq4KQYzjkfQ";

const connection = getConnection("mainnet-beta");

async function analyzeDeFiPortfolio(walletAddress) {
  console.log(`Analyzing DeFi portfolio for wallet: ${walletAddress}`);
  const wallet = new PublicKey(walletAddress);

  const kaminoClient = new KaminoClient(connection);
  const marinadeClient = new MarinadeClient(connection);
  const raydiumClient = new RaydiumClient(connection);

  const [kaminoPositions, marinadeStake, raydiumFarms] = await Promise.all([
    kaminoClient.getPositions(wallet).catch((e) => {
      console.error("Error fetching Kamino positions:", e);
      return [];
    }),
    marinadeClient.getStakeAccount(wallet).catch((e) => {
      console.error("Error fetching Marinade stake:", e);
      return null;
    }),
    raydiumClient.getFarmPositions(wallet).catch((e) => {
      console.error("Error fetching Raydium farms:", e);
      return [];
    }),
  ]);

  const portfolioSummary = {
    wallet: walletAddress,
    timestamp: new Date().toISOString(),
    kaminoPositions: kaminoPositions || [],
    marinadeStake: marinadeStake || { stakeAmount: 0, mSOLBalance: 0 },
    raydiumFarms: raydiumFarms || [],
    totalValue: 0,
  };

  console.log(
    "DeFi Portfolio Summary:",
    JSON.stringify(portfolioSummary, null, 2)
  );
  return portfolioSummary;
}

analyzeDeFiPortfolio(WALLET_ADDRESS)
  .then(() => console.log("Portfolio analysis complete"))
  .catch((err) => console.error("Error in portfolio analysis:", err));
