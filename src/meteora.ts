import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair,
} from "@solana/web3.js";
import { BN, Program, AnchorProvider } from "@coral-xyz/anchor";
import DLMM from "@meteora-ag/dlmm";
import { CpAmm } from "@meteora-ag/cp-amm-sdk";
import VaultImpl, {
  AffiliateInfo as VaultSdkAffiliateInfo,
} from "@meteora-ag/vault-sdk";
import {
  StaticTokenListResolutionStrategy,
  TokenInfo,
} from "@solana/spl-token-registry";

/**
 * Meteora cluster configuration
 */
export type MeteoraCluster = "mainnet-beta" | "devnet" | "testnet";

/**
 * Vault state and LP mint information
 */
export interface VaultStateAndLp {
  vaultPda: PublicKey;
  vaultState: any;
  vaultLpMint: any;
}

/**
 * Strategy state information
 */
export interface StrategyState {
  currentLiquidity: BN;
  performanceFee?: BN;
  strategyPubkey?: PublicKey;
}

/**
 * Affiliate partnership information
 */
export type AffiliateInfo = VaultSdkAffiliateInfo;

/**
 * Vault details with APY and allocation info
 */
export interface VaultDetails {
  lpSupply: string;
  withdrawableAmount: number;
  virtualPrice: number;
  usd_rate: number;
  closest_apy: number;
  average_apy: number;
  long_apy: number;
  earned_amount: number;
  virtual_price: number;
  total_amount: number;
  total_amount_with_profit: number;
  token_amount: number;
  fee_amount: number;
  lp_supply: number;
  strategyAllocation: Array<{
    name: string;
    liquidity: number;
    allocation: string;
    maxAllocation: number;
  }>;
}

/**
 * Comprehensive Meteora Finance Service
 * Supports DLMM, DAMM v2, Alpha Vault, and Dynamic Vault
 *
 * @author Vairamuthu M
 * @version 1.0.0
 */
export class MeteoraService {
  private connection: Connection;
  private cluster: MeteoraCluster;
  private wallet?: Keypair;

  /**
   * API endpoints for each cluster
   */
  private static readonly KEEPER_URLS = {
    "mainnet-beta": "https://app.meteora.ag/vault/api",
    devnet: "https://devnet-app.meteora.ag/vault/api",
    testnet: "https://testnet-app.meteora.ag/vault/api",
  };

  /**
   * Meteora program IDs
   */
  static readonly PROGRAM_IDS = {
    DLMM_MAINNET: new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"),
    DLMM_DEVNET: new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"),
    VAULT_MAINNET: new PublicKey("vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2"),
    VAULT_DEVNET: new PublicKey("vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2"),
  };

  /**
   * Initialize Meteora service
   * @param connection Solana RPC connection
   * @param cluster Network cluster
   * @param wallet Optional wallet keypair for signing transactions
   */
  constructor(
    connection: Connection,
    cluster: MeteoraCluster = "mainnet-beta",
    wallet?: Keypair
  ) {
    this.connection = connection;
    this.cluster = cluster;
    this.wallet = wallet;
  }

  // ============================================
  // DLMM (Dynamic Liquidity Market Maker)
  // ============================================

  /**
   * Create a single DLMM pool instance
   */
  async createDLMMPool(poolAddress: PublicKey): Promise<DLMM> {
    try {
      return await DLMM.create(this.connection, poolAddress);
    } catch (error) {
      throw this.handleError("createDLMMPool", error);
    }
  }

  /**
   * Create multiple DLMM pool instances
   */
  async createMultipleDLMMPools(poolAddresses: PublicKey[]): Promise<DLMM[]> {
    try {
      return await DLMM.createMultiple(this.connection, poolAddresses);
    } catch (error) {
      throw this.handleError("createMultipleDLMMPools", error);
    }
  }

  /**
   * Get all available DLMM pools from API
   */
  async getAllDLMMPools(): Promise<any[]> {
    try {
      const response = await fetch("https://dlmm-api.meteora.ag/pair/all");
      return await response.json();
    } catch (error) {
      throw this.handleError("getAllDLMMPools", error);
    }
  }

