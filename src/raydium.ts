import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  Raydium,
  TxVersion,
  API_URLS,
  parseTokenAccountResp,
  ApiV3PoolInfoStandardItem,
  Router,
  TokenAmount,
  Token,
  AmmV4Keys,
  AmmRpcData,
} from "@raydium-io/raydium-sdk-v2";
import {
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import axios, { AxiosInstance } from "axios";
import BN from "bn.js";
import Decimal from "decimal.js";

/**
 * Swap compute response from Raydium API
 */
export interface SwapCompute {
  id: string;
  success: true;
  version: "V0" | "V1";
  data: {
    swapType: "BaseIn" | "BaseOut";
    inputMint: string;
    inputAmount: string;
    outputMint: string;
    outputAmount: string;
    otherAmountThreshold: string;
    slippageBps: number;
    priceImpactPct: number;
    routePlan: Array<{
      poolId: string;
      inputMint: string;
      outputMint: string;
      feeMint: string;
      feeRate: number;
      feeAmount: string;
    }>;
  };
}

/**
 * Priority fee levels from Raydium API
 */
export interface PriorityFee {
  vh: number; // very high
  h: number; // high
  m: number; // medium
}

/**
 * Swap parameters
 */
export interface SwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippage: number;
  txVersion?: "V0" | "LEGACY";
  priorityLevel?: keyof PriorityFee;
}

/**
 * Pool route options
 */
export interface RouteSwapOptions {
  inputMint: PublicKey;
  outputMint: PublicKey;
  inputAmount: string;
  slippage: number;
  txVersion?: TxVersion;
}

/**
 * Farm operations params
 */
export interface FarmOperationParams {
  farmId: string;
  amount: BN;
  txVersion?: TxVersion;
}

/**
 * Comprehensive Raydium V2 Service
 * Full support for API swaps, SDK swaps, routing, farms, pools, and launchpad
 *
 * @author Vairamuthu M
 * @version 2.0.0
 */
export class RaydiumV2Service {
  private connection: Connection;
  private owner: Keypair;
  private raydium?: Raydium;
  private apiClient: AxiosInstance;

  /**
   * Initialize Raydium V2 service
   * @param rpcUrl RPC endpoint
   * @param ownerKeypair Wallet keypair for signing
   */
  constructor(rpcUrl: string, ownerKeypair: Keypair) {
    this.connection = new Connection(rpcUrl, { commitment: "confirmed" });
    this.owner = ownerKeypair;

    // Initialize API client
    this.apiClient = axios.create({
      timeout: 30000,
    });
  }

  /**
   * Load and initialize Raydium SDK
   */
  async initialize(options?: {
    disableLoadToken?: boolean;
    tokenAccounts?: any[];
    tokenAccountRawInfos?: any[];
  }): Promise<void> {
    try {
      this.raydium = await Raydium.load({
        connection: this.connection,
        owner: this.owner,
        disableLoadToken: options?.disableLoadToken ?? false,
        tokenAccounts: options?.tokenAccounts,
        tokenAccountRawInfos: options?.tokenAccountRawInfos,
      });
    } catch (error) {
      throw this.handleError("initialize", error);
    }
  }

  /**
   * Ensure Raydium is initialized
   */
  private ensureInitialized(): Raydium {
    if (!this.raydium) {
      throw new Error("Raydium not initialized. Call initialize() first.");
    }
    return this.raydium;
  }

  // ============================================
  // TOKEN ACCOUNT MANAGEMENT
  // ============================================

