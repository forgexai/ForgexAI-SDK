const { ForgeXSolanaSDK } = require('../');

async function birdeyeExample() {
  try {
    // Initialize SDK with Birdeye API key
    const sdk = new ForgeXSolanaSDK({
      apiKeys: {
        birdeye: 'YOUR_BIRDEYE_API_KEY'
      }
    });

    console.log('🐦 ForgeX Birdeye Integration Example\n');

    // Get token price
    const solAddress = 'So11111111111111111111111111111111111111112'; // SOL
    console.log('Getting SOL token price...');
    const tokenPrice = await sdk.birdeye.getTokenPrice(solAddress);
    console.log('SOL Price:', tokenPrice);

    // Get token list
    console.log('\nGetting token list...');
    const tokenList = await sdk.birdeye.getTokenList();
    console.log('Token count:', tokenList.length);
    console.log('First 5 tokens:', tokenList.slice(0, 5));

    // Get DEX price (if available)
    console.log('\nGetting DEX price for SOL...');
    try {
      const dexPrice = await sdk.birdeye.getDexPrice(solAddress);
      console.log('DEX Price:', dexPrice);
    } catch (error) {
      console.log('DEX price not available:', error.message);
    }

    // Get OHLCV data (if available)
    console.log('\nGetting OHLCV data for SOL...');
    try {
      const ohlcvData = await sdk.birdeye.getOHLCV(solAddress, '1h');
      console.log('OHLCV data points:', ohlcvData.length);
      if (ohlcvData.length > 0) {
        console.log('Latest OHLCV:', ohlcvData[ohlcvData.length - 1]);
      }
    } catch (error) {
      console.log('OHLCV data not available:', error.message);
    }

    // Get token overview
    console.log('\nGetting token overview for SOL...');
    try {
      const overview = await sdk.birdeye.getTokenOverview(solAddress);
      console.log('Token Overview:', overview);
    } catch (error) {
      console.log('Token overview not available:', error.message);
    }

    console.log('\n✅ Birdeye example completed successfully!');

  } catch (error) {
    console.error('❌ Error in Birdeye example:', error.message);
  }
}

// Run the example
if (require.main === module) {
  birdeyeExample();
}

module.exports = birdeyeExample;