# ForgeX Solana SDK

A comprehensive TypeScript SDK for interacting with various Solana protocols and services. This SDK simplifies integration with popular Solana DeFi protocols, making it easier for developers to build applications on the Solana blockchain.

## Installation

```bash
npm install forgexai-sdk
# or
yarn add forgexai-sdk
# or
pnpm add forgexai-sdk
```

## Features

- **Comprehensive Protocol Support**: Interact with 21+ Solana ecosystem protocols including Jupiter, Kamino, Marinade, Raydium, Drift, Tensor, Pyth, Squads, Mayan Finance, Sanctum, Meteora, MarginFi, Helius, Elusiv, Solend, Birdeye, Clockwork, Crossmint, DexScreener, Dialect, and Shyft
- **Cross-Chain Capabilities**: Execute cross-chain swaps between Solana and other blockchains (Ethereum, BNB Chain, Avalanche, etc.) using Mayan Finance
- **Privacy Features**: Private transactions and balance protection using Elusiv zero-knowledge proofs
- **Lending & Borrowing**: Access decentralized lending markets through Solend and MarginFi with advanced yield strategies
- **Market Data & Analytics**: Real-time price data, DEX analytics, arbitrage detection, and comprehensive market insights
- **Wallet Infrastructure**: Simplified wallet creation, management, and Web3 onboarding through Crossmint
- **Notifications & Messaging**: Web3 communications, smart notifications, and community features via Dialect
- **Automation**: Schedule and automate transactions, create recurring payments using Clockwork
- **Blockchain Data**: Comprehensive on-chain data access, NFT analytics, and transaction monitoring through Shyft APIs
- **Wallet Integration**: Simple interfaces for working with all major Solana wallets
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Well-Documented**: Clear examples, comprehensive demos, and documentation for all supported features

## Quick Start

### Basic Setup

```typescript
import { ForgexSDK } from "forgexai-sdk";

// Initialize the SDK
const sdk = new ForgexSDK({
  // Configure API keys for specific protocols
  jupiter: { apiKey: "your-jupiter-key" },
  birdeye: { apiKey: "your-birdeye-key" },
  helius: { apiKey: "your-helius-key" },
  // ... other protocol configurations
});

// Connect a wallet
await sdk.connectWallet(yourWalletInstance);
```

### Example: Jupiter Token Swap

```typescript
const swapResult = await sdk.jupiter.swap({
  fromToken: "SOL",
  toToken: "USDC", 
  amount: 1.0,
  slippage: 0.5
});
console.log("Swap completed:", swapResult.signature);
```

### Example: Cross-Chain Bridge

```typescript
const bridgeResult = await sdk.mayan.crossChainSwap({
  fromChain: "solana",
  toChain: "ethereum", 
  fromToken: "USDC",
  toToken: "USDC",
  amount: 100,
  destinationAddress: "0x..."
});
```

## Comprehensive Examples

The SDK includes detailed examples for every supported protocol. Each example demonstrates real-world usage patterns, advanced features, and best practices:

### Core DeFi Protocols
- **[Jupiter](examples/jupiter-example.js)** - Advanced token swapping, route optimization, price impact analysis
- **[Raydium](examples/raydium-example.js)** - Liquidity provision, yield farming, concentrated liquidity strategies  
- **[Kamino](examples/kamino-example.js)** - Automated position management, leverage strategies, risk optimization
- **[MarginFi](examples/marginfi-example.js)** - Lending, borrowing, margin trading, risk management
- **[Drift](examples/drift-example.js)** - Perpetual trading, market making, advanced order types

### Market Data & Analytics
- **[Birdeye](examples/birdeye-example.js)** - Comprehensive market data, price analytics, portfolio tracking
- **[DexScreener](examples/dexscreener-example.js)** - DEX analytics, arbitrage detection, liquidity monitoring
- **[Pyth](examples/pyth-example.js)** - Real-time price feeds, confidence intervals, custom oracles

### Infrastructure & Tools  
- **[Helius](examples/helius-example.js)** - Enhanced RPC, webhooks, transaction parsing, compression
- **[Shyft](examples/shyft-example.js)** - Blockchain analytics, NFT tracking, transaction monitoring
- **[Clockwork](examples/clockwork-example.js)** - Transaction automation, recurring payments, cron jobs

### Privacy & Security
- **[Elusiv](examples/elusiv-example.js)** - Private transactions, zero-knowledge proofs, compliance tools
- **[Squads](examples/squads-example.js)** - Multi-signature wallets, team treasury management

### Cross-Chain & Bridges
- **[Mayan](examples/mayan-example.js)** - Cross-chain swaps, bridge monitoring, multi-chain strategies
- **[Sanctum](examples/sanctum-example.js)** - Liquid staking tokens, yield optimization

### Communication & Community
- **[Dialect](examples/dialect-example.js)** - Web3 messaging, smart notifications, community features

### Staking & Yield
- **[Marinade](examples/marinade-example.js)** - Liquid staking, validator selection, reward optimization
- **[Solend](examples/solend-example.js)** - Lending markets, borrowing strategies, yield farming

