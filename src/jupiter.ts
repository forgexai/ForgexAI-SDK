import axios, { AxiosInstance } from "axios";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * Configuration for Jupiter Service
 */
export interface JupiterServiceConfig {
  apiKey?: string;
  usePaidTier?: boolean;
  connection?: Connection;
}

/**
 * Ultra Swap - Get Order Parameters
 */
export interface UltraOrderParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker?: string;
  referralAccount?: string;
  referralFee?: number;
  excludeRouters?: ("metis" | "jupiterz" | "dflow" | "okx")[];
  excludeDexes?: string;
  payer?: string;
}

/**
 * Ultra Swap - Order Response
 */
export interface UltraOrderResponse {
  mode: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  inUsdValue?: number;
  outUsdValue?: number;
  priceImpact?: number;
  swapUsdValue?: number;
  priceImpactPct: string;
  routePlan: RoutePlanStep[];
  feeMint?: string;
  feeBps: number;
  signatureFeeLamports: number;
  prioritizationFeeLamports: number;
  rentFeeLamports: number;
  swapType?: string;
  router: "aggregator" | "jupiterz" | "dflow" | "okx";
  transaction: string | null;
  gasless: boolean;
  requestId: string;
  totalTime: number;
  taker: string | null;
  quoteId?: string;
  maker?: string;
  expireAt?: string;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  errorCode?: 1 | 2 | 3;
  errorMessage?: string;
}

/**
 * Ultra Swap - Execute Parameters
 */
export interface UltraExecuteParams {
  signedTransaction: string;
  requestId: string;
}

/**
 * Ultra Swap - Execute Response
 */
export interface UltraExecuteResponse {
  status: "Success" | "Failed";
  signature?: string;
  slot?: string;
  error?: string;
  code: number;
  totalInputAmount?: string;
  totalOutputAmount?: string;
  inputAmountResult?: string;
  outputAmountResult?: string;
  swapEvents?: SwapEvent[];
}

/**
 * Swap Event
 */
export interface SwapEvent {
  inputMint: string;
  inputAmount: string;
  outputMint: string;
  outputAmount: string;
}

/**
 * Route Plan Step
 */
export interface RoutePlanStep {
  swapInfo: SwapInfo;
  percent: number;
  bps: number;
}

/**
 * Swap Info
 */
export interface SwapInfo {
  ammKey: string;
  label?: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
}

/**
 * Holdings Response
 */
export interface HoldingsResponse {
  amount: string;
  uiAmount: number;
  uiAmountString: string;
  tokens: {
    [mint: string]: TokenAccount[];
  };
}

/**
 * Token Account
 */
export interface TokenAccount {
  account: string;
  amount: string;
  uiAmount: number;
  uiAmountString: string;
  isFrozen: boolean;
  isAssociatedTokenAccount: boolean;
  decimals: number;
  programId: string;
}

/**
 * Mint Information
 */
export interface MintInformation {
  id: string;
  name: string;
  symbol: string;
  icon: string | null;
  decimals: number;
  twitter?: string | null;
  telegram?: string | null;
  website?: string | null;
  dev?: string | null;
  circSupply?: number | null;
  totalSupply?: number | null;
  tokenProgram: string;
  launchpad?: string | null;
  partnerConfig?: string | null;
  graduatedPool?: string | null;
  graduatedAt?: string | null;
  holderCount?: number | null;
  fdv?: number | null;
  mcap?: number | null;
  usdPrice?: number | null;
  priceBlockId?: number | null;
  liquidity?: number | null;
  stats5m?: SwapStats | null;
  stats1h?: SwapStats | null;
  stats6h?: SwapStats | null;
  stats24h?: SwapStats | null;
  firstPool?: {
    id: string;
    createdAt: string;
  } | null;
  audit?: {
    isSus?: boolean | null;
    mintAuthorityDisabled?: boolean | null;
    freezeAuthorityDisabled?: boolean | null;
    topHoldersPercentage?: number | null;
    devBalancePercentage?: number | null;
    devMigrations?: number | null;
  } | null;
  organicScore: number;
  organicScoreLabel: "high" | "medium" | "low";
  isVerified?: boolean | null;
  cexes?: string[] | null;
  tags?: string[] | null;
  updatedAt: string;
}

/**
 * Swap Stats
 */