  /**
   * Add liquidity to DLMM pool
   */
  async addDLMMLiquidity(
    pool: DLMM,
    params: {
      positionPubKey: PublicKey;
      totalXAmount: BN;
      totalYAmount: BN;
      strategy: any;
      slippage: number;
    }
  ): Promise<Transaction> {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for adding liquidity");
      }
      return await pool.addLiquidityByStrategy({
        positionPubKey: params.positionPubKey,
        totalXAmount: params.totalXAmount,
        totalYAmount: params.totalYAmount,
        strategy: params.strategy,
        slippage: params.slippage,
        user: this.wallet.publicKey,
      });
    } catch (error) {
      throw this.handleError("addDLMMLiquidity", error);
    }
  }

  /**
   * Remove liquidity from DLMM pool
   */
  async removeDLMMLiquidity(
    pool: DLMM,
    params: {
      position: PublicKey;
      bps: BN;
      shouldClaimAndClose: boolean;
      fromBinId?: number;
      toBinId?: number;
    }
  ): Promise<Transaction[]> {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for removing liquidity");
      }
      return await pool.removeLiquidity({
        position: params.position,
        user: this.wallet.publicKey,
        fromBinId: params.fromBinId ?? 0,
        toBinId: params.toBinId ?? 0,
        bps: params.bps,
        shouldClaimAndClose: params.shouldClaimAndClose,
      });
    } catch (error) {
      throw this.handleError("removeDLMMLiquidity", error);
    }
  }

  /**
   * Swap tokens on DLMM pool
   */
  async swapDLMM(
    pool: DLMM,
    params: {
      inAmount: BN;
      inToken: PublicKey;
      binArrays: PublicKey[];
      swapYtoX: boolean;
    }
  ): Promise<Transaction> {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for swap");
      }
      return await pool.swap({
        inAmount: params.inAmount,
        inToken: params.inToken,
        binArrays: params.binArrays,
        swapYtoX: params.swapYtoX,
        user: this.wallet.publicKey,
      } as any);
    } catch (error) {
      throw this.handleError("swapDLMM", error);
    }
  }

  // ============================================
  // DAMM v2 (Constant Product AMM)
  // ============================================

  /**
   * Create DAMM v2 instance
   */
  createDAMMInstance(): CpAmm {
    return new CpAmm(this.connection);
  }

  /**
   * Get pool information from DAMM v2
   */
  async getDAMMPoolInfo(cpAmm: CpAmm, poolAddress: PublicKey): Promise<any> {
    try {
      return await (cpAmm as any).getPoolInfo(poolAddress);
    } catch (error) {
      throw this.handleError("getDAMMPoolInfo", error);
    }
  }

  /**
   * Add liquidity to DAMM v2 pool
   */
  async addDAMMLiquidity(
    cpAmm: CpAmm,
    params: {
      poolAddress: PublicKey;
      tokenAAmount: BN;
      tokenBAmount: BN;
      minLpTokenAmount: BN;
    }
  ): Promise<Transaction> {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for adding liquidity");
      }
      return await cpAmm.addLiquidity({
        pool: params.poolAddress,
        tokenAAmount: params.tokenAAmount,
        tokenBAmount: params.tokenBAmount,
        minLpTokenAmount: params.minLpTokenAmount,
        user: this.wallet.publicKey,
      } as any);
    } catch (error) {
      throw this.handleError("addDAMMLiquidity", error);
    }
  }

  /**
   * Remove liquidity from DAMM v2 pool
   */
  async removeDAMMLiquidity(
    cpAmm: CpAmm,
    params: {
      poolAddress: PublicKey;
      lpTokenAmount: BN;
      minTokenAAmount: BN;
      minTokenBAmount: BN;
    }
  ): Promise<Transaction> {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for removing liquidity");
      }
      return await cpAmm.removeLiquidity({
        pool: params.poolAddress,
        lpTokenAmount: params.lpTokenAmount,
        minTokenAAmount: params.minTokenAAmount,
        minTokenBAmount: params.minTokenBAmount,
        user: this.wallet.publicKey,
      } as any);
    } catch (error) {
      throw this.handleError("removeDAMMLiquidity", error);
    }
  }

  /**
   * Swap tokens on DAMM v2 pool
   */
  async swapDAMM(
    cpAmm: CpAmm,
    params: {
      poolAddress: PublicKey;
      tokenIn: PublicKey;
      inAmount: BN;
      minOutAmount: BN;
    }
  ): Promise<Transaction> {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for swap");
      }
      return await cpAmm.swap({
        pool: params.poolAddress,
        tokenIn: params.tokenIn,
        inAmount: params.inAmount,
        minOutAmount: params.minOutAmount,
        user: this.wallet.publicKey,
      } as any);
    } catch (error) {
      throw this.handleError("swapDAMM", error);
    }
  }

  // ============================================
  // DYNAMIC VAULT
  // ============================================

  /**
   * Create a Dynamic Vault instance
   */
  async createVault(
    tokenInfo: TokenInfo,
    options?: {
      seedBaseKey?: PublicKey;
      affiliateId?: PublicKey;
      programId?: string;
    }
  ): Promise<VaultImpl> {
    try {
      return await VaultImpl.create(
        this.connection,
        new PublicKey(tokenInfo.address),
        {
          cluster: this.cluster,
          ...options,
        }
      );
    } catch (error) {
      throw this.handleError("createVault", error);
    }
  }

  /**
   * Create multiple Dynamic Vault instances
   */
  async createMultipleVaults(
    tokenMints: PublicKey[],
    options?: {
      seedBaseKey?: PublicKey;
      affiliateId?: PublicKey;
      programId?: string;
    }
  ): Promise<VaultImpl[]> {
    try {
      return await VaultImpl.createMultiple(this.connection, tokenMints, {
        cluster: this.cluster,
        ...options,
      });
    } catch (error) {
      throw this.handleError("createMultipleVaults", error);
    }
  }

  /**
   * Create permissionless vault instruction
   */
  async createPermissionlessVault(
    payer: PublicKey,
    tokenMint: PublicKey,
    programId?: string
  ): Promise<TransactionInstruction> {
    try {
      return await VaultImpl.createPermissionlessVaultInstruction(
        this.connection,
        payer,
        tokenMint,
        {
          cluster: this.cluster,
          programId,
        }
      );
    } catch (error) {
      throw this.handleError("createPermissionlessVault", error);
    }
  }

  /**
   * Deposit tokens into vault
   */
  async depositToVault(
    vault: VaultImpl,
    owner: PublicKey,
    amount: BN
  ): Promise<Transaction> {
    try {
      return await vault.deposit(owner, amount);
    } catch (error) {
      throw this.handleError("depositToVault", error);
    }
  }

  /**
   * Withdraw tokens from vault
   */
  async withdrawFromVault(
    vault: VaultImpl,
    owner: PublicKey,
    lpAmount: BN
  ): Promise<Transaction> {
    try {
      return await vault.withdraw(owner, lpAmount);
    } catch (error) {
      throw this.handleError("withdrawFromVault", error);
    }
  }

  /**
   * Get user's LP token balance in vault
   */
  async getVaultUserBalance(vault: VaultImpl, owner: PublicKey): Promise<BN> {
    try {
      return await vault.getUserBalance(owner);
    } catch (error) {
      throw this.handleError("getVaultUserBalance", error);
    }
  }

  /**
   * Get total LP supply of vault
   */
  async getVaultSupply(vault: VaultImpl): Promise<BN> {
    try {
      return await vault.getVaultSupply();
    } catch (error) {
      throw this.handleError("getVaultSupply", error);
    }
  }

  /**
   * Get withdrawable amount from vault
   */
  async getVaultWithdrawableAmount(vault: VaultImpl): Promise<BN> {
    try {
      return await vault.getWithdrawableAmount();
    } catch (error) {
      throw this.handleError("getVaultWithdrawableAmount", error);
    }
  }

  /**
   * Get vault strategies state
   */
  async getVaultStrategies(vault: VaultImpl): Promise<StrategyState[]> {
    try {
      return await vault.getStrategiesState();
    } catch (error) {
      throw this.handleError("getVaultStrategies", error);
    }
  }

  /**
   * Get affiliate info for vault
   */
  async getVaultAffiliateInfo(vault: VaultImpl): Promise<AffiliateInfo> {
    try {
      return await vault.getAffiliateInfo();
    } catch (error) {
      throw this.handleError("getVaultAffiliateInfo", error);
    }
  }

  /**
   * Refresh vault state
   */
  async refreshVaultState(vault: VaultImpl): Promise<void> {
    try {
      await vault.refreshVaultState();
    } catch (error) {
      throw this.handleError("refreshVaultState", error);
    }
  }

  /**
   * Fetch multiple user balances across vaults
   */
  async fetchMultipleUserBalances(
    lpMintList: PublicKey[],
    owner: PublicKey
  ): Promise<BN[]> {
    try {
      return await VaultImpl.fetchMultipleUserBalance(
        this.connection,
        lpMintList,
        owner
      );
    } catch (error) {
      throw this.handleError("fetchMultipleUserBalances", error);
    }
  }

  /**
   * Get comprehensive vault details including APY from API
   */
  async getVaultDetails(
    vault: VaultImpl,
    tokenInfo: TokenInfo
  ): Promise<VaultDetails> {
    try {
      const vaultUnlockedAmount = (
        await vault.getWithdrawableAmount()
      ).toNumber();
      const vaultSupplyBn = await vault.getVaultSupply();
      const virtualPrice = vaultSupplyBn.isZero()
        ? 0
        : vaultUnlockedAmount / vaultSupplyBn.toNumber();

      const apiUrl = MeteoraService.KEEPER_URLS[this.cluster];
      const response = await fetch(
        `${apiUrl}/vault_state/${tokenInfo.address}`
      );
      const vaultStateAPI = await response.json();

      const totalAllocation = vaultStateAPI.strategies.reduce(
        (acc: number, item: any) => acc + item.liquidity,
        vaultStateAPI.token_amount
      );

      return {
        lpSupply: (await vault.getVaultSupply()).toString(),
        withdrawableAmount: vaultUnlockedAmount,
        virtualPrice,
        usd_rate: vaultStateAPI.usd_rate,
        closest_apy: vaultStateAPI.closest_apy,
        average_apy: vaultStateAPI.average_apy,
        long_apy: vaultStateAPI.long_apy,
        earned_amount: vaultStateAPI.earned_amount,
        virtual_price: vaultStateAPI.virtual_price,
        total_amount: vaultStateAPI.total_amount,
        total_amount_with_profit: vaultStateAPI.total_amount_with_profit,
        token_amount: vaultStateAPI.token_amount,
        fee_amount: vaultStateAPI.fee_amount,
        lp_supply: vaultStateAPI.lp_supply,
        strategyAllocation: vaultStateAPI.strategies
          .map((item: any) => ({
            name: item.strategy_name,
            liquidity: item.liquidity,
            allocation: ((item.liquidity / totalAllocation) * 100).toFixed(0),
            maxAllocation: item.max_allocation,
          }))
          .concat({
            name: "Vault Reserves",
            liquidity: vaultStateAPI.token_amount,
            allocation: (
              (vaultStateAPI.token_amount / totalAllocation) *
              100
            ).toFixed(0),
            maxAllocation: 0,
          })
          .sort((a: any, b: any) => b.liquidity - a.liquidity),
      };
    } catch (error) {
      throw this.handleError("getVaultDetails", error);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get token info by symbol from SPL Token Registry
   */
  async getTokenInfo(symbol: string): Promise<TokenInfo | undefined> {
    try {
      const tokenMap = new StaticTokenListResolutionStrategy().resolve();
      return tokenMap.find((token) => token.symbol === symbol);
    } catch (error) {
      throw this.handleError("getTokenInfo", error);
    }
  }

  /**
   * Airdrop SOL to wallet (devnet only)
   */
  async airdropSOL(publicKey: PublicKey, amount = 1): Promise<string> {
    try {
      if (this.cluster !== "devnet") {
        throw new Error("Airdrop only available on devnet");
      }

      const airdropSignature = await this.connection.requestAirdrop(
        publicKey,
        amount * 1e9
      );

      const latestBlockHash = await this.connection.getLatestBlockhash();
      await this.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      });

      return airdropSignature;
    } catch (error) {
      throw this.handleError("airdropSOL", error);
    }
  }

  /**
   * Get current connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get current cluster
   */
  getCluster(): MeteoraCluster {
    return this.cluster;
  }

  /**
   * Get wallet (if set)
   */
  getWallet(): Keypair | undefined {
    return this.wallet;
  }

  /**
   * Set wallet for transactions
   */
  setWallet(wallet: Keypair): void {
    this.wallet = wallet;
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private handleError(method: string, error: any): Error {
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    console.error(`[MeteoraService:${method}] Error:`, errorMessage);
    return new Error(`${method} failed: ${errorMessage}`);
  }
}

export default MeteoraService;
