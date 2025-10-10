const { ForgeXSolanaSDK } = require("../");

async function crossmintExample() {
  try {
    // Initialize SDK with Crossmint API key and environment
    const sdk = new ForgeXSolanaSDK({
      apiKeys: {
        crossmint: {
          apiKey: "YOUR_CROSSMINT_API_KEY",
          environment: "staging", // or 'production'
        },
      },
    });

    console.log("🌉 ForgeX Crossmint Wallet Integration Example\n");

    const userEmail = "user@example.com";

    // Create a Crossmint wallet
    console.log("Creating Crossmint wallet...");
    try {
      const wallet = await sdk.crossmint.createWallet(userEmail);
      console.log("Created wallet:", {
        address: wallet.address,
        email: wallet.email,
        type: wallet.type,
      });
    } catch (error) {
      console.log(
        "Wallet creation failed (expected with demo data):",
        error.message
      );
    }

    // Get wallet by email
    console.log("\nGetting wallet by email...");
    try {
      const wallet = await sdk.crossmint.getWallet(userEmail);
      console.log("Retrieved wallet:", {
        address: wallet.address,
        email: wallet.email,
        chain: wallet.chain,
      });
    } catch (error) {
      console.log(
        "Wallet retrieval failed (expected with demo data):",
        error.message
      );
    }

    // Get wallet balance
    console.log("\nGetting wallet balance...");
    try {
      const balance = await sdk.crossmint.getWalletBalance(userEmail);
      console.log("Wallet balance:", balance);
    } catch (error) {
      console.log(
        "Balance check failed (expected with demo data):",
        error.message
      );
    }

    // List wallet NFTs
    console.log("\nListing wallet NFTs...");
    try {
      const nfts = await sdk.crossmint.listWalletNFTs(userEmail);
      console.log("NFT count:", nfts.length);

      if (nfts.length > 0) {
        console.log("First NFT:", {
          id: nfts[0].id,
          chain: nfts[0].chain,
          contractAddress: nfts[0].contractAddress,
          tokenId: nfts[0].tokenId,
        });
      }
    } catch (error) {
      console.log(
        "NFT listing failed (expected with demo data):",
        error.message
      );
    }

    // Transfer SOL (example - requires real wallet and funds)
    console.log("\nExample SOL transfer (would require real wallet)...");
    try {
      const recipientEmail = "recipient@example.com";
      const amount = "0.01"; // 0.01 SOL

      console.log("Transfer parameters:", {
        from: userEmail,
        to: recipientEmail,
        amount: amount,
        currency: "sol",
      });

      // Uncomment to actually attempt transfer (requires real setup)
      // const transfer = await sdk.crossmint.transferSOL(userEmail, recipientEmail, amount);
      // console.log('Transfer result:', transfer);

      console.log("Transfer simulation completed (not executed)");
    } catch (error) {
      console.log("Transfer failed (expected with demo data):", error.message);
    }

    console.log("\n✅ Crossmint example completed successfully!");
    console.log("\n📝 Note: This example uses demo data. For real usage:");
    console.log(
      "   1. Get a real Crossmint API key from https://crossmint.com"
    );
    console.log("   2. Use real email addresses for wallet operations");
    console.log("   3. Ensure wallets have sufficient funds for transfers");
  } catch (error) {
    console.error("❌ Error in Crossmint example:", error.message);
  }
}

// Run the example
if (require.main === module) {
  crossmintExample();
}

module.exports = crossmintExample;