export interface SwapStats {
  priceChange?: number | null;
  holderChange?: number | null;
  liquidityChange?: number | null;
  volumeChange?: number | null;
  buyVolume?: number | null;
  sellVolume?: number | null;
  buyOrganicVolume?: number | null;
  sellOrganicVolume?: number | null;
  numBuys?: number | null;
  numSells?: number | null;
  numTraders?: number | null;
  numOrganicBuyers?: number | null;
  numNetBuyers?: number | null;
}

/**
 * Quote Parameters
 */
export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
  swapMode?: "ExactIn" | "ExactOut";
  dexes?: string[];
  excludeDexes?: string[];
  restrictIntermediateTokens?: boolean;
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
  platformFeeBps?: number;
  maxAccounts?: number;
  instructionVersion?: "V1" | "V2";
}

/**
 * Quote Response
 */
export interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: "ExactIn" | "ExactOut";
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: RoutePlanStep[];
  contextSlot?: number;
  timeTaken?: number;
}

/**
 * Swap Request
 */
export interface SwapRequest {
  userPublicKey: string;
  payer?: string;
  wrapAndUnwrapSol?: boolean;
  useSharedAccounts?: boolean;
  feeAccount?: string;
  trackingAccount?: string;
  prioritizationFeeLamports?: PriorityFee | JitoTip;
  asLegacyTransaction?: boolean;
  destinationTokenAccount?: string;
  dynamicComputeUnitLimit?: boolean;
  skipUserAccountsRpcCalls?: boolean;
  dynamicSlippage?: boolean;
  computeUnitPriceMicroLamports?: number;
  blockhashSlotsToExpiry?: number;
  quoteResponse: QuoteResponse;
}

/**
 * Priority Fee
 */
export type PriorityFee = {
  priorityLevelWithMaxLamports: {
    priorityLevel: "medium" | "high" | "veryHigh";
    maxLamports: number;
    global?: boolean;
  };
};

/**
 * Jito Tip
 */
export type JitoTip =
  | { jitoTipLamports: number }
  | { jitoTipLamportsWithPayer: { lamports: number; payer: string } };

/**
 * Swap Instructions Response
 */
export interface SwapInstructionsResponse {
  otherInstructions: Instruction[];
  computeBudgetInstructions: Instruction[];
  setupInstructions: Instruction[];
  swapInstruction: Instruction;
  cleanupInstruction?: Instruction;
  addressLookupTableAddresses: string[];
}

/**
 * Instruction
 */
export interface Instruction {
  programId: string;
  accounts: AccountMeta[];
  data: string;
}

/**
 * Account Meta
 */
export interface AccountMeta {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

/**
 * Price Response
 */
export interface PriceResponse {
  [mint: string]: {
    blockId: number | null;
    decimals: number;
    usdPrice: number;
    priceChange24h: number | null;
  };
}

/**
 * Send Invite Request
 */
export interface SendInviteRequest {
  inviteSigner: string;
  sender: string;
  amount: string;
  mint?: string;
}

/**
 * Send Invite Response
 */
export interface SendInviteResponse {
  tx: string;
  expiry: string;
  totalFeeLamports: string;
}

/**
 * Lend Earn Request
 */
export interface LendEarnRequest {
  asset: string;
  signer: string;
  amount?: string;
  shares?: string;
}

/**
 * Token Info
 */
export interface TokenInfo {
  id: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  assetAddress: string;
  totalAssets: string;
  totalSupply: string;
  convertToShares: string;
  convertToAssets: string;
  rewardsRate: string;
  supplyRate: string;
  totalRate: string;
}

/**
 * Jupiter Service - Comprehensive API Integration
 *
 * Includes:
 * - Ultra Swap API (high-performance swap with multiple routers)
 * - Swap API (standard quote and swap)
 * - Token Search & Discovery
 * - Price API
 * - Send API (payment links)
 * - Lend/Earn API
 */
export class JupiterService {
  private axiosInstance: AxiosInstance;
  private connection?: Connection;
  private usePaidTier: boolean;

  constructor(config: JupiterServiceConfig = {}) {
    this.connection = config.connection;
    this.usePaidTier = config.usePaidTier || false;

    const baseURL = this.usePaidTier
      ? "https://api.jup.ag"
      : "https://lite-api.jup.ag";

    this.axiosInstance = axios.create({
      baseURL,
      headers: config.apiKey
        ? {
            "X-API-KEY": config.apiKey,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          },
    });
  }

  // ==================== Ultra Swap API ====================