### Developer Tools
- **[Crossmint](examples/crossmint-example.js)** - Wallet creation, Web3 onboarding, developer infrastructure
- **[Meteora](examples/meteora-example.js)** - Dynamic AMM pools, yield strategies

### Trading & Orders
- **[Tensor](examples/tensor-example.js)** - NFT trading, collection analytics, market making

Each example includes:
- 🏗️ **Setup & Configuration** - API key setup, initialization patterns
- 🔧 **Core Operations** - Main protocol features and common use cases  
- 📊 **Analytics & Monitoring** - Performance tracking, market insights
- ⚡ **Advanced Strategies** - Power-user features, optimization techniques
- 🎯 **Real-World Scenarios** - Practical implementation examples

## Key Features by Category

### 🔄 **DeFi Trading & Swapping**
- **Jupiter**: Best-in-class token swapping with optimal routing
- **Raydium**: Concentrated liquidity and automated market making
- **Drift**: Perpetual futures and derivatives trading
- **Tensor**: NFT trading and portfolio management

### 🏦 **Lending & Borrowing**  
- **Solend**: Decentralized lending with multiple asset pools
- **MarginFi**: Advanced margin trading and risk management
- **Kamino**: Automated yield strategies and position optimization

### 📊 **Market Data & Analytics**
- **Birdeye**: Comprehensive DeFi analytics and portfolio tracking
- **DexScreener**: Real-time DEX data and arbitrage opportunities  
- **Pyth**: High-frequency price feeds and oracle data
- **Shyft**: On-chain analytics and transaction monitoring

### 🔒 **Privacy & Security**
- **Elusiv**: Zero-knowledge private transactions
- **Squads**: Multi-signature wallet infrastructure
- **Enhanced Security**: Built-in transaction verification and safety checks

### 🌉 **Cross-Chain Infrastructure**
- **Mayan Finance**: Seamless cross-chain swaps and bridges
- **Multi-Chain Support**: Connect Solana with 10+ other blockchains
- **Bridge Monitoring**: Real-time bridge status and fee optimization

### 💰 **Staking & Yield Optimization**
- **Marinade**: Liquid staking with automated validator selection
- **Sanctum**: Advanced liquid staking token strategies
- **Meteora**: Dynamic AMM and yield farming optimization

### 🛠️ **Developer Infrastructure**
- **Helius**: Enhanced RPC with webhooks and transaction parsing
- **Crossmint**: Simplified Web3 onboarding and wallet creation
- **Clockwork**: Transaction automation and scheduling

### 💬 **Communication & Community**
- **Dialect**: Web3 messaging, notifications, and community tools
- **Smart Notifications**: Protocol-aware alert systems
- **Community Features**: DAO communication and governance tools
};
```

### Lending with Solend

```typescript
import { ForgeXSolanaSDK } from "forgexai-sdk";
import { PublicKey } from "@solana/web3.js";

const lendWithSolend = async () => {
  // Initialize the SDK with mainnet connection
  const sdk = ForgeXSolanaSDK.mainnet();

  // Initialize Solend pools
  await sdk.solend.initialize();

  const walletPublicKey = new PublicKey("your-wallet-address");

  // Get all available reserves
  const reserves = sdk.solend.getReserves();
  console.log("Available lending markets:", reserves);

  // Build a deposit transaction (deposit 100 USDC)
  const depositAction = await sdk.solend.buildDepositTransaction(
    100, // amount
    "USDC", // token symbol
    walletPublicKey
  );

  // Execute the transaction (you need to implement sendTransaction)
  const signature = await sdk.solend.executeAction(
    depositAction,
    async (transaction) => {
      // Your transaction signing logic here
      return "transaction-signature";
    }
  );

  console.log("Deposit successful:", signature);
};
```

### Privacy with Elusiv

```typescript
import { ForgeXSolanaSDK } from "forgexai-sdk";
import { PublicKey } from "@solana/web3.js";

const privateTransfer = async () => {
  const sdk = ForgeXSolanaSDK.mainnet();

  const result = await sdk.elusiv.createPrivateTransfer({
    amount: 1000000, // 1 USDC in lamports
    tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    recipient: new PublicKey("recipient-address"),
    memo: "Private payment",
  });

  console.log("Private transfer successful:", result);
};
```

### Cross-Chain Swap with Mayan Finance

```typescript
import { ForgeXSolanaSDK } from "forgexai-sdk";
import { Keypair, Transaction } from "@solana/web3.js";

