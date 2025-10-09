const { ForgeXSolanaSDK } = require("forgexai-sdk");
const web3 = require("@solana/web3.js");

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
  const payerKeypair = web3.Keypair.generate();

  const sdk = new ForgeXSolanaSDK({
    connection,
    wallet: payerKeypair,
    marginfiApiKey: "YOUR_MARGINFI_API_KEY",
  });

  console.log("Connecting to MarginFi...");

  try {
    console.log("Fetching all lending markets...");
    const markets = await sdk.marginfi.getMarkets();
    console.log(`Found ${markets.length} lending markets`);

    const topMarkets = [...markets]
      .sort((a, b) => b.depositApy - a.depositApy)
      .slice(0, 5);

    console.log("\nTop 5 lending markets by deposit APY:");
    topMarkets.forEach((market, index) => {
      console.log(
        `${index + 1}. ${market.tokenSymbol}: ${(
          market.depositApy * 100
        ).toFixed(2)}% Deposit APY, ${(market.borrowApy * 100).toFixed(
          2
        )}% Borrow APY`
      );
    });

    const usdcMarket = markets.find((market) => market.tokenSymbol === "USDC");
    if (usdcMarket) {
      console.log("\nUSDC market risk metrics:");
      console.log(
        `- Utilization rate: ${(usdcMarket.utilization * 100).toFixed(2)}%`
      );
      console.log(
        `- Liquidation threshold: ${(
          usdcMarket.liquidationThreshold * 100
        ).toFixed(2)}%`
      );
      console.log(`- LTV ratio: ${(usdcMarket.ltv * 100).toFixed(2)}%`);
      console.log(
        `- Total supplied: ${(
          usdcMarket.totalDeposits /
          10 ** usdcMarket.decimals
        ).toLocaleString()} USDC`
      );
      console.log(
        `- Total borrowed: ${(
          usdcMarket.totalBorrows /
          10 ** usdcMarket.decimals
        ).toLocaleString()} USDC`
      );
    }

    const walletAddress = payerKeypair.publicKey.toString();
    console.log(`\nFetching positions for wallet ${walletAddress}...`);
    const positions = await sdk.marginfi.getUserPositions(walletAddress);

    if (positions.length === 0) {
      console.log("No active lending/borrowing positions found");
    } else {
      console.log(`Found ${positions.length} active positions:`);
      positions.forEach((position, index) => {
        console.log(`Position ${index + 1}:`);
        console.log(`- Token: ${position.tokenSymbol}`);
        console.log(
          `- Deposit amount: ${
            position.depositAmount / 10 ** position.decimals
          }`
        );
        console.log(
          `- Borrow amount: ${position.borrowAmount / 10 ** position.decimals}`
        );
        console.log(`- Health factor: ${position.healthFactor.toFixed(2)}`);
      });
    }

    /*
    // 4. Create deposit transaction for USDC (commented out to prevent actual transaction)
    if (usdcMarket) {
      console.log("\nCreating deposit transaction...");
      const depositAmount = 100 * 10**usdcMarket.decimals; // 100 USDC
      
      const depositTx = await sdk.marginfi.createDepositTransaction(
        usdcMarket.address,
        depositAmount
      );
      
      console.log("Sending deposit transaction...");
      const depositTxSignature = await sdk.marginfi.sendTransaction(depositTx);
      console.log(`Deposit transaction submitted: ${depositTxSignature}`);
      
      // 5. Create borrow transaction (typically after deposit as collateral)
      console.log("\nCreating borrow transaction...");
      const borrowAmount = 50 * 10**usdcMarket.decimals; // 50 USDC
      
      const borrowTx = await sdk.marginfi.createBorrowTransaction(
        usdcMarket.address,
        borrowAmount
      );
      
      console.log("Sending borrow transaction...");
      const borrowTxSignature = await sdk.marginfi.sendTransaction(borrowTx);
      console.log(`Borrow transaction submitted: ${borrowTxSignature}`);
    }
    */

    console.log("\nSimulating account health after potential actions...");
    const simulationResult = await sdk.marginfi.simulateAccountHealth(
      walletAddress,
      {
        deposits: [{ tokenSymbol: "USDC", amount: 1000 * 10 ** 6 }],
        borrows: [{ tokenSymbol: "USDT", amount: 500 * 10 ** 6 }],
      }
    );

    console.log("Simulation results:");
    console.log(
      `- Current health factor: ${simulationResult.currentHealthFactor.toFixed(
        2
      )}`
    );
    console.log(
      `- Simulated health factor: ${simulationResult.simulatedHealthFactor.toFixed(
        2
      )}`
    );
    console.log(`- Safe to execute: ${simulationResult.isSafe ? "Yes" : "No"}`);
  } catch (error) {
    console.error("Error interacting with MarginFi:", error);
  }
}

main();
