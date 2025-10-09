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
