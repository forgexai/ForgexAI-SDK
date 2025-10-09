import { Transaction } from "@solana/web3.js";

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: any;
  routePlan: any[];
}

export interface SwapResult {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

export interface LoanHealth {
  healthFactor: number;
  totalDeposit: number;
  totalBorrow: number;
  maxBorrow: number;
  walletAddress: string;
  deposits: Array<{
    mint: string;
    amount: number;
    value: number;
  }>;
  borrows: Array<{
    mint: string;
    amount: number;
    value: number;
  }>;
}

export interface NFTFloorPrice {
  collectionId: string;
  floorPrice: number;
  currency: string;
  volume24h: number;
  listedCount: number;
  sales24h: number;
}

export interface StakingInfo {
  token: string;
  apy: number;
  tvl: number;
  exchangeRate: number;
  totalStaked: number;
}

export interface PerpPosition {
  market: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  leverage: number;
  marginRatio: number;
  liquidationPrice: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  confidence: number;
  timestamp: number;
  expo: number;
}

export interface TransactionResult {
  transaction: string;
  lastValidBlockHeight?: number;
  priorityFee?: number;
  message?: string;
}

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

export interface WalletInfo {
  address: string;
  balance: number;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  mint: string;
  symbol?: string;
  amount: number;
  uiAmount: number;
  decimals: number;
  value?: number;
}

export interface SDKError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export class ForgeXSDKError extends Error {
  public code: string;
  public details?: any;
  public timestamp: number;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = "ForgeXSDKError";
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
  }
}

export * from "./jupiter";

export * from "./kamino";

export * from "./tensor";

export * from "./marinade";

export * from "./drift";

export * from "./pyth";

export * from "./squads";

export interface PhantomProvider {
  isPhantom: boolean;
  publicKey: any;
  isConnected: boolean;
  connect(): Promise<{ publicKey: any }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

export type SolanaNetwork = "mainnet-beta" | "devnet" | "testnet";

export interface ConnectionConfig {
  network: SolanaNetwork;
  endpoint?: string;
  commitment?: "processed" | "confirmed" | "finalized";
}

export interface SDKConfig {
  connection: ConnectionConfig;
  apiKeys?: {
    tensor?: string;
    squads?: string;
    sanctum?: string;
    meteora?: string;
    marginfi?: string;
    helius?: string;
    [key: string]: string | undefined;
  };
  timeout?: number;
  retries?: number;
}

export interface DeFiPortfolio {
  wallet: string;
  totalValue: number;
  positions: {
    lending: Array<{
      protocol: "kamino" | "solend";
      healthFactor: number;
      totalDeposited: number;
      totalBorrowed: number;
    }>;
    staking: Array<{
      protocol: "marinade" | "jito";
      token: string;
      amount: number;
      apy: number;
      value: number;
    }>;
    perpetuals: Array<{
      protocol: "drift";
      market: string;
      size: number;
      pnl: number;
      leverage: number;
    }>;
  };
  nfts: Array<{
    mint: string;
    collection: string;
    floorPrice: number;
    estimatedValue: number;
  }>;
  timestamp: number;
}

export interface MarketOverview {
  prices: {
    sol: number;
    btc: number;
    eth: number;
  };
  defi: {
    totalTvl: number;
    topLendingRates: Array<{
      protocol: string;
      asset: string;
      apy: number;
    }>;
    topStakingRates: Array<{
      protocol: string;
      token: string;
      apy: number;
    }>;
  };
  nfts: {
    topCollections: Array<{
      slug: string;
      floorPrice: number;
      volume24h: number;
    }>;
  };
  timestamp: number;
}

export interface MayanQuote {
  id: string;
  outAmount64: string;
  amountIn64: string;
  fromToken: string;
  toToken: string;
  fromChain: string;
  toChain: string;
  slippageBps: number;
  gasless?: boolean;
  gasDrop?: number;
  referrer?: string;
  referrerBps?: number;
  tax?: number;
  usdValue?: number;
  priceImpact?: string;
  bridgeFee?: string;
}

export interface MayanSwapResult {
  txHash: string;
  status: string;
}

export interface MayanTrackingResult {
  txHash: string;
  clientStatus: "INPROGRESS" | "COMPLETED" | "REFUNDED";
  fromChain: string;
  toChain: string;
  fromAmount: string;
  toAmount: string;
  fromToken: string;
  toToken: string;
  senderAddress: string;
  recipientAddress: string;
  refundTxHash?: string;
  destTxHash?: string;
  errorReason?: string;
  timestamp: number;
}

export interface MayanTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  chain: string;
  logoURI?: string;
  coingeckoId?: string;
}

// Sanctum types
export interface SanctumLsdInfo {
  token: string;
  mint: string;
  apy: number;
  tvl: number;
  protocol: string;
  stakingStrategy: string;
}

export interface SanctumSwapQuote {
  fromMint: string;
  toMint: string;
  inAmount: string;
  outAmount: string;
  price: number;
  priceImpact: number;
  fee: string;
  routeType: string;
  slippageBps: number;
}

export interface SanctumSwapResult {
  transaction: string;
  blockhash: string;
  expectedOutAmount: string;
}

// Meteora types
export interface MeteoraVault {
  address: string;
  name: string;
  tokenA: {
    mint: string;
    symbol: string;
    decimals: number;
  };
  tokenB: {
    mint: string;
    symbol: string;
    decimals: number;
  };
  tvl: number;
  apr: number;
  strategyType: string;
}

export interface MeteoraVaultInfo extends MeteoraVault {
  apy: number;
  volume24h: number;
  fees24h: number;
  feesTier: string;
  drawdown: number;
  sharePriceHistory: Array<{
    timestamp: number;
    sharePrice: number;
  }>;
  lpTokenMint: string;
}

export interface MeteoraDepositResult {
  transaction: string;
  expectedLpAmount?: string;
  expectedAmountA?: string;
  expectedAmountB?: string;
  blockhash: string;
}

// MarginFi types
export interface MarginfiPosition {
  account: string;
  owner: string;
  healthFactor: number;
  netValue: number;
  totalBorrowedValue: number;
  totalSuppliedValue: number;
  assets: Array<{
    tokenSymbol: string;
    tokenMint: string;
    tokenPrice: number;
    depositBalance: string;
    depositValue: number;
    borrowBalance: string;
    borrowValue: number;
    netBalance: string;
    netValue: number;
  }>;
}

export interface MarginfiMarketInfo {
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  supplyApy: number;
  borrowApy: number;
  totalSupply: number;
  totalBorrow: number;
  availableLiquidity: number;
  price: number;
  borrowCap: number;
  supplyCap: number;
  ltv: number;
}

export interface MarginfiAction {
  transaction: string;
  blockhash: string;
  expectedBalance?: string;
}

// Helius types
export interface HeliusNftMetadata {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  collection?: {
    name: string;
    family: string;
  };
  properties: any;
  creators: Array<{
    address: string;
    share: number;
  }>;
  owner: string;
  tokenStandard: string;
  royalty: number;
}

export interface HeliusWalletActivity {
  signature: string;
  timestamp: number;
  type: string;
  fee: number;
  feePayer: string;
  nativeTransfers: Array<{
    amount: number;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
  tokenTransfers: Array<{
    tokenAmount: number;
    mint: string;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
  accountData: Array<{
    account: string;
    programId: string;
    data: any;
  }>;
  source: string;
}

export interface HeliusWebhookConfig {
  webhookID: string;
  webhookURL: string;
  walletAddresses: string[];
  eventTypes: string[];
  webhookName: string;
}