  /**
   * Parse and get all token accounts for owner
   */
  async fetchTokenAccountData(): Promise<{
    tokenAccounts: any[];
    tokenAccountRawInfos: any[];
  }> {
    try {
      const solAccountResp = await this.connection.getAccountInfo(
        this.owner.publicKey
      );
      const tokenAccountResp = await this.connection.getTokenAccountsByOwner(
        this.owner.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      const token2022Req = await this.connection.getTokenAccountsByOwner(
        this.owner.publicKey,
        { programId: ASSOCIATED_TOKEN_PROGRAM_ID }
      );

      const tokenAccountData = parseTokenAccountResp({
        owner: this.owner.publicKey,
        solAccountResp,
        tokenAccountResp: {
          context: tokenAccountResp.context,
          value: [...tokenAccountResp.value, ...token2022Req.value],
        },
      });

      return {
        tokenAccounts: tokenAccountData.tokenAccounts,
        tokenAccountRawInfos: tokenAccountData.tokenAccountRawInfos,
      };
    } catch (error) {
      throw this.handleError("fetchTokenAccountData", error);
    }
  }

  // ============================================
  // API METHODS
  // ============================================

  /**
   * Get Raydium token list (mainnet only)
   */
  async getTokenList(): Promise<any[]> {
    try {
      const raydium = this.ensureInitialized();
      const result = await raydium.api.getTokenList();
      return result.mintList || [];
    } catch (error) {
      throw this.handleError("getTokenList", error);
    }
  }

  /**
   * Get token info by mint addresses
   */
  async getTokenInfo(mints: string[]): Promise<any[]> {
    try {
      const raydium = this.ensureInitialized();
      return await raydium.api.getTokenInfo(mints);
    } catch (error) {
      throw this.handleError("getTokenInfo", error);
    }
  }

  /**
   * Get pool list with optional filters
   */
  async getPoolList(params: any = {}): Promise<any> {
    try {
      const raydium = this.ensureInitialized();
      return await raydium.api.getPoolList(params);
    } catch (error) {
      throw this.handleError("getPoolList", error);
    }
  }

  /**
   * Get pool info by pool IDs (comma-separated)
   */
  async getPoolById(ids: string): Promise<any[]> {
    try {
      const raydium = this.ensureInitialized();
      return await raydium.api.fetchPoolById({ ids });
    } catch (error) {
      throw this.handleError("getPoolById", error);
    }
  }

  /**
   * Get pools by mint addresses
   */
  async getPoolByMints(mint1: string, mint2?: string): Promise<any> {
    try {
      const raydium = this.ensureInitialized();
      return await raydium.api.fetchPoolByMints({ mint1, mint2 });
    } catch (error) {
      throw this.handleError("getPoolByMints", error);
    }
  }

  /**
   * Get farm info by farm IDs
   */
  async getFarmInfoById(ids: string): Promise<any[]> {
    try {
      const raydium = this.ensureInitialized();
      return await raydium.api.fetchFarmInfoById({ ids });
    } catch (error) {
      throw this.handleError("getFarmInfoById", error);
    }
  }

  /**
   * Get priority fees from Raydium API
   */
  async getPriorityFees(): Promise<PriorityFee> {
    try {
      const { data } = await this.apiClient.get<{
        id: string;
        success: boolean;
        data: { default: PriorityFee };
      }>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`);

      return data.data.default;
    } catch (error) {
      throw this.handleError("getPriorityFees", error);
    }
  }

  // ============================================
  // API SWAP (HTTP-based)
  // ============================================

  /**
   * Compute swap using Raydium API
   */
  async computeSwap(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps: number;
    txVersion: "V0" | "LEGACY";
  }): Promise<SwapCompute> {
    try {
      const { data } = await this.apiClient.get<SwapCompute>(
        `${API_URLS.SWAP_HOST}/compute/swap-base-in`,
        {
          params: {
            inputMint: params.inputMint,
            outputMint: params.outputMint,
            amount: params.amount,
            slippageBps: params.slippageBps,
            txVersion: params.txVersion,
          },
        }
      );
      return data;
    } catch (error) {
      throw this.handleError("computeSwap", error);
    }
  }

  /**
   * Build swap transaction using Raydium API
   */
  async buildSwapTransaction(
    swapResponse: SwapCompute,
    options: {
      txVersion: "V0" | "LEGACY";
      wrapSol: boolean;
      unwrapSol: boolean;
      inputAccount?: string;
      outputAccount?: string;
      computeUnitPriceMicroLamports?: number;
    }
  ): Promise<Array<Transaction | VersionedTransaction>> {
    try {
      const priorityFees = await this.getPriorityFees();

      const { data: swapTransactions } = await this.apiClient.post<{
        id: string;
        version: string;
        success: boolean;
        data: Array<{ transaction: string }>;
      }>(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
        computeUnitPriceMicroLamports:
          options.computeUnitPriceMicroLamports?.toString() ||
          String(priorityFees.h),
        swapResponse,
        txVersion: options.txVersion,
        wallet: this.owner.publicKey.toBase58(),
        wrapSol: options.wrapSol,
        unwrapSol: options.unwrapSol,
        inputAccount: options.inputAccount,
        outputAccount: options.outputAccount,
      });

      const isV0 = options.txVersion === "V0";
      return swapTransactions.data.map((tx) => {
        const txBuf = Buffer.from(tx.transaction, "base64");
        return isV0
          ? VersionedTransaction.deserialize(txBuf)
          : Transaction.from(txBuf);
      });
    } catch (error) {
      throw this.handleError("buildSwapTransaction", error);
    }
  }

  /**
   * Execute API swap (compute + build + send)
   */
  async executeApiSwap(params: SwapParams): Promise<string[]> {
    try {
      const { tokenAccounts } = await this.fetchTokenAccountData();

      const [isInputSol, isOutputSol] = [
        params.inputMint === NATIVE_MINT.toBase58(),
        params.outputMint === NATIVE_MINT.toBase58(),
      ];

      const inputTokenAcc = tokenAccounts.find(
        (a: any) => a.mint.toBase58() === params.inputMint
      )?.publicKey;
      const outputTokenAcc = tokenAccounts.find(
        (a: any) => a.mint.toBase58() === params.outputMint
      )?.publicKey;

      if (!inputTokenAcc && !isInputSol) {
        throw new Error("Input token account not found");
      }

      // Compute swap
      const swapResponse = await this.computeSwap({
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        amount: params.amount,
        slippageBps: params.slippage * 100,
        txVersion: params.txVersion || "V0",
      });

      // Build transactions
      const transactions = await this.buildSwapTransaction(swapResponse, {
        txVersion: params.txVersion || "V0",
        wrapSol: isInputSol,
        unwrapSol: isOutputSol,
        inputAccount: isInputSol ? undefined : inputTokenAcc?.toBase58(),
        outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58(),
      });

      // Send transactions
      const signatures: string[] = [];
      const isV0 = params.txVersion === "V0";

      for (const tx of transactions) {
        if (isV0) {
          const versionedTx = tx as VersionedTransaction;
          versionedTx.sign([this.owner]);
          const txId = await this.connection.sendTransaction(versionedTx, {
            skipPreflight: true,
          });
          await this.connection.confirmTransaction(txId, "confirmed");
          signatures.push(txId);
        } else {
          const legacyTx = tx as Transaction;
          legacyTx.sign(this.owner);
          const txId = await sendAndConfirmTransaction(
            this.connection,
            legacyTx,
            [this.owner],
            { skipPreflight: true }
          );
          signatures.push(txId);
        }
      }

      return signatures;
    } catch (error) {
      throw this.handleError("executeApiSwap", error);
    }
  }

  // ============================================
  // SDK SWAP (Direct on-chain)
  // ============================================

  /**
   * Swap using SDK (single pool)
   */
  async swapSdk(params: {
    poolId: string;
    inputMint: string;
    amountIn: BN;
    slippage?: number;
    txVersion?: TxVersion;
  }): Promise<{ txId: string }> {
    try {
      const raydium = this.ensureInitialized();

      let poolInfo: ApiV3PoolInfoStandardItem;
      let poolKeys: AmmV4Keys;
      let rpcData: AmmRpcData;

      if (raydium.cluster === "mainnet") {
        const data = await raydium.api.fetchPoolById({ ids: params.poolId });
        poolInfo = data[0] as ApiV3PoolInfoStandardItem;
        poolKeys = await raydium.liquidity.getAmmPoolKeys(params.poolId);
        rpcData = await raydium.liquidity.getRpcPoolInfo(params.poolId);
      } else {
        const data = await raydium.liquidity.getPoolInfoFromRpc({
          poolId: params.poolId,
        });
        poolInfo = data.poolInfo;
        poolKeys = data.poolKeys;
        rpcData = data.poolRpcData;
      }

      const baseIn = params.inputMint === poolInfo.mintA.address;
      const [mintIn, mintOut] = baseIn
        ? [poolInfo.mintA, poolInfo.mintB]
        : [poolInfo.mintB, poolInfo.mintA];

      const out = raydium.liquidity.computeAmountOut({
        poolInfo: {
          ...poolInfo,
          baseReserve: rpcData.baseReserve,
          quoteReserve: rpcData.quoteReserve,
          status: rpcData.status.toNumber(),
          version: 4,
        },
        amountIn: params.amountIn,
        mintIn: mintIn.address,
        mintOut: mintOut.address,
        slippage: params.slippage ?? 0.01,
      });

      const { execute } = await raydium.liquidity.swap({
        poolInfo,
        poolKeys,
        amountIn: params.amountIn,
        amountOut: out.minAmountOut,
        fixedSide: "in",
        inputMint: mintIn.address,
        txVersion: params.txVersion ?? TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });
      return { txId };
    } catch (error) {
      throw this.handleError("swapSdk", error);
    }
  }

  // ============================================
  // ROUTE SWAP (Multi-hop routing)
  // ============================================

  /**
   * Execute swap with automatic routing
   */
  async swapWithRoute(options: RouteSwapOptions): Promise<{ txIds: string[] }> {
    try {
      const raydium = this.ensureInitialized();

      // Fetch pool data (should be cached in production)
      const poolData = await raydium.tradeV2.fetchRoutePoolBasicInfo();

      // Get all routes
      const routes = raydium.tradeV2.getAllRoute({
        inputMint: options.inputMint,
        outputMint: options.outputMint,
        ...poolData,
      });

      // Fetch swap data
      const {
        routePathDict,
        mintInfos,
        ammPoolsRpcInfo,
        ammSimulateCache,
        clmmPoolsRpcInfo,
        computeClmmPoolInfo,
        computePoolTickData,
        computeCpmmData,
      } = await raydium.tradeV2.fetchSwapRoutesData({
        routes,
        inputMint: options.inputMint,
        outputMint: options.outputMint,
      });

      // Compute best route
      const swapRoutes = raydium.tradeV2.getAllRouteComputeAmountOut({
        inputTokenAmount: new TokenAmount(
          new Token({
            mint: options.inputMint.toBase58(),
            decimals: mintInfos[options.inputMint.toBase58()].decimals,
            isToken2022: mintInfos[
              options.inputMint.toBase58()
            ].programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID),
          }),
          options.inputAmount
        ),
        directPath: routes.directPath.map(
          (p) =>
            ammSimulateCache[p.id.toBase58()] ||
            computeClmmPoolInfo[p.id.toBase58()] ||
            computeCpmmData[p.id.toBase58()]
        ),
        routePathDict,
        simulateCache: ammSimulateCache,
        tickCache: computePoolTickData,
        mintInfos,
        outputToken: mintInfos[options.outputMint.toBase58()],
        chainTime: Math.floor(Date.now() / 1000),
        slippage: options.slippage,
        epochInfo: await raydium.connection.getEpochInfo(),
      });

      const targetRoute = swapRoutes[0];
      if (!targetRoute) throw new Error("No swap routes found");

      // Get pool keys
      const poolKeys = await raydium.tradeV2.computePoolToPoolKeys({
        pools: targetRoute.poolInfoList,
        ammRpcData: ammPoolsRpcInfo,
        clmmRpcData: clmmPoolsRpcInfo,
      });

      // Execute swap
      const { execute } = await raydium.tradeV2.swap({
        routeProgram: Router,
        txVersion: options.txVersion ?? TxVersion.V0,
        swapInfo: targetRoute,
        swapPoolKeys: poolKeys,
        ownerInfo: {
          associatedOnly: true,
          checkCreateATAOwner: true,
        },
        computeBudgetConfig: {
          units: 600000,
          microLamports: 465915,
        },
      });

      const { txIds } = await execute({ sequentially: true });
      return { txIds };
    } catch (error) {
      throw this.handleError("swapWithRoute", error);
    }
  }

  // ============================================
  // FARM OPERATIONS
  // ============================================

  /**
   * Stake LP tokens in farm
   */
  async stakeFarm(params: FarmOperationParams): Promise<{ txId: string }> {
    try {
      const raydium = this.ensureInitialized();
      const farmInfo = (
        await raydium.api.fetchFarmInfoById({ ids: params.farmId })
      )[0];

      const { execute } = await raydium.farm.deposit({
        farmInfo,
        amount: params.amount,
        txVersion: params.txVersion ?? TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });
      return { txId };
    } catch (error) {
      throw this.handleError("stakeFarm", error);
    }
  }

  /**
   * Unstake LP tokens from farm
   */
  async unstakeFarm(params: FarmOperationParams): Promise<{ txId: string }> {
    try {
      const raydium = this.ensureInitialized();
      const farmInfo = (
        await raydium.api.fetchFarmInfoById({ ids: params.farmId })
      )[0];

      const { execute } = await raydium.farm.withdraw({
        farmInfo,
        amount: params.amount,
        txVersion: params.txVersion ?? TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });
      return { txId };
    } catch (error) {
      throw this.handleError("unstakeFarm", error);
    }
  }

  /**
   * Harvest farm rewards
   */
  async harvestFarm(farmId: string): Promise<{ txId: string }> {
    try {
      const raydium = this.ensureInitialized();
      const farmInfo = (
        await raydium.api.fetchFarmInfoById({ ids: farmId })
      )[0];

      const { execute } = await raydium.farm.withdraw({
        farmInfo,
        amount: new BN(0), // 0 amount means harvest only
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });
      return { txId };
    } catch (error) {
      throw this.handleError("harvestFarm", error);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get owner keypair
   */
  getOwner(): Keypair {
    return this.owner;
  }

  /**
   * Get Raydium instance
   */
  getRaydium(): Raydium | undefined {
    return this.raydium;
  }

  /**
   * Format amount with decimals
   */
  static formatAmount(amount: BN | string, decimals: number): string {
    return new Decimal(amount.toString())
      .div(new Decimal(10).pow(decimals))
      .toString();
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private handleError(method: string, error: any): Error {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      "Unknown error";
    console.error(`[RaydiumV2Service:${method}] Error:`, errorMessage);
    return new Error(`${method} failed: ${errorMessage}`);
  }
}

export default RaydiumV2Service;
