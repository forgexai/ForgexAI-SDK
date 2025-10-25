import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { PublicKey, Transaction } from "@solana/web3.js";

// ==================== Types & Interfaces ====================

export interface LstMetadata {
  symbol: string;
  mint: string;
  tokenProgram: string;
  name: string;
  logoUri: string;
  decimals: number;
  pool: PoolConfig;
  holders: number | null;
  launchDate: string | null;
  mainValueProposition: string | null;
  oneLiner: string | null;
  bulletPoints: string[] | null;
  twitter: string | null;
  website: string | null;
  telegramGroupLink: string | null;
  categories: string[] | null;
  featureId: number | null;
  sanctumAutomated: boolean | null;
  managerFeeConfig: ManagerFeeConfig | null;
}

export interface LstWithStats extends LstMetadata {
  tvl: number | null;
  latestApy: number | null;
  avgApy: number | null;
  solValue: number | null;
  slug: string;
}

export interface ManagerFeeConfig {
  dst: string;
  withholdRate: number;
}

export type PoolConfig =
  | { program: "Lido" }
  | { program: "Marinade" }
  | { program: "ReservePool" }
  | {
      program: "SanctumSpl";
      pool: string;
      validatorList: string;
      voteAccount: string;
    }
  | {
      program: "SanctumSplMulti";
      pool: string;
      validatorList: string;
      voteAccount?: string;
    }
  | { program: "Spl"; pool: string; validatorList: string; voteAccount: string }
  | { program: "SPool"; programId: string };

export interface EpochApy {
  epoch: number;
  epochEndTs: number;
  apy: number;
}

export interface ValidatorApyRecord {
  avgApy: number;
  timeseries: EpochApy[];
}

export type SwapMode = "ExactIn" | "ExactOut";
export type SwapSrc = "Inf" | "SanctumRouter" | "Jup";

export interface TokenOrderParams {
  inp: string;
  out: string;
  mode?: SwapMode;
  signer?: string;
  inpAcc?: string;
  outAcc?: string;
  amt: string;
  slippageBps?: number;
  swapSrc?: SwapSrc[];
}

export interface DepositStakeOrderParams {
  out: string;
  mode?: SwapMode;
  signer?: string;
  inpAcc: string;
  outAcc?: string;
}

export interface WithdrawStakeOrderParams {
  inp: string;
  out?: string;
  mode?: SwapMode;
  signer?: string;
  inpAcc?: string;
  bridgeStakeSeed?: number;
  amt: string;
  deactivate?: "y" | "n";
}

export interface StakeAccountLamports {
  amtStaked: string;
  amtUnstaked: string;
}

export interface FeeInfo {
  code:
    | "StakePoolWithdrawStake"
    | "StakePoolDepositSol"
    | "StakePoolDepositStake"
    | "SanctumRouterGlobal"
    | "InfProtocolFee"
    | "InfLpFee"
    | "InstantUnstakeFlash"
    | "StakePoolWithdrawSol";
  rate: number;
  amount: string;
  mint: string;
}

export interface InfSrcData {
  fees: FeeInfo[];
}

export interface SanctumRouterSrcData {
  fees: FeeInfo[];
  lstToSolType?: "WithdrawWrappedSol" | "SwapViaStake";
}

export interface JupiterOrderResponse {
  mode: "manual" | "ultra";
  router: string;
  swapType: string;
  requestId: string;
  inputMint: string;
  inAmount: string;
  outputMint: string;
  feeMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: SwapMode;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpact: number;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
    bps: number;
  }>;
  feeBps: number;
  taker: string | null;
  gasless: boolean;
  transaction: string | null;
  prioritizationType: "ComputeBudget" | "None";
  prioritizationFeeLamports: number;
  inUsdValue: number;
  outUsdValue: number;
  swapUsdValue: number;
  dynamicSlippageReport?: any;
  errorMessage?: string;
  totalTime: number;
}

