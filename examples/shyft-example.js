const { ForgeXSolanaSDK } = require('../');

async function shyftExample() {
  try {
    // Initialize SDK with Shyft API key
    const sdk = new ForgeXSolanaSDK({
      apiKeys: {
        shyft: 'YOUR_SHYFT_API_KEY'
      }
    });

    console.log('🔍 ForgeX Shyft Integration Example\n');

    const walletAddress = '11111111111111111111111111111112'; // Example wallet
    
    // Get wallet balance
    console.log('Getting wallet balance...');
    const balance = await sdk.shyft.getWalletBalance(walletAddress);
    console.log('Wallet Balance:', balance);

    // Get wallet token balances
    console.log('\nGetting wallet token balances...');
    const tokenBalances = await sdk.shyft.getWalletTokenBalances(walletAddress);
    console.log('Token balances count:', tokenBalances.length);
    
    if (tokenBalances.length > 0) {
      console.log('First 3 token balances:', tokenBalances.slice(0, 3));
    }

    // Get wallet NFTs
    console.log('\nGetting wallet NFTs...');
    try {
      const nfts = await sdk.shyft.getWalletNFTs(walletAddress);
      console.log('NFT count:', nfts.length);
      
      if (nfts.length > 0) {
        console.log('First NFT:', {
          name: nfts[0].name,
          symbol: nfts[0].symbol,
          mint: nfts[0].mint,
          collection: nfts[0].collection
        });
      }
    } catch (error) {
      console.log('NFTs not available:', error.message);
    }

    // Get wallet transactions
    console.log('\nGetting wallet transactions...');
    try {
      const transactions = await sdk.shyft.getWalletTransactions(walletAddress);
      console.log('Transaction count:', transactions.length);
      
      if (transactions.length > 0) {
        console.log('Latest transaction:', {
          signature: transactions[0].signature,
          timestamp: transactions[0].timestamp,
          type: transactions[0].type,
          status: transactions[0].status
        });
      }
    } catch (error) {
      console.log('Transactions not available:', error.message);
    }

    // Get token info
    const solMint = 'So11111111111111111111111111111111111111112';
    console.log('\nGetting SOL token info...');
    try {
      const tokenInfo = await sdk.shyft.getTokenInfo(solMint);
      console.log('SOL Token Info:', {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        supply: tokenInfo.supply
      });
    } catch (error) {
      console.log('Token info not available:', error.message);
    }

    // Get NFT info
    console.log('\nTrying to get NFT info...');
    try {
      const nftMint = 'YOUR_NFT_MINT_ADDRESS'; // Replace with actual NFT mint
      const nftInfo = await sdk.shyft.getNFTInfo(nftMint);
      console.log('NFT Info:', nftInfo);
    } catch (error) {
      console.log('NFT info not available (expected with placeholder address):', error.message);
    }

    console.log('\n✅ Shyft example completed successfully!');

  } catch (error) {
    console.error('❌ Error in Shyft example:', error.message);
  }
}

// Run the example
if (require.main === module) {
  shyftExample();
}

module.exports = shyftExample;