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

- **Comprehensive Protocol Support**: Interact with major Solana ecosystem protocols including Jupiter, Kamino, Marinade, Raydium, Drift, Tensor, Pyth, Squads, Mayan Finance, Sanctum, Meteora, MarginFi, Helius, Elusiv, and Solend
- **Cross-Chain Capabilities**: Execute cross-chain swaps between Solana and other blockchains (Ethereum, BNB Chain, Avalanche, etc.) using Mayan Finance
- **Privacy Features**: Private transactions and balance protection using Elusiv
- **Lending & Borrowing**: Access decentralized lending markets through Solend and MarginFi
- **Wallet Integration**: Simple interfaces for working with Solana wallets
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Well-Documented**: Clear examples and documentation for all supported features

## Usage Examples

### Initialize a Connection

```typescript
import { Connection } from "@solana/web3.js";
import { getConnection } from "forgexai-sdk";

// Get a connection with automatic retry and reconnection handling
const connection = getConnection("mainnet-beta");
```

### Jupiter Swap

```typescript
import { jupiterSwap } from "forgexai-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

const performSwap = async () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const walletPublicKey = new PublicKey("your-wallet-address");

  const result = await jupiterSwap({
    connection,
    wallet: walletPublicKey,
    fromToken: "SOL",
    toToken: "USDC",
    amount: 1.0,
    slippage: 0.5,
  });

  console.log("Swap successful:", result);
};
```

### Kamino Finance Integration

```typescript
import { getKaminoPositions } from "forgexai-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

const getPositions = async () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const walletPublicKey = new PublicKey("your-wallet-address");

  const positions = await getKaminoPositions({
    connection,
    wallet: walletPublicKey,
  });

  console.log("Kamino positions:", positions);
};
```

### Staking with Marinade

```typescript
import { marinadeDeposit } from "forgexai-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

const stakeSOL = async () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const walletPublicKey = new PublicKey("your-wallet-address");

  const result = await marinadeDeposit({
    connection,
    wallet: walletPublicKey,
    amount: 5, // SOL
  });

  console.log("Staking successful:", result);
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

To run an example:

```bash
# First build the SDK
npm run build

# Then run an example
node examples/basic-usage.js
```

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test
```

## Publishing

To publish the SDK to npm:

```bash
# Login to npm (only needed once)
npm login

# Build the package
npm run build

# Publish to npm
npm publish
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
