const { ForgeXSolanaSDK } = require("forgexai-sdk");
const web3 = require("@solana/web3.js");

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));

  const sdk = new ForgeXSolanaSDK({
    connection,
    heliusApiKey: "YOUR_HELIUS_API_KEY",
  });

  console.log("Connecting to Helius...");

  try {
    const mintAddress = "EEr5yQpNXf7Bru6Rt5podx56HGW9CEehXKr98RuFD4NF";
    console.log(`Fetching NFT metadata for mint ${mintAddress}...`);

    const nftMetadata = await sdk.helius.getNftMetadata(mintAddress);
    console.log("\nNFT Metadata:");
    console.log(`- Name: ${nftMetadata.name}`);
    console.log(`- Collection: ${nftMetadata.collection?.name || "N/A"}`);
    console.log(`- Symbol: ${nftMetadata.symbol}`);
    console.log(`- URI: ${nftMetadata.uri}`);
    console.log(`- Royalty: ${nftMetadata.sellerFeeBasisPoints / 100}%`);

    const walletAddress = "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH";
    console.log(`\nFetching NFTs owned by wallet ${walletAddress}...`);

    const walletNfts = await sdk.helius.getWalletNfts(walletAddress);
    console.log(`Found ${walletNfts.length} NFTs in wallet`);

    if (walletNfts.length > 0) {
      console.log("\nSample of wallet NFTs:");
      walletNfts.slice(0, 3).forEach((nft, index) => {
        console.log(
          `${index + 1}. ${nft.name} (${
            nft.collection?.name || "No collection"
          })`
        );
      });
    }

    console.log(`\nFetching recent wallet activity for ${walletAddress}...`);
    const activity = await sdk.helius.getWalletActivity(walletAddress, {
      limit: 5,
      type: "ALL",
    });

    console.log(`Recent transactions (${activity.length}):`);
    activity.forEach((tx, index) => {
      console.log(
        `${index + 1}. ${tx.type} - ${new Date(
          tx.timestamp * 1000
        ).toLocaleString()}`
      );
      console.log(`   Signature: ${tx.signature}`);
      if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
        console.log(`   SOL transfers: ${tx.nativeTransfers.length}`);
        tx.nativeTransfers.forEach((transfer) => {
          console.log(
            `   - ${transfer.amount / web3.LAMPORTS_PER_SOL} SOL from ${
              transfer.fromUserAccount
            } to ${transfer.toUserAccount}`
          );
        });
      }
    });

    // 4. Create a webhook to monitor a wallet (commented out to prevent actual webhook creation)
    /*
    console.log("\nCreating a wallet activity webhook...");
    const webhookConfig = {
      webhookURL: "https://your-webhook-endpoint.com/helius-events",
      accountAddresses: [walletAddress],
      transactionTypes: ["NFT_SALE", "NFT_MINT", "TOKEN_TRANSFER"],
      webhookType: "enhanced"
    };
    
    const webhook = await sdk.helius.createWebhook(webhookConfig);
    console.log(`Webhook created with ID: ${webhook.webhookID}`);
    */

    console.log("\nListing existing webhooks...");
    const webhooks = await sdk.helius.getWebhooks();

    if (webhooks.length === 0) {
      console.log("No active webhooks found");
    } else {
      console.log(`Found ${webhooks.length} active webhooks:`);
      webhooks.forEach((hook, index) => {
        console.log(`${index + 1}. Webhook ID: ${hook.webhookID}`);
        console.log(`   - URL: ${hook.webhookURL}`);
        console.log(`   - Addresses: ${hook.accountAddresses.length}`);
        console.log(`   - Types: ${hook.transactionTypes.join(", ")}`);
      });
    }
  } catch (error) {
    console.error("Error interacting with Helius:", error);
  }
}

main();
