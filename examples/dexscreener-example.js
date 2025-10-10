const { ForgeXSolanaSDK } = require('../');

async function dexscreenerExample() {
  try {
    // Initialize SDK (DexScreener doesn't require API key)
    const sdk = new ForgeXSolanaSDK({});

    console.log('📊 ForgeX DexScreener Integration Example\n');

    const solAddress = 'So11111111111111111111111111111111111111112'; // SOL
    const usdcAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC

    // Get token pairs for SOL
    console.log('Getting SOL token pairs...');
    const solPairs = await sdk.dexscreener.getTokenPairs('solana', solAddress);
    console.log(`Found ${solPairs.length} SOL pairs`);
    
    if (solPairs.length > 0) {
      console.log('Top SOL pair:', {
        dexId: solPairs[0].dexId,
        url: solPairs[0].url,
        baseToken: solPairs[0].baseToken.symbol,
        quoteToken: solPairs[0].quoteToken.symbol,
        priceUsd: solPairs[0].priceUsd,
        volume24h: solPairs[0].volume?.h24,
        priceChange24h: solPairs[0].priceChange?.h24
      });
    }

    // Search for pairs
    console.log('\nSearching for USDC pairs...');
    const usdcPairs = await sdk.dexscreener.searchPairs('USDC');
    console.log(`Found ${usdcPairs.length} USDC pairs`);
    
    if (usdcPairs.length > 0) {
      console.log('Top USDC pair:', {
        dexId: usdcPairs[0].dexId,
        baseToken: usdcPairs[0].baseToken.symbol,
        quoteToken: usdcPairs[0].quoteToken.symbol,
        priceUsd: usdcPairs[0].priceUsd,
        liquidity: usdcPairs[0].liquidity?.usd
      });
    }

    // Get specific pair by address (example with a known SOL/USDC pair)
    console.log('\nTrying to get specific pair...');
    if (solPairs.length > 0) {
      const pairAddress = solPairs[0].pairAddress;
      const specificPair = await sdk.dexscreener.getPairByAddress('solana', pairAddress);
      
      if (specificPair) {
        console.log('Specific pair details:', {
          dexId: specificPair.dexId,
          url: specificPair.url,
          baseToken: specificPair.baseToken.symbol,
          quoteToken: specificPair.quoteToken.symbol,
          fdv: specificPair.fdv,
          marketCap: specificPair.marketCap
        });
      }
    }

    // Get latest token profiles
    console.log('\nGetting latest token profiles...');
    try {
      const profiles = await sdk.dexscreener.getLatestTokenProfiles();
      console.log('Token profiles retrieved:', profiles?.length || 'Unknown count');
    } catch (error) {
      console.log('Token profiles not available:', error.message);
    }

    console.log('\n✅ DexScreener example completed successfully!');

  } catch (error) {
    console.error('❌ Error in DexScreener example:', error.message);
  }
}

// Run the example
if (require.main === module) {
  dexscreenerExample();
}

module.exports = dexscreenerExample;