export type SwapSrcData =
  | { swapSrc: "Jup"; data: JupiterOrderResponse }
  | { swapSrc: "Inf"; data: InfSrcData }
  | { swapSrc: "SanctumRouter"; data: SanctumRouterSrcData };

export interface TokenOrderResponse {
  inp: string;
  out: string;
  mode?: SwapMode;
  tx?: string;
  swapSrcData: SwapSrcData;
  inpAmt: string;
  outAmt: string;
}

export interface DepositStakeOrderResponse {
  inp: string;
  out: string;
  mode?: SwapMode;
  tx?: string;
  swapSrcData: SwapSrcData;
  inpAmt: StakeAccountLamports;
  outAmt: string;
}

export interface WithdrawStakeOrderResponse {
  inp: string;
  out: string;
  mode?: SwapMode;
  tx?: string;
  swapSrcData: SwapSrcData;
  inpAmt: string;
  outAmt: StakeAccountLamports;
}

export interface ExecuteResponse {
  signature: string;
}

export interface SanctumError {
  error: {
    code: string;
    message: string;
  };
}

// ==================== Sanctum Service Class ====================

export class SanctumService {
  private client: AxiosInstance;
  private apiKey: string;
  private readonly baseURL: string = "https://sanctum-api.ironforge.network";

