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

- **Comprehensive Protocol Support**: Interact with major Solana ecosystem protocols including Jupiter, Kamino, Marinade, Raydium, Drift, Tensor, Pyth, and Squads
- **Wallet Integration**: Simple interfaces for working with Solana wallets
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Well-Documented**: Clear examples and documentation for all supported features

## Usage Examples

### Initialize a Connection

```typescript
import { Connection } from '@solana/web3.js';
import { getConnection } from 'forgexai-sdk';

// Get a connection with automatic retry and reconnection handling
const connection = getConnection('mainnet-beta');
```

### Jupiter Swap

```typescript
import { jupiterSwap } from 'forgexai-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

const performSwap = async () => {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const walletPublicKey = new PublicKey('your-wallet-address');
  
  const result = await jupiterSwap({
    connection,
    wallet: walletPublicKey,
    fromToken: 'SOL',
    toToken: 'USDC',
    amount: 1.0,
    slippage: 0.5
  });
  
  console.log('Swap successful:', result);
};
```

### Kamino Finance Integration

```typescript
import { getKaminoPositions } from 'forgexai-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

const getPositions = async () => {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const walletPublicKey = new PublicKey('your-wallet-address');
  
  const positions = await getKaminoPositions({
    connection,
    wallet: walletPublicKey
  });
  
  console.log('Kamino positions:', positions);
};
```

### Staking with Marinade

```typescript
import { marinadeDeposit } from 'forgexai-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

const stakeSOL = async () => {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const walletPublicKey = new PublicKey('your-wallet-address');
  
  const result = await marinadeDeposit({
    connection,
    wallet: walletPublicKey,
    amount: 5 // SOL
  });
  
  console.log('Staking successful:', result);
};
```

## Supported Protocols

- **Jupiter**: Token swaps and liquidity provision
- **Kamino**: Automated yield strategies
- **Marinade**: Liquid staking
- **Raydium**: AMM and yield farming
- **Drift**: Perpetual futures trading
- **Tensor**: NFT trading
- **Pyth**: Price oracle data
- **Squads**: Multisig and DAO tools

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test
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
