const { ForgeXSolanaSDK } = require("forgexai-sdk");
const web3 = require("@solana/web3.js");

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
  const payerKeypair = web3.Keypair.generate();

  const sdk = new ForgeXSolanaSDK({
    connection,
    wallet: payerKeypair,
    meteoraApiKey: "YOUR_METEORA_API_KEY",
  });

  console.log("Connecting to Meteora...");

  try {
    console.log("Fetching all vaults...");
    const vaults = await sdk.meteora.getAllVaults();
    console.log(`Found ${vaults.length} liquidity vaults`);

    const usdcVaults = vaults.filter(
      (vault) =>
        vault.tokenA.symbol === "USDC" || vault.tokenB.symbol === "USDC"
    );

    console.log(`\nFound ${usdcVaults.length} vaults containing USDC:`);
    usdcVaults.slice(0, 3).forEach((vault, index) => {
      console.log(
        `${index + 1}. ${vault.name}: ${vault.tokenA.symbol}/${
          vault.tokenB.symbol
        }`
      );
    });

    if (usdcVaults.length > 0) {
      const selectedVault = usdcVaults[0];
      console.log(`\nGetting performance details for ${selectedVault.name}...`);
      const performance = await sdk.meteora.getVaultPerformance(
        selectedVault.address
      );

      console.log("Vault performance:");
      console.log(`- APR: ${(performance.apr * 100).toFixed(2)}%`);
      console.log(`- APY: ${(performance.apy * 100).toFixed(2)}%`);
      console.log(`- Total Value Locked: $${performance.tvl.toLocaleString()}`);
      console.log(`- Volume (24h): $${performance.volume24h.toLocaleString()}`);

      const depositAmount = 1000 * 10 ** 6;
      console.log(`\nCalculating potential returns for 1,000 USDC deposit...`);

      const depositResult = await sdk.meteora.calculateDepositResult(
        selectedVault.address,
        depositAmount,
        true
      );

      console.log(
        `- LP tokens received: ${
          depositResult.lpTokens / 10 ** selectedVault.decimals
        }`
      );
      console.log(`- Deposit value: $${depositResult.depositValue}`);
      console.log(
        `- Expected monthly yield: $${(
          (depositResult.depositValue * performance.apr) /
          12
        ).toFixed(2)}`
      );

      /*
      // 5. Create deposit transaction (commented out to prevent actual transaction)
      console.log("\nCreating deposit transaction...");
      const txData = await sdk.meteora.createDepositTransaction(
        selectedVault.address,
        depositAmount,
        true, // Using USDC side
        0.5 // 0.5% slippage
      );
      
      // Send transaction
      console.log("Sending transaction...");
      const txSignature = await sdk.meteora.sendTransaction(txData.transaction);
      console.log(`Transaction submitted: ${txSignature}`);
      */
    }
  } catch (error) {
    console.error("Error interacting with Meteora:", error);
  }
}

main();