  // Program IDs
  public static readonly PROGRAMS = {
    S_CONTROLLER: "5ocnV1qiCgaQR8Jb8xWnVbApfaygJ8tNoZfgPwsgx9kx",
    FLAT_FEE_PRICING: "f1tUoNEKrDp1oeGn4zxr7bh41eN6VcfHjfrL3ZqQday",
    SPL_SOL_VALUE_CALCULATOR: "sp1V4h2gWorkGhVcazBc22Hfo2f5sd7jcjT4EDPrWFF",
    SANCTUM_SPL_1_SOL_VALUE_CALCULATOR:
      "sspUE1vrh7xRoXxGsg7vR1zde2WdGtJRbyK9uRumBDy",
    SANCTUM_SPL_2_SOL_VALUE_CALCULATOR:
      "ssmbu3KZxgonUtjEMCKspZzxvUQCxAFnyh1rcHUeEDo",
    MARINADE_SOL_VALUE_CALCULATOR:
      "mare3SCyfZkAndpBRBeonETmkCCB3TJTTrz8ZN2dnhP",
    LIDO_SOL_VALUE_CALCULATOR: "1idUSy4MGGKyKhvjSnGZ6Zc7Q4eKQcibym4BkEEw9KR",
    WSOL_SOL_VALUE_CALCULATOR: "wsoGmxQLSvwWpuaidCApxN5kEowLe2HLQLJhCQnj4bE",
  } as const;

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey;
    if (baseURL) {
      this.baseURL = baseURL;
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add API key
    this.client.interceptors.request.use(
      (config) => {
        config.params = {
          ...config.params,
          apiKey: this.apiKey,
        };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data) {
          const sanctumError = error.response.data as SanctumError;
          throw new Error(
            `Sanctum API Error [${sanctumError.error.code}]: ${sanctumError.error.message}`
          );
        }
        throw error;
      }
    );
  }

  // ==================== LST Endpoints ====================

  /**
   * Get all LST metadata with statistics
   * @returns Array of LSTs with stats
   */
  async getAllLsts(): Promise<LstWithStats[]> {
    const response = await this.client.get<{ data: LstWithStats[] }>("/lsts");
    return response.data.data;
  }

  /**
   * Get specific LST metadata by mint address or symbol
   * @param mintOrSymbol - Mint address or symbol of the LST
   * @returns Array of LST data (usually single item)
   */
  async getLst(mintOrSymbol: string): Promise<LstWithStats[]> {
    const response = await this.client.get<{ data: LstWithStats[] }>(
      `/lsts/${mintOrSymbol}`
    );
    return response.data.data;
  }

  /**
   * Get LST APYs by mint address or symbol
   * @param mintOrSymbol - Mint address or symbol of the LST
   * @param limit - Optional limit on number of APYs to return
   * @returns Array of epoch APY data
   */
  async getLstApys(mintOrSymbol: string, limit?: number): Promise<EpochApy[]> {
    const params: any = {};
    if (limit) {
      params.limit = limit.toString();
    }

    const response = await this.client.get<{ data: EpochApy[] }>(
      `/lsts/${mintOrSymbol}/apys`,
      { params }
    );
    return response.data.data;
  }

  // ==================== Validator Endpoints ====================

  /**
   * Get all validators' APYs
   * @returns Record of validator vote accounts to APY records
   */
  async getValidatorApys(): Promise<Record<string, ValidatorApyRecord>> {
    const response = await this.client.get<Record<string, ValidatorApyRecord>>(
      "/validators/apy"
    );
    return response.data;
  }

  // ==================== Token Swap Endpoints ====================

  /**
   * Get token swap order quote and unsigned transaction
   * @param params - Token order parameters
   * @returns Token order response with transaction
   */
  async getTokenSwapOrder(
    params: TokenOrderParams
  ): Promise<TokenOrderResponse> {
    const queryParams: any = {
      inp: params.inp,
      out: params.out,
      amt: params.amt,
    };

    if (params.mode) queryParams.mode = params.mode;
    if (params.signer) queryParams.signer = params.signer;
    if (params.inpAcc) queryParams.inpAcc = params.inpAcc;
    if (params.outAcc) queryParams.outAcc = params.outAcc;
    if (params.slippageBps !== undefined) {
      queryParams.slippageBps = params.slippageBps;
    }
    if (params.swapSrc && params.swapSrc.length > 0) {
      queryParams.swapSrc = params.swapSrc;
    }

    const response = await this.client.get<TokenOrderResponse>(
      "/swap/token/order",
      { params: queryParams }
    );
    return response.data;
  }

  /**
   * Execute signed token swap transaction
   * @param signedTx - Base64 encoded signed transaction
   * @param orderResponse - Original order response from getTokenSwapOrder
   * @returns Transaction signature
   */
  async executeTokenSwap(
    signedTx: string,
    orderResponse: TokenOrderResponse
  ): Promise<string> {
    const response = await this.client.post<ExecuteResponse>(
      "/swap/token/execute",
      {
        signedTx,
        orderResponse: {
          swapSrcData: orderResponse.swapSrcData,
        },
      }
    );
    return response.data.signature;
  }

  // ==================== Deposit Stake Endpoints ====================

  /**
   * Get deposit stake order quote and unsigned transaction
   * @param params - Deposit stake parameters
   * @returns Deposit stake order response
   */
  async getDepositStakeOrder(
    params: DepositStakeOrderParams
  ): Promise<DepositStakeOrderResponse> {
    const queryParams: any = {
      out: params.out,
      inpAcc: params.inpAcc,
    };

    if (params.mode) queryParams.mode = params.mode;
    if (params.signer) queryParams.signer = params.signer;
    if (params.outAcc) queryParams.outAcc = params.outAcc;

    const response = await this.client.get<DepositStakeOrderResponse>(
      "/swap/depositStake/order",
      { params: queryParams }
    );
    return response.data;
  }

  /**
   * Execute signed deposit stake transaction
   * @param signedTx - Base64 encoded signed transaction
   * @returns Transaction signature
   */
  async executeDepositStake(signedTx: string): Promise<string> {
    const response = await this.client.post<ExecuteResponse>(
      "/swap/depositStake/execute",
      { signedTx }
    );
    return response.data.signature;
  }

  // ==================== Withdraw Stake Endpoints ====================

  /**
   * Get withdraw stake order quote and unsigned transaction
   * @param params - Withdraw stake parameters
   * @returns Withdraw stake order response
   */
  async getWithdrawStakeOrder(
    params: WithdrawStakeOrderParams
  ): Promise<WithdrawStakeOrderResponse> {
    const queryParams: any = {
      inp: params.inp,
      amt: params.amt,
    };

    if (params.out) queryParams.out = params.out;
    if (params.mode) queryParams.mode = params.mode;
    if (params.signer) queryParams.signer = params.signer;
    if (params.inpAcc) queryParams.inpAcc = params.inpAcc;
    if (params.bridgeStakeSeed !== undefined) {
      queryParams.bridgeStakeSeed = params.bridgeStakeSeed;
    }
    if (params.deactivate) queryParams.deactivate = params.deactivate;

    const response = await this.client.get<WithdrawStakeOrderResponse>(
      "/swap/withdrawStake/order",
      { params: queryParams }
    );
    return response.data;
  }

  /**
   * Execute signed withdraw stake transaction
   * @param signedTx - Base64 encoded signed transaction
   * @returns Transaction signature
   */
  async executeWithdrawStake(signedTx: string): Promise<string> {
    const response = await this.client.post<ExecuteResponse>(
      "/swap/withdrawStake/execute",
      { signedTx }
    );
    return response.data.signature;
  }

  // ==================== Helper Methods ====================

  /**
   * Calculate total fee amount from fee info array
   * @param fees - Array of fee information
   * @returns Total fee amount as string
   */
  static calculateTotalFees(fees: FeeInfo[]): string {
    return fees
      .reduce((sum, fee) => sum + BigInt(fee.amount), BigInt(0))
      .toString();
  }

  /**
   * Get swap source name from swap source data
   * @param swapSrcData - Swap source data
   * @returns Swap source name
   */
  static getSwapSource(swapSrcData: SwapSrcData): SwapSrc {
    return swapSrcData.swapSrc;
  }

  /**
   * Check if LST is supported by checking if it exists
   * @param mintOrSymbol - Mint address or symbol
   * @returns Boolean indicating if LST exists
   */
  async isLstSupported(mintOrSymbol: string): Promise<boolean> {
    try {
      const lsts = await this.getLst(mintOrSymbol);
      return lsts.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get best APY from LST list
   * @param lsts - Array of LSTs
   * @returns LST with highest latest APY
   */
  static getBestApy(lsts: LstWithStats[]): LstWithStats | null {
    if (lsts.length === 0) return null;

    return lsts.reduce((best, current) => {
      const bestApy = best.latestApy ?? -Infinity;
      const currentApy = current.latestApy ?? -Infinity;
      return currentApy > bestApy ? current : best;
    });
  }

  /**
   * Filter LSTs by minimum APY
   * @param lsts - Array of LSTs
   * @param minApy - Minimum APY threshold
   * @returns Filtered array of LSTs
   */
  static filterByMinApy(lsts: LstWithStats[], minApy: number): LstWithStats[] {
    return lsts.filter((lst) => (lst.latestApy ?? 0) >= minApy);
  }

  /**
   * Sort LSTs by TVL descending
   * @param lsts - Array of LSTs
   * @returns Sorted array of LSTs
   */
  static sortByTvl(lsts: LstWithStats[]): LstWithStats[] {
    return [...lsts].sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0));
  }

  /**
   * Parse base64 transaction to Transaction object
   * @param base64Tx - Base64 encoded transaction
   * @returns Transaction object
   */
  static parseTransaction(base64Tx: string): Transaction {
    const buffer = Buffer.from(base64Tx, "base64");
    return Transaction.from(buffer);
  }

  /**
   * Serialize signed transaction to base64
   * @param transaction - Signed Transaction object
   * @returns Base64 encoded transaction
   */
  static serializeTransaction(transaction: Transaction): string {
    return transaction.serialize().toString("base64");
  }
}

// ==================== Export Default Instance Creator ====================

/**
 * Create a new Sanctum service instance
 * @param apiKey - Sanctum API key
 * @param baseURL - Optional custom base URL
 * @returns SanctumService instance
 */
export function createSanctumService(
  apiKey: string,
  baseURL?: string
): SanctumService {
  return new SanctumService(apiKey, baseURL);
}

export default SanctumService;