  /**
   * Get quote and unsigned transaction for Ultra Swap
   */
  async getUltraOrder(params: UltraOrderParams): Promise<UltraOrderResponse> {
    const response = await this.axiosInstance.get<UltraOrderResponse>(
      "/ultra/v1/order",
      { params }
    );
    return response.data;
  }

  /**
   * Execute a signed Ultra Swap transaction
   */
  async executeUltraSwap(
    params: UltraExecuteParams
  ): Promise<UltraExecuteResponse> {
    const response = await this.axiosInstance.post<UltraExecuteResponse>(
      "/ultra/v1/execute",
      params
    );
    return response.data;
  }

  /**
   * Get user holdings (SOL + tokens)
   */
  async getHoldings(address: string): Promise<HoldingsResponse> {
    const response = await this.axiosInstance.get<HoldingsResponse>(
      `/ultra/v1/holdings/${address}`
    );
    return response.data;
  }

  /**
   * Search for tokens by symbol, name, or mint address
   */
  async searchTokens(query: string): Promise<MintInformation[]> {
    const response = await this.axiosInstance.get<MintInformation[]>(
      "/ultra/v1/search",
      { params: { query } }
    );
    return response.data;
  }

  /**
   * Get available routers for Ultra Swap
   */
  async getUltraRouters(): Promise<
    Array<{ id: string; name: string; icon?: string }>
  > {
    const response = await this.axiosInstance.get("/ultra/v1/order/routers");
    return response.data;
  }

  // ==================== Standard Swap API ====================

  /**
   * Get quote for a swap
   */
  async getQuote(params: QuoteParams): Promise<QuoteResponse> {
    const response = await this.axiosInstance.get<QuoteResponse>(
      "/swap/v1/quote",
      {
        params: {
          ...params,
          dexes: params.dexes?.join(","),
          excludeDexes: params.excludeDexes?.join(","),
        },
      }
    );
    return response.data;
  }

  /**
   * Get swap instructions from quote
   */
  async getSwapInstructions(
    swapRequest: SwapRequest
  ): Promise<SwapInstructionsResponse> {
    const response = await this.axiosInstance.post<SwapInstructionsResponse>(
      "/swap/v1/swap-instructions",
      swapRequest
    );
    return response.data;
  }

  // ==================== Token Discovery API ====================

  /**
   * Search for tokens (V2)
   */
  async searchTokensV2(query: string): Promise<MintInformation[]> {
    const response = await this.axiosInstance.get<MintInformation[]>(
      "/tokens/v2/search",
      { params: { query } }
    );
    return response.data;
  }

  /**
   * Get recently created tokens
   */
  async getRecentTokens(): Promise<MintInformation[]> {
    const response = await this.axiosInstance.get<MintInformation[]>(
      "/tokens/v2/recent"
    );
    return response.data;
  }

  // ==================== Price API ====================

  /**
   * Get prices for multiple tokens
   */
  async getPrices(mints: string[]): Promise<PriceResponse> {
    const response = await this.axiosInstance.get<PriceResponse>("/price/v3", {
      params: { ids: mints.join(",") },
    });
    return response.data;
  }

  /**
   * Get price for a single token
   */
  async getPrice(mint: string): Promise<{
    blockId: number | null;
    decimals: number;
    usdPrice: number;
    priceChange24h: number | null;
  } | null> {
    const prices = await this.getPrices([mint]);
    return prices[mint] || null;
  }

  // ==================== Send API (Payment Links) ====================

  /**
   * Create a Send invite transaction
   */
  async craftSendInvite(
    params: SendInviteRequest
  ): Promise<SendInviteResponse> {
    const response = await this.axiosInstance.post<SendInviteResponse>(
      "/send/v1/craft-send",
      params
    );
    return response.data;
  }

  /**
   * Create a clawback transaction to reclaim funds
   */
  async craftClawback(
    invitePDA: string,
    sender: string
  ): Promise<{ tx: string }> {
    const response = await this.axiosInstance.post<{ tx: string }>(
      "/send/v1/craft-clawback",
      { invitePDA, sender }
    );
    return response.data;
  }

  /**
   * Get pending invites for an address
   */
  async getPendingInvites(address: string, page: number = 1) {
    const response = await this.axiosInstance.get("/send/v1/pending-invites", {
      params: { address, page },
    });
    return response.data;
  }

  // ==================== Lend/Earn API ====================

  /**
   * Get available lending tokens
   */
  async getEarnTokens(): Promise<TokenInfo[]> {
    const response = await this.axiosInstance.get<TokenInfo[]>(
      "/lend/v1/earn/tokens"
    );
    return response.data;
  }