const crossChainSwap = async () => {
  // Initialize the SDK with mainnet connection
  const sdk = ForgeXSolanaSDK.mainnet();

  // Get USDC token on Solana
  const solanaTokens = await sdk.mayan.getSupportedTokens("solana");
  const usdcToken = solanaTokens.find((token) => token.symbol === "USDC");

  // Get ETH token on Ethereum
  const ethereumTokens = await sdk.mayan.getSupportedTokens("ethereum");
  const ethToken = ethereumTokens.find((token) => token.symbol === "ETH");

  // Wallet addresses
  const solanaWalletAddress = "YOUR_SOLANA_WALLET_ADDRESS";
  const ethereumWalletAddress = "YOUR_ETHEREUM_WALLET_ADDRESS";

  // Get a quote for the swap (10 USDC -> ETH)
  const quotes = await sdk.mayan.fetchQuote({
    amountIn64: "10000000", // 10 USDC (6 decimals)
    fromToken: usdcToken.address,
    toToken: ethToken.address,
    fromChain: "solana",
    toChain: "ethereum",
    slippageBps: "auto",
    gasDrop: 0.01, // 0.01 ETH for gas on Ethereum
  });

  // Function to sign the transaction with your wallet
  const signTransaction = async (tx: Transaction) => {
    // Replace with your actual signing logic
    return wallet.signTransaction(tx);
  };

  // Execute the swap
  const swapResult = await sdk.mayan.swapFromSolana(
    quotes[0],
    solanaWalletAddress,
    ethereumWalletAddress,
    { evm: ethereumWalletAddress, solana: solanaWalletAddress },
    signTransaction
  );

  console.log("Cross-chain swap initiated:", swapResult.txHash);

  // Track the swap status
  const status = await sdk.mayan.trackSwap(swapResult.txHash);
  console.log("Swap status:", status.clientStatus);
};
```

## Supported Protocols

- **Jupiter**: Token swaps and liquidity provision
- **Kamino**: Automated yield strategies
- **Mayan Finance**: Cross-chain swaps between Solana and EVM chains
- **Marinade**: Liquid staking
- **Raydium**: AMM and yield farming
- **Drift**: Perpetual futures trading
- **Tensor**: NFT trading
- **Pyth**: Price oracle data
- **Squads**: Multisig and DAO tools
- **Sanctum**: Liquid staking derivatives
- **Meteora**: Liquidity infrastructure
- **MarginFi**: Decentralized lending and borrowing
- **Helius**: Enhanced RPC and webhooks
- **Elusiv**: Privacy-preserving transactions
- **Solend**: Decentralized lending protocol
- **Birdeye**: Token price data and market analytics
- **Clockwork**: Automated transaction scheduling
- **Crossmint**: Simplified wallet and NFT infrastructure
- **DexScreener**: DEX analytics and token pair data
- **Dialect**: Web3 notifications and messaging
- **Shyft**: Blockchain data APIs and wallet analytics

## Examples

You can find example scripts in the `examples` directory:

- `basic-usage.js` - Simple examples of how to use the SDK
- `portfolio-analysis.js` - More advanced example showing DeFi portfolio analysis
- `solend-example.js` - Lending and borrowing with Solend
- `elusiv-example.js` - Privacy-preserving transactions
- `marginfi-example.js` - MarginFi lending integration
- `helius-example.js` - Enhanced RPC and webhook usage
- `mayan-cross-chain-swap.js` - Cross-chain swaps
- `meteora-example.js` - Meteora vault interactions
- `sanctum-example.js` - Liquid staking with Sanctum
- `birdeye-example.js` - Token price data and market analytics
- `clockwork-example.js` - Automated transaction scheduling
- `crossmint-example.js` - Simplified wallet infrastructure
- `dexscreener-example.js` - DEX analytics and token pair data
- `dialect-example.js` - Web3 notifications and messaging
- `shyft-example.js` - Blockchain data APIs and wallet analytics

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test
```

## Getting Started

### Environment Setup

```bash
# Clone the repository  
git clone https://github.com/your-org/forgexai-sdk
cd forgexai-sdk

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env file
```

### Running Examples

Each protocol example can be run independently:

```bash
# Run specific protocol examples
node examples/jupiter-example.js
node examples/birdeye-example.js  
node examples/elusiv-example.js

# Set environment variables for API keys
export JUPITER_API_KEY="your-key"
export BIRDEYE_API_KEY="your-key"
node examples/jupiter-example.js
```

## Advanced Usage

### Error Handling

```typescript
try {
  const result = await sdk.jupiter.swap({
    fromToken: "SOL",
    toToken: "USDC", 
    amount: 1.0
  });
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    console.log('Not enough balance for swap');
  } else if (error.code === 'SLIPPAGE_EXCEEDED') {
    console.log('Price moved too much during swap');
  }
}
```

### Custom Configuration

```typescript
const sdk = new ForgexSDK({
  // Custom RPC endpoint
  rpcEndpoint: "https://your-custom-rpc.com",
  
  // Protocol-specific settings  
  jupiter: {
    apiKey: "your-key",
    slippageBps: 50, // 0.5%
    priorityFee: 0.001 // SOL
  },
  
  // Global settings
  timeout: 30000,
  retries: 3
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support & Community

- 📚 [Documentation](https://docs.forgex.ai)
- 💬 [Discord Community](https://discord.gg/forgex)  
- 🐛 [Issue Tracker](https://github.com/your-org/forgexai-sdk/issues)
- 📧 [Email Support](mailto:support@forgex.ai)
- 🐦 [Twitter](https://twitter.com/forgex_ai)

---

**Built with ❤️ for the Solana ecosystem**

ForgeX SDK - Empowering developers to build the future of DeFi