  /**
   * Create deposit transaction
   */
  async craftEarnDeposit(
    params: LendEarnRequest
  ): Promise<{ transaction: string }> {
    const response = await this.axiosInstance.post<{ transaction: string }>(
      "/lend/v1/earn/deposit",
      params
    );
    return response.data;
  }

  /**
   * Create withdraw transaction
   */
  async craftEarnWithdraw(
    params: LendEarnRequest
  ): Promise<{ transaction: string }> {
    const response = await this.axiosInstance.post<{ transaction: string }>(
      "/lend/v1/earn/withdraw",
      params
    );
    return response.data;
  }

  /**
   * Create mint shares transaction
   */
  async craftEarnMint(
    params: LendEarnRequest
  ): Promise<{ transaction: string }> {
    const response = await this.axiosInstance.post<{ transaction: string }>(
      "/lend/v1/earn/mint",
      params
    );
    return response.data;
  }

  /**
   * Create redeem shares transaction
   */
  async craftEarnRedeem(
    params: LendEarnRequest
  ): Promise<{ transaction: string }> {
    const response = await this.axiosInstance.post<{ transaction: string }>(
      "/lend/v1/earn/redeem",
      params
    );
    return response.data;
  }

  /**
   * Get user positions in lending pools
   */
  async getEarnPositions(users: string[]) {
    const response = await this.axiosInstance.get("/lend/v1/earn/positions", {
      params: { users: users.join(",") },
    });
    return response.data;
  }

  /**
   * Get earnings for user positions
   */
  async getEarnEarnings(user: string, positions: string[]) {
    const response = await this.axiosInstance.get("/lend/v1/earn/earnings", {
      params: { user, positions: positions.join(",") },
    });
    return response.data;
  }

  // ==================== Helper Methods ====================

  /**
   * Deserialize base64 transaction
   */
  deserializeTransaction(base64Tx: string): Transaction | VersionedTransaction {
    const buffer = Buffer.from(base64Tx, "base64");

    try {
      return VersionedTransaction.deserialize(buffer);
    } catch {
      return Transaction.from(buffer);
    }
  }

  /**
   * Execute complete swap flow (quote + swap + send)
   */
  async executeSwap(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    userPublicKey: string;
    slippageBps?: number;
  }): Promise<string> {
    if (!this.connection) {
      throw new Error("Connection required for executing swaps");
    }

    // Get quote
    const quote = await this.getQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps || 50,
    });

    // Get swap instructions
    const swapInstructions = await this.getSwapInstructions({
      userPublicKey: params.userPublicKey,
      quoteResponse: quote,
      dynamicComputeUnitLimit: true,
    });

    // Build transaction (user needs to sign and send)
    return JSON.stringify(swapInstructions);
  }

  /**
   * Get best route across multiple DEXes
   */
  async getBestRoute(
    inputMint: string,
    outputMint: string,
    amount: number
  ): Promise<{
    quote: QuoteResponse;
    priceImpact: number;
    estimatedOutput: number;
  }> {
    const quote = await this.getQuote({
      inputMint,
      outputMint,
      amount,
      slippageBps: 50,
    });

    return {
      quote,
      priceImpact: parseFloat(quote.priceImpactPct),
      estimatedOutput: parseInt(quote.outAmount),
    };
  }

  /**
   * Get token statistics
   */
  async getTokenStats(mint: string): Promise<MintInformation | null> {
    const results = await this.searchTokens(mint);
    return results.find((token) => token.id === mint) || null;
  }

  /**
   * Compare prices across multiple routers (Ultra Swap)
   */
  async compareRouterPrices(params: {
    inputMint: string;
    outputMint: string;
    amount: string;
    taker: string;
  }): Promise<
    Array<{
      router: string;
      outAmount: string;
      priceImpact: number;
      gasless: boolean;
    }>
  > {
    const routers = ["metis", "jupiterz", "dflow", "okx"] as const;
    const results = [];

    for (const excludeRouter of routers) {
      try {
        const excludeList = routers.filter((r) => r !== excludeRouter);
        const order = await this.getUltraOrder({
          ...params,
          excludeRouters: excludeList,
        });

        results.push({
          router: order.router,
          outAmount: order.outAmount,
          priceImpact: order.priceImpact || 0,
          gasless: order.gasless,
        });
      } catch (error) {
        console.error(`Error fetching from ${excludeRouter}:`, error);
      }
    }

    return results;
  }
}

export default JupiterService;
